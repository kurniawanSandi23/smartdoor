import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../config/api';
import { sanitizeInput } from '../utils/securitySanitizer';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (lockoutTime <= 0) return;

    const timer = setInterval(() => {
      setLockoutTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTime]);

  const login = async (formData) => {
    if (lockoutTime > 0) {
      return { success: false, message: 'Akses dikunci sementara.' };
    }

    setIsLoading(true);

    try {
      const payload = {
        username: sanitizeInput(formData.username || ''),
        password: formData.password || '',
        captchaInput: sanitizeInput(formData.captchaInput || ''),
        challengeId: formData.challengeId || '',
      };

      const response = await api.post('/api/auth/Login', payload);

      const responseData = response.data?.data || {};
      const accessToken = responseData.access_token;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      setFailedAttempts(0);
      toast.success('Login berhasil.');
      navigate('/dashboard', { replace: true });

      return { success: true, data: responseData };
    } catch (error) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (error.response?.status === 429 || nextAttempts >= 4) {
        setLockoutTime(60);
        toast.error('Terlalu banyak percobaan login. Coba lagi setelah 60 detik.');
        return { success: false, message: 'Rate limit exceeded' };
      }

      if (error.response?.status === 401) {
        toast.error('Username, password, atau captcha salah.');
        return { success: false, message: 'Unauthorized' };
      }

      toast.error('Gagal terhubung ke server.');
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, lockoutTime };
}