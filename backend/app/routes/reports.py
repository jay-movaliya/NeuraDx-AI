from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from datetime import datetime
import io
from bson import ObjectId

from app.core.security import get_current_user
from app.core.database import get_scans_collection
from app.services.report_generator import generate_pdf_report
from app.services.email import send_report_email

router = APIRouter(prefix="/api/scans", tags=["Reports"])

class EmailReportRequest(BaseModel):
    email: EmailStr

@router.get("/{scan_id}/report")
async def download_report(scan_id: str, current_user: dict = Depends(get_current_user)):
    """Generate and download patient report as PDF with annotated scan image"""
    scans_collection = get_scans_collection()

    scan = await scans_collection.find_one({
        "_id": ObjectId(scan_id),
        "user_id": current_user["user_id"]
    })

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    # Use the shared generator — includes annotated image + detection banner
    pdf_bytes = generate_pdf_report(scan)

    filename = (
        f"NeuraDx_Report_{scan.get('patient_name', 'Patient').replace(' ', '_')}"
        f"_{scan_id[:8]}.pdf"
    )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )



@router.post("/{scan_id}/email")
async def email_report(
    scan_id: str,
    request: EmailReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send scan report via email with annotated image"""
    scans_collection = get_scans_collection()
    
    scan = await scans_collection.find_one({
        "_id": ObjectId(scan_id),
        "user_id": current_user["user_id"]
    })
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Generate PDF (includes annotated image)
    pdf_content = generate_pdf_report(scan)
    
    # Send email with inline annotated image
    success = await send_report_email(
        to_email=request.email,
        patient_name=scan.get('patient_name', 'Patient'),
        scan_type=scan.get('scan_type', 'N/A'),
        confidence=scan.get('confidence', 0),
        findings=scan.get('findings', 'No findings available'),
        pdf_content=pdf_content,
        annotated_image=scan.get('annotated_image', ''),
        has_abnormality=scan.get('has_abnormality', False),
        regions_detected=scan.get('regions_detected', 0),
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {
        "message": "Report sent successfully",
        "email": request.email,
        "scan_id": scan_id
    }
