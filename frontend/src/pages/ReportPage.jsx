import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Download, Printer, ArrowLeft, Activity, Calendar, User, Phone, 
  MapPin, Droplet, Ruler, Weight, FileText, Brain, AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();
  const { patientInfo, results, image } = location.state || {};

  if (!patientInfo || !results) {
    navigate('/dashboard');
    return null;
  }

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Medical_Report_${patientInfo.firstName}_${patientInfo.lastName}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white border-b border-gray-100 sticky top-0 z-50 print:hidden"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl 
                         font-semibold transition-all flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                className="px-4 py-2.5 bg-gradient-to-r from-[#3A8BFF] to-[#4B83F6] text-white 
                         rounded-2xl font-semibold shadow-lg shadow-blue-500/30
                         hover:shadow-xl hover:shadow-blue-500/40 transition-all
                         flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Report Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          ref={reportRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 print:shadow-none print:rounded-none"
        >
          {/* Header */}
          <div className="border-b-4 border-[#3A8BFF] pb-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-[#3A8BFF] to-[#4B83F6] rounded-2xl">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">NeuraDx AI</h1>
                    <p className="text-sm text-gray-500">Medical Imaging Analysis Report</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Report Date</p>
                <p className="font-bold text-gray-900">{currentDate}</p>
                <p className="text-xs text-gray-500 mt-2">Report ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-[#3A8BFF]" />
              Patient Information
            </h2>
            <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-bold text-gray-900">{patientInfo.firstName} {patientInfo.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Age</p>
                <p className="font-bold text-gray-900">{patientInfo.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Gender</p>
                <p className="font-bold text-gray-900">{patientInfo.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-bold text-gray-900">{patientInfo.phone}</p>
              </div>
              {patientInfo.bloodType && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Blood Type</p>
                  <p className="font-bold text-gray-900">{patientInfo.bloodType}</p>
                </div>
              )}
              {patientInfo.email && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-bold text-gray-900">{patientInfo.email}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-bold text-gray-900">{patientInfo.address}</p>
              </div>
            </div>
          </div>

          {/* Medical Details */}
          {(patientInfo.height || patientInfo.weight || patientInfo.medicalHistory) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Medical Details</h2>
              <div className="grid grid-cols-3 gap-6 bg-gray-50 rounded-2xl p-6">
                {patientInfo.height && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Height</p>
                    <p className="font-bold text-gray-900">{patientInfo.height} cm</p>
                  </div>
                )}
                {patientInfo.weight && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Weight</p>
                    <p className="font-bold text-gray-900">{patientInfo.weight} kg</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scan Type</p>
                  <p className="font-bold text-gray-900">{patientInfo.scanType}</p>
                </div>
                {patientInfo.medicalHistory && (
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600 mb-1">Medical History</p>
                    <p className="font-semibold text-gray-900">{patientInfo.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-[#3A8BFF]" />
              AI Analysis Results
            </h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Overall Confidence</p>
                <p className="text-3xl font-bold text-[#3A8BFF]">{(results.confidence * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Detections Found</p>
                <p className="text-3xl font-bold text-[#3A8BFF]">{results.detections.length}</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Analysis Status</p>
                <p className="text-xl font-bold text-green-600">Completed</p>
              </div>
            </div>

            {/* Detections Table */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Region</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Confidence</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {results.detections.map((detection, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="px-4 py-3 font-semibold text-gray-900">Region {idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700">{detection.type}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-[#3A8BFF]">
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {detection.width}% × {detection.height}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold border
                          ${detection.severity === 'High' ? 'bg-red-100 text-red-700 border-red-200' : 
                            detection.severity === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                            'bg-green-100 text-green-700 border-green-200'}`}>
                          {detection.severity || 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scan Image */}
          {image && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analyzed Scan</h2>
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                <img src={image} alt="Medical scan" className="w-full h-auto" />
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Clinical Recommendations
            </h2>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold mt-1">•</span>
                  <span>Further clinical evaluation recommended for detected regions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold mt-1">•</span>
                  <span>Consider additional imaging modalities for confirmation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold mt-1">•</span>
                  <span>Follow-up scan recommended in 3-6 months</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold mt-1">•</span>
                  <span>Consult with specialist for comprehensive treatment planning</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t-2 border-gray-200 pt-6 mb-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Medical Disclaimer:</strong> This report is generated by AI-assisted 
                analysis and should be used as a clinical decision support tool only. Final diagnosis and treatment 
                decisions should be made by qualified medical professionals based on comprehensive clinical evaluation, 
                additional diagnostic tests, and professional medical judgment. NeuraDx AI is intended for research and 
                clinical decision support purposes. The AI model's predictions should not replace professional medical advice.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-gray-200 pt-6">
            <p className="text-sm text-gray-700 font-semibold mb-1">
              Generated by NeuraDx AI Medical Imaging Platform
            </p>
            <p className="text-xs text-gray-500">
              © 2024 NeuraDx AI • All Rights Reserved • For Medical Use Only
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ReportPage;
