from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from datetime import datetime
from app.models.scan import ScanResponse
from app.core.security import get_current_user
from app.core.database import get_scans_collection
from app.services.ai_model import tumor_model
from app.services.email import send_report_email
from app.services.report_generator import generate_pdf_report
from app.core.config import settings
import asyncio

router = APIRouter(prefix="/api/scans", tags=["Scans"])

@router.post("/upload", response_model=ScanResponse)
async def upload_scan(
    file: UploadFile = File(...),
    patient_name: str = Form(...),
    patient_id: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    contact_no: str = Form(...),
    email: str = Form(...),
    scan_type: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload and analyze medical scan
    Required: file, patient_name, patient_id, age, gender, contact_no, email, scan_type
    """
    # Validate required fields
    if not all([patient_name, patient_id, age, gender, contact_no, email, scan_type]):
        raise HTTPException(
            status_code=400, 
            detail="All patient information fields are required"
        )
    
    # Validate file
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    # Run AI analysis
    analysis_result = tumor_model.detect_tumor(contents)
    
    if not analysis_result["success"]:
        raise HTTPException(status_code=400, detail=analysis_result["error"])
    
    # Save to database
    scans_collection = get_scans_collection()
    
    scan_data = {
        "patient_name": patient_name,
        "patient_id": patient_id,
        "age": age,
        "gender": gender,
        "contact_no": contact_no,
        "email": email,
        "scan_type": scan_type,
        "confidence": analysis_result["confidence"],
        "findings": analysis_result["findings"],
        "severity": analysis_result["severity"],
        "has_abnormality": analysis_result["has_abnormality"],
        "regions_detected": analysis_result["regions_detected"],
        "detections": analysis_result.get("detections", []),
        "annotated_image": analysis_result.get("annotated_image", ""),
        "image_quality": analysis_result["image_quality"],
        "recommendations": analysis_result["recommendations"],
        "status": "completed",
        "timestamp": datetime.now(),
        "file_name": file.filename,
        "user_id": current_user["user_id"],
        "radiologist_name": current_user.get("name", "Unknown"),
        "radiologist_email": current_user.get("email", "")
    }
    
    result = await scans_collection.insert_one(scan_data)
    scan_data["id"] = str(result.inserted_id)

    # ── Auto-send email with annotated image ─────────────────────
    if email:
        try:
            pdf_content = generate_pdf_report(scan_data)
            asyncio.ensure_future(send_report_email(
                to_email=email,
                patient_name=patient_name,
                scan_type=scan_type,
                confidence=analysis_result["confidence"],
                findings=analysis_result["findings"],
                pdf_content=pdf_content,
                annotated_image=analysis_result.get("annotated_image", ""),
                has_abnormality=analysis_result["has_abnormality"],
                regions_detected=analysis_result["regions_detected"],
            ))
        except Exception as mail_err:
            pass  # Don't fail the upload if email sending fails

    return ScanResponse(**scan_data)

@router.get("")
async def get_scans(current_user: dict = Depends(get_current_user)):
    """Get all scans for current user"""
    scans_collection = get_scans_collection()
    
    scans = await scans_collection.find(
        {"user_id": current_user["user_id"]}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    for scan in scans:
        scan["id"] = str(scan["_id"])
        del scan["_id"]
    
    return {"scans": scans, "total": len(scans)}

@router.get("/{scan_id}")
async def get_scan(scan_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific scan"""
    from bson import ObjectId
    scans_collection = get_scans_collection()
    
    scan = await scans_collection.find_one({
        "_id": ObjectId(scan_id),
        "user_id": current_user["user_id"]
    })
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan["id"] = str(scan["_id"])
    del scan["_id"]
    
    return scan
