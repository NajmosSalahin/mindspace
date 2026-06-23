import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '../redux/services/authService';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Register() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { register: reg, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await register(data).unwrap();
      toast.success('OTP sent to your email!');
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-display text-center">Create account</h1>
      <p className="text-gray-500 text-sm text-center mt-1 mb-6">Join EventSphere today</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-rose block mb-1.5">Name</label>
          <input {...reg('name')} className="w-full bg-deep border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose/50 transition" placeholder="Your name" />
          {errors.name && <p className="text-rose text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-rose block mb-1.5">Email</label>
          <input {...reg('email')} className="w-full bg-deep border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose/50 transition" placeholder="you@example.com" />
          {errors.email && <p className="text-rose text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-rose block mb-1.5">Password</label>
          <input type="password" {...reg('password')} className="w-full bg-deep border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose/50 transition" placeholder="At least 6 characters" />
          {errors.password && <p className="text-rose text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isLoading} className="gradient-btn w-full py-2.5 rounded-lg text-sm font-medium">
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-rose hover:text-rose-400 transition">Sign in</Link>
      </p>
    </div>
  );
}
