import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/BarcodeScanner.css';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isScanning: boolean;
}

export const BarcodeScanner: FC<BarcodeScannerProps> = ({ onScan, isScanning }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanned, setScanned] = useState(false);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    if (!isScanning) {
      // Stop scanner
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.error('Error stopping scanner:', err);
        });
        scannerRef.current = null;
      }
      hasScannedRef.current = false;
      setScanned(false);
      return;
    }

    const scanner = new Html5QrcodeScanner('barcode-scanner-container', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    }, false);

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      if (!hasScannedRef.current) {
        hasScannedRef.current = true;
        setScanned(true);
        console.log('Barcode found:', decodedText);

        // Show success state for 800ms then trigger callback
        setTimeout(() => {
          onScan(decodedText);
        }, 800);

        // Reset after callback so we can scan again
        setTimeout(() => {
          hasScannedRef.current = false;
          setScanned(false);
        }, 1600);
      }
    };

    const onScanFailure = (error: string) => {
      // Silently fail - barcode not found in frame
      console.warn('Scan failed:', error);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.error('Error clearing scanner:', err);
        });
        scannerRef.current = null;
      }
    };
  }, [isScanning, onScan]);

  return (
    <div>
      {isScanning ? (
        <div style={{ position: 'relative' }}>
          <div
            id="barcode-scanner-container"
            style={{
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              aspectRatio: '9 / 12',
            }}
          />
          {scanned && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 25,
                animation: 'fadeIn 0.3s ease-in',
                borderRadius: '10px',
              }}
            >
              <div style={{ textAlign: 'center', color: 'white', fontSize: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✓</div>
                <div>Barcode Scanned!</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="scanner-placeholder">
          <p>📱 Enable camera to scan barcodes</p>
        </div>
      )}
    </div>
  );
};
