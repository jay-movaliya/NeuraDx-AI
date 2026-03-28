from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from pydantic import EmailStr, BaseModel
from app.models.user import UserRegister, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.database import get_users_collection
from app.services.email import send_password_reset_email
import secrets

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=Token)
async def register(user: UserRegister):
    """
    Register new radiologist
    Required: name, email, password, hospital
    """
    users_collection = get_users_collection()
    
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = {
        "name": user.name,
        "email": user.email,
        "password": get_password_hash(user.password),
        "hospital": user.hospital,
        "specialization": None,
        "created_at": datetime.now()
    }
    
    result = await users_collection.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create token
    access_token = create_access_token(
        data={"sub": user_id, "email": user.email}
    )
    
    user_response = UserResponse(
        id=user_id,
        email=user.email,
        name=user.name,
        hospital=user.hospital,
        specialization=None,
        created_at=user_dict["created_at"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Login radiologist
    Required: email, password
    """
    users_collection = get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]}
    )
    
    user_response = UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        hospital=user["hospital"],
        specialization=user.get("specialization"),
        created_at=user["created_at"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout user
    """
    return {
        "message": "Logged out successfully",
        "user_id": current_user["user_id"]
    }

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Send password reset email
    """
    users_collection = get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_token_expiry = datetime.now() + timedelta(hours=1)
    
    # Store token in database
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "reset_token": reset_token,
                "reset_token_expiry": reset_token_expiry
            }
        }
    )
    
    # Send email
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    await send_password_reset_email(
        to_email=request.email,
        user_name=user["name"],
        reset_link=reset_link
    )
    
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password using token
    """
    users_collection = get_users_collection()
    
    # Find user by token
    user = await users_collection.find_one({
        "reset_token": request.token,
        "reset_token_expiry": {"$gt": datetime.now()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Update password and clear token
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": get_password_hash(request.new_password)
            },
            "$unset": {
                "reset_token": "",
                "reset_token_expiry": ""
            }
        }
    )
    
    return {"message": "Password reset successfully"}
