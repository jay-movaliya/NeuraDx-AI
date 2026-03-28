from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_scans: int
    pending_analysis: int
    completed_today: int
    critical_cases: int
    abnormalities_found: int
    average_confidence: float
    accuracy_rate: float
    processing_speed: str
    monthly_scans: int
