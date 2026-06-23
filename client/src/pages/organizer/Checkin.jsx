import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function OrgCheckin() {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
    };
  }, []);

  const handleVerify = async (code) => {
    const value = code || qrCode.trim();
    if (!value) return toast.error('Enter or scan a QR code');
    try {
      const res = await api.post('/tickets/verify-qr', { qrCode: value });
      setResult(res.data.data);
      toast.success('Check-in successful!');
      setQrCode('');
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
      setScanning(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid QR code');
      setResult(null);
    }
  };

  const startScanner = async () => {
    setScanning(true);
    setResult(null);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleVerify(decodedText);
        },
        () => {}
      );
    } catch (err) {
      toast.error('Camera access denied or unavailable');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-bold mb-6">QR Check-in</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-2">Enter QR Code</label>
          <input
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Paste QR code..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleVerify()} className="gradient-btn flex-1 py-2.5 rounded-xl text-sm font-medium">
            Verify & Check-in
          </button>
          <button
            onClick={scanning ? stopScanner : startScanner}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
              scanning
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            {scanning ? 'Stop Camera' : 'Scan Camera'}
          </button>
        </div>

        {scanning && (
          <div id="qr-reader" className="w-full max-w-xs mx-auto rounded-xl overflow-hidden" />
        )}

        {result && (
          <div className="glass rounded-xl p-4 text-sm">
            <p className="text-green-400 font-medium">✅ Check-in successful</p>
            <p className="text-gray-400 mt-1">{result.userId?.name || 'Attendee'} — {result.ticketType?.name || 'General'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
