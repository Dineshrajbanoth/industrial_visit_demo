import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiBriefcase, FiSettings } from 'react-icons/fi';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const adminNavItems = [
  { to: '/admin-dashboard', label: 'Overview', icon: FiBarChart2 },
  { to: '/visits', label: 'Visits', icon: FiBriefcase },
  { to: '/admin', label: 'Manage', icon: FiSettings },
];

const studentNavItems = [
  { to: '/student-dashboard', label: 'Dashboard', icon: FiBarChart2 },
  { to: '/visits', label: 'Visits', icon: FiBriefcase },
];

function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const navItems = user?.role === 'student' ? studentNavItems : adminNavItems;

  return (
    <aside
      className={clsx(
        'glass sticky top-0 h-screen border-r border-slate-200 p-3 transition-all duration-300',
        collapsed ? 'w-[88px]' : 'w-[250px]'
      )}
    >
      <button
        className="mb-6 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100"
        onClick={onToggle}
      >
        {collapsed ? '>>' : 'Collapse'}
      </button>

      <div className="mb-8 px-2">
        <h1 className={clsx('font-heading text-lg font-bold text-ocean', collapsed && 'text-center text-base')}>
          {collapsed ? 'IV' : 'Industrial Visit'}
        </h1>
        {!collapsed && <p className="text-xs text-slate-500">{user?.role === 'student' ? 'Student Portal' : 'Analytics Dashboard'}</p>}
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-ocean text-white' : 'text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <Icon size={16} />
              {!collapsed && item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
