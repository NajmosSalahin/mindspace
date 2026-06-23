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
      <div className="bg-surface border border-border rounded-xl p-6 text-center">
        <h1 className="font-display text-xl font-bold text-white tracking-display mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm">If an account exists with that email, you'll receive a reset link shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-display text-center">Forgot password</h1>
      <p className="text-gray-500 text-sm text-center mt-1 mb-6">Enter your email to receive a reset link</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-rose block mb-1.5">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-deep border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose/50 transition"
            placeholder="you@example.com"
          />
        </div>
        <button type="submit" disabled={isLoading} className="gradient-btn w-full py-2.5 rounded-lg text-sm font-medium">
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
