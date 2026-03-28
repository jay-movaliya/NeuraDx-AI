import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader, Image as ImageIcon, CheckCircle } from 'lucide-react';

const ImageUploader = ({ onImageUpload, isProcessing }) => {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        onImageUpload(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.dcm']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const clearImage = () => {
    setPreview(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer
                transition-all duration-300 bg-white overflow-hidden group
                ${isDragActive 
                  ? 'border-[#3A8BFF] bg-blue-50 scale-105' 
                  : 'border-gray-200 hover:border-[#4B83F6] hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" 
                     style={{
                       backgroundImage: `radial-gradient(circle, #3A8BFF 1px, transparent 1px)`,
                       backgroundSize: '30px 30px'
                     }}
                />
              </div>

              <motion.div
                animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative z-10"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center justify-center w-20 h-20 mb-6
                           bg-gradient-to-br from-[#3A8BFF] to-[#4B83F6] rounded-3xl
                           shadow-lg shadow-blue-500/30"
                >
                  <Upload className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {isDragActive ? 'Drop your image here' : 'Upload Medical Image'}
                </h3>
                <p className="text-gray-500 mb-2">
                  Drag & drop or click to select X-ray or MRI scan
                </p>
                <p className="text-sm text-gray-400">
                  Supports: PNG, JPG, JPEG, DICOM • Max size: 10MB
                </p>

                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Secure Upload</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>HIPAA Compliant</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-3xl p-6 border border-gray-100 shadow-lg"
          >
            {!isProcessing && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearImage}
                disabled={isProcessing}
                className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-2xl 
                         hover:bg-red-600 transition-all shadow-lg z-10
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
            
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-auto"
              />
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-[#3A8BFF]/90 to-[#4B83F6]/90 
                           backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-flex items-center justify-center w-16 h-16 mb-4
                               bg-white/20 rounded-3xl backdrop-blur-sm"
                    >
                      <Loader className="w-8 h-8" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">Analyzing Image...</h3>
                    <p className="text-sm opacity-90">AI model processing your scan</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-6 w-64 mx-auto">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {!isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 text-green-600"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Image uploaded successfully</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
