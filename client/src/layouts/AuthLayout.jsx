import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-deep gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-bold text-white tracking-display">
            EventSphere
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
