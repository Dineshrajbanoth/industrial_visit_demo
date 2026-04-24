import { createContext, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'iv_token';
const USER_KEY = 'iv_user';

function readStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('iv_admin_token') || localStorage.getItem('iv_student_token');
}

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('iv_admin_user') || localStorage.getItem('iv_student_user');
  return raw ? JSON.parse(raw) : null;
}

function persistSession(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem('iv_admin_token');
  localStorage.removeItem('iv_student_token');
  localStorage.removeItem('iv_admin_user');
  localStorage.removeItem('iv_student_user');
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(() => readStoredUser());

  const isAuthenticated = !!token;

  const loginAdmin = async (credentials) => {
    const { data } = await authApi.adminLogin(credentials);
    persistSession(data.user, data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success('Welcome back, admin.');
    return data.user;
  };

  const login = loginAdmin;

  const loginStudent = async (credentials) => {
    const { data } = await authApi.studentLogin(credentials);
    persistSession(data.user, data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome, ${data.user.rollNo}.`);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('iv_admin_token');
    localStorage.removeItem('iv_student_token');
    localStorage.removeItem('iv_admin_user');
    localStorage.removeItem('iv_student_user');
    setToken(null);
    setUser(null);
    toast('You have been signed out.');
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated, role: user?.role || null, login, loginAdmin, loginStudent, logout }),
    [user, token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
