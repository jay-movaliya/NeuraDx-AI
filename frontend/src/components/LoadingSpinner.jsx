import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Processing...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 border-4 border-[#3A8BFF] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-[#4B83F6] border-b-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-gray-700 font-medium"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
