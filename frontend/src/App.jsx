import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VisitsPage from './pages/VisitsPage';
import VisitDetailsPage from './pages/VisitDetailsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/Login';
import AdminRegisterPage from './pages/AdminRegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'student' ? '/student-dashboard' : '/admin-dashboard'} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-register" element={<AdminRegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin', 'examiner']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/visits" element={<VisitsPage />} />
        <Route path="/visits/:id" element={<VisitDetailsPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
