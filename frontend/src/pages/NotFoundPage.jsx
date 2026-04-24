import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-heading text-4xl font-bold text-ink">404</h1>
        <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-5 inline-block rounded-lg bg-ocean px-4 py-2 text-white">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
