import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Smartphone, Scan, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = "Scan Barcode"
}) => {
  const [scannerMode, setScannerMode] = useState<'camera' | 'input'>('camera');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen && scannerMode === 'camera') {
      initializeScanner();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen, scannerMode, selectedCamera]);

  const initializeScanner = async () => {
    try {
      setError('');
      
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      
      if (devices.length === 0) {
        setError('No cameras found. Please use manual input.');
        setScannerMode('input');
        return;
      }

      // Use selected camera or default to first available
      const cameraId = selectedCamera || devices[0].id;
      
      // Initialize scanner
      const html5QrCode = new Html5Qrcode("barcode-scanner");
      html5QrCodeRef.current = html5QrCode;
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore frequent scan errors
          if (!errorMessage.includes('No QR code found')) {
            console.warn('Scan error:', errorMessage);
          }
        }
      );
      
      setIsScanning(true);
    } catch (err: any) {
      console.error('Scanner initialization error:', err);
      setError('Failed to initialize camera. Please check permissions or use manual input.');
      setScannerMode('input');
    }
  };

  const cleanup = async () => {
    try {
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
    setIsScanning(false);
    html5QrCodeRef.current = null;
    scannerRef.current = null;
  };

  const handleScanSuccess = (barcode: string) => {
    onScan(barcode);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScanSuccess(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const handleClose = () => {
    cleanup();
    setManualBarcode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Scan className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner Mode Toggle */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setScannerMode('camera')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                scannerMode === 'camera'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>
            <button
              onClick={() => setScannerMode('input')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                scannerMode === 'input'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4 inline mr-2" />
              Manual
            </button>
          </div>

          {/* Camera Selection */}
          {scannerMode === 'camera' && cameras.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Camera
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Camera Scanner */}
          {scannerMode === 'camera' && (
            <div className="mb-4">
              <div 
                id="barcode-scanner" 
                className="w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                style={{ minHeight: '300px' }}
              />
              {!isScanning && !error && (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Input */}
          {scannerMode === 'input' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Barcode Manually
                </label>
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Scan or type barcode here..."
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can also use a USB barcode scanner to input directly
                </p>
              </div>
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use This Barcode
              </button>
            </form>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Camera:</strong> Point camera at barcode/QR code</li>
              <li>• <strong>USB Scanner:</strong> Use manual mode and scan directly</li>
              <li>• <strong>Manual:</strong> Type barcode numbers manually</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};