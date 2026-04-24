import { FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

function Topbar() {
  const { isAuthenticated, logout, user } = useAuth();

  const displayName = user?.role === 'student' ? user?.rollNo : user?.email || 'Guest';
  const roleLabel = user?.role === 'student' ? `${user?.branch} - ${user?.section}` : 'Admin Access';

  return (
    <header className="glass mb-5 flex items-center justify-between rounded-xl2 border border-slate-200 px-4 py-3 shadow-soft">
      <div>
        <h2 className="font-heading text-xl font-semibold text-ink">Industrial Visit Analytics & Experience Dashboard</h2>
        <p className="text-sm text-slate-500">Track visits, feedback, and student engagement in one place.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-ocean">
          <FiUser />
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-ink">{displayName}</p>
          <p className="text-xs text-slate-500">{isAuthenticated ? roleLabel : 'Viewer Mode'}</p>
        </div>
        {isAuthenticated && (
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}

export default Topbar;
