import { motion } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';
import FeatureCards from '../components/FeatureCards';

const HomePage = ({ onImageUpload, isProcessing }) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-3">
          AI-Powered Tumor Detection
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Upload X-ray or MRI images for instant AI analysis. 
          Our deep learning model identifies potential tumor regions with confidence scores.
        </p>
      </motion.div>

      <ImageUploader 
        onImageUpload={onImageUpload}
        isProcessing={isProcessing}
      />

      <FeatureCards />

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Upload Image', desc: 'Select your medical scan file' },
            { step: '2', title: 'AI Analysis', desc: 'Our model processes the image' },
            { step: '3', title: 'View Results', desc: 'Get highlighted regions with confidence scores' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + (idx * 0.1) }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#3A8BFF] text-white rounded-full 
                            flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
