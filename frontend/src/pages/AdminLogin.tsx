import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { AdminCredentials, TokenResponse } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState<AdminCredentials>({ username: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post<TokenResponse>(`${API}/auth/login`, credentials);
      localStorage.setItem('admin_token', response.data.token);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2" data-testid="admin-login-title">
            Admin Login
          </h1>
          <p className="text-slate-600">Sign in to manage Blue Mill</p>
        </div>

        <div className="bg-white border border-slate-200 p-8" data-testid="login-form">
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 pl-12 pr-4 text-lg placeholder:text-slate-400"
                  placeholder="Enter username"
                  data-testid="username-input"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 pl-12 pr-4 text-lg placeholder:text-slate-400"
                  placeholder="Enter password"
                  data-testid="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary-hover px-8 py-4 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              Default credentials: <span className="font-mono font-bold">admin</span> / <span className="font-mono font-bold">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
