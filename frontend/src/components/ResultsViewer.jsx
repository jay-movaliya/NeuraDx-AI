import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, TrendingUp, Brain, Target } from 'lucide-react';

const ResultsViewer = ({ image, detections, confidence, annotatedImage }) => {
  console.log('ResultsViewer - annotatedImage:', annotatedImage ? 'Present' : 'Missing');
  console.log('ResultsViewer - image:', image ? 'Present' : 'Missing');
  
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-green-600';
    if (conf >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (conf) => {
    if (conf >= 0.8) return 'bg-green-50';
    if (conf >= 0.5) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const getConfidenceIcon = (conf) => {
    if (conf >= 0.8) return <CheckCircle className="w-5 h-5" />;
    if (conf >= 0.5) return <Info className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Brain className="w-8 h-8 text-[#3A8BFF]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Overall Confidence</p>
              <p className="text-3xl font-bold text-gray-900">{(confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Target className="w-8 h-8 text-[#3A8BFF]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Detections Found</p>
              <p className="text-3xl font-bold text-gray-900">{detections?.length || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Analysis Status</p>
              <p className="text-xl font-bold text-green-600">Completed</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image with Overlays */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 24, padding: 24, backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--accent-soft)', border: '1px solid var(--border-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Detection Results</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI-Annotated Scan</div>
                </div>
              </div>
              <span style={{ padding: '5px 14px', background: 'var(--accent-soft)', border: '1px solid var(--border-focus)', borderRadius: 10, fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                AI Analysis
              </span>
            </div>

            {/* Image Container */}
            <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: '#000', border: '2px solid var(--border)' }}>
              <img
                src={annotatedImage || image}
                alt="AI Analyzed scan with detections"
                style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.95 }}
              />

              {/* Tumor Detected Badge — top-left overlay */}
              {detections && detections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.7, type: 'spring', stiffness: 180 }}
                  style={{
                    position: 'absolute', top: 14, left: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    background: 'rgba(239,68,68,0.88)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 30,
                    border: '1.5px solid rgba(255,100,100,0.6)',
                    boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
                  }}
                >
                  {/* Pulsing dot */}
                  <div style={{ position: 'relative', width: 10, height: 10 }}>
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff', opacity: 0.5 }}
                    />
                    <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: '#fff' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                    TUMOR DETECTED
                  </span>
                </motion.div>
              )}

              {/* No finding badge */}
              {(!detections || detections.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  style={{
                    position: 'absolute', top: 14, left: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    background: 'rgba(34,197,94,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 30,
                    border: '1.5px solid rgba(74,222,128,0.5)',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                    NO ABNORMALITY
                  </span>
                </motion.div>
              )}

              {/* Detection count — bottom-right */}
              <div style={{
                position: 'absolute', bottom: 14, right: 14,
                padding: '6px 12px',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(10px)',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  {detections?.length || 0} Region{(detections?.length || 0) !== 1 ? 's' : ''} Flagged
                </span>
              </div>
            </div>

            {/* Image Info Footer */}
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 14,
              background: 'var(--accent-soft)', border: '1px solid var(--border-focus)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <AlertCircle size={14} color="var(--accent)" />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--accent)' }}>Note:</strong> AI-assisted analysis only.
                Always verify with professional medical judgment.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          {/* Detection Details */}
          {detections && detections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Detection Details</h3>
              <div className="space-y-4">
                {detections.map((detection, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.1) }}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#3A8BFF] 
                             transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Region {idx + 1}
                        </span>
                        <h4 className="font-bold text-gray-900 mt-1">{detection.type || 'Anomaly'}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border
                        ${getSeverityColor(detection.severity || 'Low')}`}>
                        {detection.severity || 'Low'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Confidence</span>
                        <span className="font-bold text-[#3A8BFF]">
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {detection.bbox && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Location</span>
                          <span className="font-semibold text-gray-700 text-xs">
                            ({detection.bbox.x1}, {detection.bbox.y1}) - ({detection.bbox.x2}, {detection.bbox.y2})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${detection.confidence * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 + (idx * 0.1) }}
                        className="h-full bg-gradient-to-r from-[#3A8BFF] to-[#4B83F6] rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 
                     border border-amber-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Further clinical evaluation recommended</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Consider additional imaging modalities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Follow-up scan in 3-6 months</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Consult with specialist for treatment</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsViewer;
