import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBarChart2, FiUsers, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleEnter = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    navigate(user?.role === 'student' ? '/student-dashboard' : '/admin-dashboard');
  };

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 px-4 py-6 shadow-[0_24px_90px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl md:px-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(88,150,255,0.18),transparent_26%),radial-gradient(circle_at_90%_0%,rgba(139,201,255,0.24),transparent_24%),radial-gradient(circle_at_0%_100%,rgba(84,129,255,0.16),transparent_28%)]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col justify-between">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Industrial Visit Analytics</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">VNR VJIET Dashboard</h1>
            </div>

            <Link
              to="/login"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 md:inline-flex"
            >
              Sign In
            </Link>
          </header>

          <main className="grid flex-1 items-center gap-12 py-8 md:grid-cols-[1.1fr_0.9fr] md:py-14">
            <section className="space-y-7 text-center md:text-left">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-200 bg-white/80 shadow-[0_18px_50px_-20px_rgba(37,99,235,0.45)] md:mx-0 md:h-28 md:w-28">
                <div className="flex flex-col items-center text-blue-600">
                  <FiBarChart2 className="text-4xl md:text-5xl" />
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500">VNR</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-500">Industrial Visit Analytics</p>
                <h2 className="mt-4 max-w-3xl text-5xl font-black leading-none tracking-tight text-slate-900 md:text-7xl">
                  Track visits.
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    See insights.
                  </span>
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:mx-0 md:text-lg">
                  Manage industrial visits, student access, feedback, and analytics in one polished dashboard.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row md:justify-start">
                <button
                  type="button"
                  onClick={handleEnter}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.3em] text-white shadow-[0_18px_40px_-18px_rgba(37,99,235,0.7)] transition hover:scale-[1.02]"
                >
                  Enter
                  <FiArrowRight className="text-lg" />
                </button>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  Open Login
                </Link>
              </div>
            </section>

            <section className="relative">
              <div className="absolute inset-x-8 top-0 h-20 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="grid gap-4 rounded-[30px] border border-white/80 bg-white/70 p-5 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur-md">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { icon: FiTrendingUp, label: 'Data-Driven' },
                    { icon: FiPieChart, label: 'Smart Insights' },
                    { icon: FiUsers, label: 'Better Decisions' },
                    { icon: FiBarChart2, label: 'Continuous Growth' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-slate-100 bg-white px-3 py-5 text-center shadow-sm">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
                          <Icon />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700">{item.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-[24px] border border-dashed border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-5 py-6">
                  <div className="mb-4 h-64 rounded-[22px] bg-[url('/src/assets/bg-iit.jpg.png')] bg-cover bg-center shadow-inner ring-1 ring-white/70" />
                  <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">Welcome</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Start at the landing page, then sign in to manage visits, students, and analytics.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;