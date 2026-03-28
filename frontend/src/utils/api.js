import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getMockResults = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        detections: [
          { 
            x: 35, 
            y: 25, 
            width: 15, 
            height: 20, 
            confidence: 0.92, 
            type: 'Tumor',
            severity: 'High'
          },
          { 
            x: 60, 
            y: 45, 
            width: 10, 
            height: 12, 
            confidence: 0.78, 
            type: 'Anomaly',
            severity: 'Medium'
          }
        ],
        confidence: 0.85,
        processingTime: 2.3,
        modelVersion: 'v2.1.0'
      });
    }, 3000);
  });
};
