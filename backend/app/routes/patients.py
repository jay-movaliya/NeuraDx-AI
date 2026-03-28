from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user
from app.core.database import get_scans_collection

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("")
async def get_patients(current_user: dict = Depends(get_current_user)):
    """Get all patients for current radiologist"""
    scans_collection = get_scans_collection()
    
    # Get unique patients from scans
    pipeline = [
        {"$match": {"user_id": current_user["user_id"]}},
        {"$group": {
            "_id": "$patient_id",
            "patient_name": {"$first": "$patient_name"},
            "age": {"$first": "$age"},
            "gender": {"$first": "$gender"},
            "contact_no": {"$first": "$contact_no"},
            "email": {"$first": "$email"},
            "total_scans": {"$sum": 1},
            "last_scan": {"$max": "$timestamp"}
        }},
        {"$sort": {"last_scan": -1}}
    ]
    
    patients = await scans_collection.aggregate(pipeline).to_list(100)
    
    for patient in patients:
        patient["patient_id"] = patient.pop("_id")
    
    return {"patients": patients, "total": len(patients)}

@router.get("/{patient_id}")
async def get_patient_details(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Get patient details with scan history"""
    scans_collection = get_scans_collection()
    
    # Get all scans for this patient
    scans = await scans_collection.find({
        "patient_id": patient_id,
        "user_id": current_user["user_id"]
    }).sort("timestamp", -1).to_list(100)
    
    if not scans:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Format scans
    for scan in scans:
        scan["id"] = str(scan["_id"])
        del scan["_id"]
        # Remove large base64 image from list view
        if "annotated_image" in scan:
            scan["has_annotated_image"] = bool(scan["annotated_image"])
            del scan["annotated_image"]
    
    # Patient info
    patient_info = {
        "patient_id": patient_id,
        "patient_name": scans[0]["patient_name"],
        "age": scans[0]["age"],
        "gender": scans[0]["gender"],
        "contact_no": scans[0]["contact_no"],
        "email": scans[0]["email"],
        "total_scans": len(scans),
        "last_scan": scans[0]["timestamp"]
    }
    
    return {"patient": patient_info, "scans": scans}
