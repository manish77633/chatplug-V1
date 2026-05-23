import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hydrate } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userStr);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update zustand store
        hydrate();
        navigate('/dashboard', { replace: true });
      } catch (e) {
        console.error('Failed to parse user from Google Auth', e);
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [location, navigate, hydrate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 size={40} className="text-accent animate-spin mb-4" />
      <p className="text-text-muted">Authenticating...</p>
    </div>
  );
}
