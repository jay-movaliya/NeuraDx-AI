import { motion } from 'framer-motion';
import { Zap, Target, Shield, Clock, Brain, FileCheck } from 'lucide-react';

const features = [
  { 
    icon: Zap, 
    title: 'Fast Analysis', 
    desc: 'Results in seconds',
    color: '#3A8BFF'
  },
  { 
    icon: Target, 
    title: 'High Accuracy', 
    desc: '95%+ detection rate',
    color: '#4B83F6'
  },
  { 
    icon: Shield, 
    title: 'HIPAA Compliant', 
    desc: 'Secure & private',
    color: '#3A8BFF'
  },
  { 
    icon: Clock, 
    title: '24/7 Available', 
    desc: 'Always ready to assist',
    color: '#4B83F6'
  },
  { 
    icon: Brain, 
    title: 'Deep Learning', 
    desc: 'Advanced AI models',
    color: '#3A8BFF'
  },
  { 
    icon: FileCheck, 
    title: 'Multi-Format', 
    desc: 'X-ray, MRI, CT scans',
    color: '#4B83F6'
  }
];

const FeatureCards = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
    >
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (idx * 0.1) }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: `${feature.color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color: feature.color }} />
            </motion.div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default FeatureCards;
