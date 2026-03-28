import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Mail, Phone, Calendar, FileText, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const UploadScanPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_id: '',
    age: '',
    gender: '',
    contact_no: '',
    email: '',
    scan_type: ''
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('patient_name', formData.patient_name);
      formDataToSend.append('patient_id', formData.patient_id);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('contact_no', formData.contact_no);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('scan_type', formData.scan_type);

      const response = await fetch('http://localhost:8000/api/scans/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setStep(3);
      } else {
        alert(data.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Connection error. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Medical Scan</h1>
          <p className="text-gray-600">Upload patient scan for AI analysis</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Patient Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Patient Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                             focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Patient ID *
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                             focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    placeholder="P12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Age *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                             focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                           focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Contact Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.contact_no}
                    onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                             focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                             focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    placeholder="patient@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Scan Type *
              </label>
              <select
                required
                value={formData.scan_type}
                onChange={(e) => setFormData({ ...formData, scan_type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                         focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              >
                <option value="">Select Scan Type</option>
                <option value="MRI">MRI</option>
                <option value="CT Scan">CT Scan</option>
          
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.patient_name || !formData.patient_id || !formData.age || !formData.gender || !formData.contact_no || !formData.email || !formData.scan_type}
              className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                       rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next: Upload Scan
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Upload Scan */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Medical Scan</h2>
            
            <div
              onClick={() => document.getElementById('fileInput').click()}
              className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer
                       hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              {preview ? (
                <div>
                  <img src={preview} alt="Preview" className="max-w-full max-h-96 mx-auto rounded-xl" />
                  <p className="mt-4 text-gray-600">Click to change image</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500"> MRI, or CT scan images</p>
                </div>
              )}
            </div>
            
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg
                         hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                         rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Scan
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100"
          >
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete</h2>
              <p className="text-gray-600">Scan ID: {result.id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <p className="text-sm font-semibold text-blue-600 mb-2">AI Confidence</p>
                <p className="text-4xl font-bold text-blue-900">{result.confidence}%</p>
              </div>

              <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <p className="text-sm font-semibold text-[#3A8BFF] mb-2">Severity</p>
                <p className="text-4xl font-bold text-[#4B83F6] capitalize">{result.severity}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Findings</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{result.findings}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedFile(null);
                  setPreview(null);
                  setResult(null);
                  setFormData({
                    patient_name: '',
                    patient_id: '',
                    age: '',
                    gender: '',
                    contact_no: '',
                    email: '',
                    scan_type: ''
                  });
                }}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg
                         hover:bg-gray-300 transition-all"
              >
                Upload Another
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                         rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadScanPage;
