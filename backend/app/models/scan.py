from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Detection(BaseModel):
    confidence: float
    class_id: int = 0
    bbox: dict

class ScanResponse(BaseModel):
    id: str
    patient_name: str
    patient_id: str
    age: int
    gender: str
    contact_no: str
    email: EmailStr
    scan_type: str
    confidence: float
    findings: str
    severity: str
    has_abnormality: bool
    regions_detected: int
    detections: List[Detection] = []
    annotated_image: Optional[str] = None
    image_quality: str
    recommendations: List[str]
    status: str
    timestamp: datetime
    file_name: str
    radiologist_name: str
