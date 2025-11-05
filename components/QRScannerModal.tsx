import React, { useRef, useEffect, useState } from 'react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (isOpen && videoRef.current) {
        try {
          setError('');
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Camera access error:", err);
          setError("Could not access the camera. Please check your browser permissions.");
        }
      }
    };

    startCamera();

    return () => {
      // Stop the camera stream when the modal is closed or component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleSimulateScan = () => {
    // In a real app, you would use a library like jsQR to decode the video stream.
    // For this demo, we'll simulate a successful scan.
    onScanSuccess('student@example.com'); // Pre-fill with a demo email
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="relative p-6">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-2xl font-bold text-center mb-4">Scan QR Code</h2>
          
          <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            {error ? (
                <p className="text-red-400 text-center p-4">{error}</p>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
             <div className="absolute inset-0 border-8 border-white/20 rounded-lg"></div>
             <div className="absolute w-2/3 h-1 bg-red-500 rounded-full animate-ping"></div>
          </div>

          <button
            onClick={handleSimulateScan}
            className="w-full mt-4 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Simulate Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;