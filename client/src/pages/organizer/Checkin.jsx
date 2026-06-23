import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function OrgCheckin() {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!qrCode.trim()) return toast.error('Enter a QR code');
    try {
      const res = await api.post('/tickets/verify-qr', { qrCode: qrCode.trim() });
      setResult(res.data.data);
      toast.success('Check-in successful!');
      setQrCode('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid QR code');
      setResult(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-bold mb-6">QR Check-in</h1>
      <div className="glass rounded-2xl p-6">
        <label className="text-xs text-gray-500 block mb-2">Enter QR Code</label>
        <input
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Scan or paste QR code..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 mb-4"
        />
        <button onClick={handleVerify} className="gradient-btn w-full py-2.5 rounded-xl text-sm font-medium">Verify & Check-in</button>
        {result && (
          <div className="mt-4 glass rounded-xl p-4 text-sm text-green-400">
            ✅ {result.userId?.name || 'Attendee'} checked in successfully
          </div>
        )}
      </div>
    </div>
  );
}
