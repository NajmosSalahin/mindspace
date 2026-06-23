import { useState } from 'react';
import { useForgotPasswordMutation } from '../redux/services/authService';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [forgot, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgot({ email }).unwrap();
      setSent(true);
      toast.success('Reset link sent if account exists');
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  if (sent) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-gray-400 text-sm">If an account exists with that email, you'll receive a reset link shortly.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8">
      <h1 className="font-display text-3xl font-bold text-center mb-2">Forgot Password</h1>
      <p className="text-gray-400 text-sm text-center mb-8">Enter your email to receive a reset link</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="you@example.com" />
        <button type="submit" disabled={isLoading} className="gradient-btn w-full py-2.5 rounded-xl text-sm font-medium">
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
