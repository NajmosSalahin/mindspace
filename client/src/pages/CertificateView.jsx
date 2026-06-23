import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/axios';
import { formatDate } from '../utils/formatters';

export default function CertificateView() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/my-certificates').then((res) => {
      const found = res.data.data.find((c) => c._id === id);
      setCert(found || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto bg-white/10 rounded-xl animate-pulse mb-4" />
          <div className="h-6 w-1/2 mx-auto bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">📜</p>
        <p className="text-gray-500 mb-4">Certificate not found</p>
        <Link to="/dashboard" className="text-rose text-sm hover:text-rose-400 transition">Dashboard →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="glass rounded-2xl p-10 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-3xl">
          📜
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold">Certificate of Attendance</h1>
          <p className="text-gray-500 text-sm mt-2">{cert.eventId?.title}</p>
        </div>

        <div className="bg-deep rounded-xl p-6 max-w-md mx-auto space-y-3 text-sm text-left">
          <div className="flex justify-between">
            <span className="text-gray-500">Event</span>
            <span className="text-white">{cert.eventId?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="text-white">{cert.eventId?.date ? formatDate(cert.eventId.date) : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Issued</span>
            <span className="text-white">{cert.issuedAt ? formatDate(cert.issuedAt) : '-'}</span>
          </div>
        </div>

        <a
          href={`/api/certificates/download/${cert._id}`}
          className="gradient-btn px-8 py-3 rounded-xl text-sm font-medium inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download PDF
        </a>

        <div>
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
