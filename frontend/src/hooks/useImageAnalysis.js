import { useState } from 'react';
import { scanAPI } from '../services/api';

export const useImageAnalysis = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeImage = async (file, preview, patientData) => {
    setUploadedImage(preview);
    setIsProcessing(true);
    setError(null);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patient_name', patientData.patientName);
      formData.append('patient_id', patientData.patientId);
      formData.append('age', patientData.age);
      formData.append('gender', patientData.gender);
      formData.append('contact_no', patientData.phone);
      formData.append('email', patientData.email);
      formData.append('scan_type', patientData.scanType);

      // Call the backend API
      const data = await scanAPI.upload(formData);
      
      console.log('Backend response:', data);
      console.log('Annotated image:', data.annotated_image ? 'Present' : 'Missing');
      
      // Transform backend response to match frontend expectations
      setResults({
        confidence: data.confidence,
        findings: data.findings,
        severity: data.severity,
        has_abnormality: data.has_abnormality,
        regions_detected: data.regions_detected,
        detections: data.detections || [],
        annotated_image: data.annotated_image ? `data:image/png;base64,${data.annotated_image}` : null,
        recommendations: data.recommendations || [],
        scan_id: data.id,
      });
      
      console.log('Results set with annotated_image:', data.annotated_image ? 'Yes' : 'No');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Analysis failed';
      setError(errorMessage);
      console.error('Analysis error:', err);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setResults(null);
    setError(null);
    setIsProcessing(false);
  };

  return {
    uploadedImage,
    isProcessing,
    results,
    error,
    analyzeImage,
    reset
  };
};
