import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Phone, MapPin, FileText } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ResultsViewer from '../components/ResultsViewer';
import { useImageAnalysis } from '../hooks/useImageAnalysis';

const UploadPage = () => {
  const navigate = useNavigate();
  const { uploadedImage, isProcessing, results, analyzeImage, reset } = useImageAnalysis();
  const [step, setStep] = useState(1);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    medicalHistory: '',
    scanType: 'MRI'
  });

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleImageUpload = (file, preview) => {
    analyzeImage(file, preview);
    setStep(3);
  };

  const handleGenerateReport = () => {
    navigate('/report', { 
      state: { 
        patientInfo, 
        results, 
        image: uploadedImage 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${step >= num ? 'bg-[#3A8BFF] text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Patient Information */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Patient Information</h2>
                <p className="text-gray-600">Enter patient details before uploading scan</p>
              </div>

              <form onSubmit={handlePatientSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Patient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={patientInfo.name}
                      onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                               focus:border-[#3A8BFF] focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Age
                    </label>
                    <input
                      type="number"
                      required
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                               focus:border-[#3A8BFF] focus:outline-none transition-colors"
                      placeholder="45"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      required
                      value={patientInfo.gender}
                      onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                               focus:border-[#3A8BFF] focus:outline-none transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                               focus:border-[#3A8BFF] focus:outline-none transition-colors"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  {/* Scan Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scan Type</label>
                    <select
                      required
                      value={patientInfo.scanType}
                      onChange={(e) => setPatientInfo({ ...patientInfo, scanType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                               focus:border-[#3A8BFF] focus:outline-none transition-colors"
                    >
    
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                      
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    value={patientInfo.address}
                    onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                             focus:border-[#3A8BFF] focus:outline-none transition-colors"
                    placeholder="123 Main St, City, State"
                  />
                </div>

                {/* Medical History */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Medical History (Optional)
                  </label>
                  <textarea
                    value={patientInfo.medicalHistory}
                    onChange={(e) => setPatientInfo({ ...patientInfo, medicalHistory: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                             focus:border-[#3A8BFF] focus:outline-none transition-colors resize-none"
                    placeholder="Previous conditions, allergies, medications..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-[#3A8BFF] text-white rounded-xl font-semibold text-lg
                           hover:bg-[#4B83F6] transition-colors shadow-lg"
                >
                  Continue to Upload Scan
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Upload Image */}
          {step === 2 && !results && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Medical Scan</h2>
                <p className="text-gray-600">Patient: {patientInfo.name} • {patientInfo.scanType}</p>
              </div>

              <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />

              <button
                onClick={() => setStep(1)}
                className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Edit Patient Information
              </button>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && results && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis Complete</h2>
                <p className="text-gray-600">Patient: {patientInfo.name}</p>
              </div>

              <ResultsViewer
                image={uploadedImage}
                detections={results.detections}
                confidence={results.confidence}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateReport}
                className="mt-8 w-full py-4 bg-[#3A8BFF] text-white rounded-xl font-semibold text-lg
                         hover:bg-[#4B83F6] transition-colors shadow-lg"
              >
                Generate Medical Report
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UploadPage;
