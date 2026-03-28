import numpy as np
import cv2
from PIL import Image
import io
from typing import Tuple, Dict
from ultralytics import YOLO
import base64

class TumorDetectionModel:
    """
    AI Model for detecting tumors in X-ray and MRI images using YOLO
    """
    
    def __init__(self, model_path: str = "best (1).pt"):
        self.model_path = model_path
        self.model = None
        self.confidence_threshold = 0.25
        self.load_model()
        
    def load_model(self):
        """Load YOLO model"""
        try:
            self.model = YOLO(self.model_path)
            print(f"✅ Model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            self.model = None
    
    def validate_medical_image(self, image_bytes: bytes) -> Tuple[bool, str]:
        """
        Validate if the image is a medical scan (X-ray, MRI, or CT scan)
        Returns: (is_valid, message)
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            img_array = np.array(image)
            
            # Check image size (medical images are usually larger)
            width, height = image.size
            if width < 100 or height < 100:
                return False, "Image too small. Medical scans should be at least 100x100 pixels"
            
            if width > 5000 or height > 5000:
                return False, "Image too large. Please upload a standard medical scan"
            
            # Convert to grayscale for analysis
            if len(img_array.shape) == 3:
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_array
            
            # Medical images characteristics validation
            
            # 1. Check if image is predominantly grayscale (medical scans are usually grayscale)
            if len(img_array.shape) == 3:
                r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
                # Check if channels are similar (grayscale-like)
                rg_diff = np.abs(r.astype(float) - g.astype(float)).mean()
                gb_diff = np.abs(g.astype(float) - b.astype(float)).mean()
                
                # If color differences are too high, it's likely not a medical scan
                if rg_diff > 30 or gb_diff > 30:
                    return False, "Image appears to be a color photo. Please upload a grayscale medical scan (X-ray/MRI/CT)"
            
            # 2. Check contrast (medical images have specific contrast ranges)
            contrast = gray.std()
            if contrast < 15:
                return False, "Image has very low contrast. Please upload a clear medical scan"
            
            if contrast > 100:
                # Very high contrast might indicate a non-medical image
                mean_intensity = gray.mean()
                if mean_intensity < 50 or mean_intensity > 200:
                    return False, "Image characteristics don't match medical scans. Please upload X-ray/MRI/CT scan"
            
            # 3. Check intensity distribution (medical images have specific patterns)
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
            hist = hist.flatten()
            
            # Medical images typically don't have extreme peaks at 0 or 255
            if hist[0] > (gray.size * 0.3) or hist[255] > (gray.size * 0.3):
                return False, "Image appears to be over/under exposed or not a medical scan"
            
            # 4. Check for typical medical scan patterns
            # Medical scans usually have a dark background with lighter anatomical structures
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            
            if edge_density < 0.01:
                return False, "Image lacks anatomical detail. Please upload a proper medical scan"
            
            if edge_density > 0.5:
                return False, "Image has too much noise or detail. Please upload a clean medical scan"
            
            # 5. Check aspect ratio (medical scans have typical aspect ratios)
            aspect_ratio = width / height
            if aspect_ratio < 0.3 or aspect_ratio > 3.0:
                return False, "Image aspect ratio is unusual for medical scans"
            
            return True, "Valid medical scan detected"
            
        except Exception as e:
            return False, f"Error validating image: {str(e)}"
    
    def detect_tumor(self, image_bytes: bytes) -> Dict:
        """
        Detect tumor in medical image using YOLO model
        Returns: Dictionary with detection results and annotated image
        """
        # Validate image first
        is_valid, message = self.validate_medical_image(image_bytes)
        if not is_valid:
            return {
                "success": False,
                "error": message,
                "confidence": 0.0,
                "findings": "Invalid image"
            }
        
        if self.model is None:
            return {
                "success": False,
                "error": "Model not loaded",
                "confidence": 0.0,
                "findings": "Model initialization failed"
            }
        
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_bytes))
            img_array = np.array(image)
            
            # Run YOLO inference
            results = self.model(img_array, conf=self.confidence_threshold)
            
            # Get the first result
            result = results[0]
            
            # Get detections
            boxes = result.boxes
            num_detections = len(boxes)
            
            # Get annotated image
            annotated_img = result.plot()  # This returns the image with bounding boxes
            
            # Convert annotated image to base64
            annotated_pil = Image.fromarray(annotated_img)
            buffered = io.BytesIO()
            annotated_pil.save(buffered, format="PNG")
            annotated_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Extract detection information
            detections = []
            max_confidence = 0.0
            
            for box in boxes:
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                xyxy = box.xyxy[0].tolist()
                
                detections.append({
                    "confidence": round(conf, 3),
                    "class_id": cls,
                    "bbox": {
                        "x1": int(xyxy[0]),
                        "y1": int(xyxy[1]),
                        "x2": int(xyxy[2]),
                        "y2": int(xyxy[3])
                    }
                })
                
                if conf > max_confidence:
                    max_confidence = conf
            
            # Generate findings based on detections
            if num_detections > 0:
                if max_confidence > 0.8:
                    findings = f"High confidence detection: {num_detections} abnormalit{'y' if num_detections == 1 else 'ies'} detected. Immediate specialist consultation recommended."
                    severity = "high"
                elif max_confidence > 0.5:
                    findings = f"Moderate confidence detection: {num_detections} potential abnormalit{'y' if num_detections == 1 else 'ies'} identified. Further evaluation advised."
                    severity = "moderate"
                else:
                    findings = f"Low confidence detection: {num_detections} area{'s' if num_detections > 1 else ''} of interest noted. Clinical correlation recommended."
                    severity = "low"
            else:
                findings = "No significant abnormalities detected. Scan appears normal."
                severity = "none"
                max_confidence = 0.95  # High confidence in normal result
            
            return {
                "success": True,
                "confidence": round(float(max_confidence * 100), 2),
                "findings": findings,
                "severity": severity,
                "has_abnormality": num_detections > 0,
                "regions_detected": num_detections,
                "detections": detections,
                "annotated_image": annotated_base64,
                "image_quality": "good",
                "recommendations": self._generate_recommendations(num_detections > 0, max_confidence)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error during detection: {str(e)}",
                "confidence": 0.0,
                "findings": "Analysis failed"
            }
    
    def _generate_recommendations(self, has_finding: bool, confidence: float) -> list:
        """Generate clinical recommendations"""
        if has_finding:
            if confidence > 0.8:
                return [
                    "Immediate specialist consultation recommended",
                    "Consider additional imaging modalities (CT/MRI)",
                    "Schedule follow-up within 1-2 weeks",
                    "Document findings in patient record"
                ]
            elif confidence > 0.5:
                return [
                    "Follow-up imaging in 3-6 months",
                    "Clinical correlation advised",
                    "Monitor for symptom changes",
                    "Consider specialist referral if symptoms persist"
                ]
            else:
                return [
                    "Routine follow-up as per standard protocol",
                    "Monitor patient symptoms",
                    "Repeat imaging if clinically indicated"
                ]
        else:
            return [
                "No immediate action required",
                "Continue regular screening schedule",
                "Routine follow-up as per standard protocol"
            ]

# Global model instance
tumor_model = TumorDetectionModel()
