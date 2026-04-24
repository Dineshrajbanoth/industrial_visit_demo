import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const branchOptions = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL'];
const sectionOptions = ['A', 'B', 'C'];

function Login() {
  const navigate = useNavigate();
  const { loginAdmin, loginStudent, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('admin');
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [studentForm, setStudentForm] = useState({ rollNo: '', branch: 'CSE', section: 'A' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'student' ? '/student-dashboard' : '/admin-dashboard'} replace />;
  }

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await loginAdmin(adminForm);
      navigate('/admin-dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await loginStudent(studentForm);
      navigate('/student-dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Student login failed.');
    } finally {
      setLoading(false);
    }
  };

  const tabButtonClass = (tab) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-ocean text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean">Industrial Visit Dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-ink">Sign in to continue</h1>
          <p className="mt-2 text-sm text-slate-500">Choose admin access to manage visits or student access to see your assigned visits.</p>
        </div>

        <div className="mb-6 inline-flex rounded-full bg-slate-100 p-1">
          <button type="button" className={tabButtonClass('admin')} onClick={() => setActiveTab('admin')}>
            Admin Login
          </button>
          <button type="button" className={tabButtonClass('student')} onClick={() => setActiveTab('student')}>
            Student Login
          </button>
        </div>

        {activeTab === 'admin' ? (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAdminSubmit}>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Email or Username
              <input
                required
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
                placeholder="admin@example.com or admin"
                value={adminForm.email}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Password
              <input
                required
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
                value={adminForm.password}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </label>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Admin Login'}
              </Button>
            </div>
          </form>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleStudentSubmit}>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Roll Number
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
                value={studentForm.rollNo}
                onChange={(e) => setStudentForm((prev) => ({ ...prev, rollNo: e.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Branch
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
                value={studentForm.branch}
                onChange={(e) => setStudentForm((prev) => ({ ...prev, branch: e.target.value }))}
              >
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-600">
              Section
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
                value={studentForm.section}
                onChange={(e) => setStudentForm((prev) => ({ ...prev, section: e.target.value }))}
              >
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </label>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Checking access...' : 'Student Login'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default Login;