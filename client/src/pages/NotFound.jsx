import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-display font-bold gradient-text mb-4">404</div>
        <h2 className="font-display text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-500 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="gradient-btn px-6 py-3 rounded-xl text-sm font-medium inline-block">Back to Home</Link>
      </div>
    </div>
  );
}
