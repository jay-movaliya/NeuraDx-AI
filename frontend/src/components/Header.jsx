import { motion } from 'framer-motion';
import { Activity, Menu } from 'lucide-react';

const Header = ({ onNewScan, showNewScan = false }) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-2 bg-[#3A8BFF] rounded-lg"
          >
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">NeuraDx AI</h1>
            <p className="text-sm text-gray-500">Medical Imaging Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {showNewScan && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewScan}
              className="px-6 py-2 bg-[#3A8BFF] text-white rounded-lg font-medium
                       hover:bg-[#4B83F6] transition-colors shadow-md"
            >
              New Scan
            </motion.button>
          )}
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
