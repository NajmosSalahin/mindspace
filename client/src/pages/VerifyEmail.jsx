import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyEmailMutation } from '../redux/services/authService';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [verify, { isLoading }] = useVerifyEmailMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verify({ email, otp }).unwrap();
      toast.success('Email verified! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="glass rounded-2xl p-8 text-center">
      <h1 className="font-display text-3xl font-bold mb-2">Verify Email</h1>
      <p className="text-gray-400 text-sm mb-8">Enter the 6-digit code sent to {email || 'your email'}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[8px] text-white focus:outline-none focus:border-indigo-500"
          placeholder="000000"
          maxLength={6}
        />
        <button type="submit" disabled={isLoading || otp.length !== 6} className="gradient-btn w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  );
}
