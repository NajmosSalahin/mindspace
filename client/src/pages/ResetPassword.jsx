import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../redux/services/authService';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [reset, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reset({ token, password }).unwrap();
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="glass rounded-2xl p-8">
      <h1 className="font-display text-3xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-gray-400 text-sm text-center mb-8">Enter your new password</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="New password (min 6 chars)" />
        <button type="submit" disabled={isLoading || password.length < 6} className="gradient-btn w-full py-2.5 rounded-xl text-sm font-medium">
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
