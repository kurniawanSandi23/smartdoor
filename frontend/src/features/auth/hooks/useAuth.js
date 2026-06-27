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
      const message = 'Akses diblokir sementara. Tunggu beberapa saat.';
      toast.error(message);
      return { success: false, type: 'lockout', message };
    }

    setIsLoading(true);

    try {
      const payload = {
        username: sanitizeInput(formData.username || ''),
        password: formData.password || '',
        captchaInput: sanitizeInput(formData.captchaInput || ''),
        challengeId: formData.challengeId || '',
      };

      const response = await api.post('/api/auth/login', payload);
      const responseData = response.data?.data || {};
      const accessToken = responseData.access_token;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        const apiKey = import.meta.env.VITE_API_KEY || '';
        if (apiKey) {
          localStorage.setItem('apiKey', apiKey);
        }
      }

      setFailedAttempts(0);
      toast.success('Login berhasil.');
      navigate('/dashboard', { replace: true });

      return { success: true, data: responseData };
    } catch (error) {
      const backendMessage = error.response?.data?.message || '';
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (error.response?.status === 429) {
        setLockoutTime(60);
        const message =
          backendMessage ||
          'Akses diblokir selama 1 menit karena 3 kali percobaan gagal.';
        toast.error(message);
        return { success: false, type: 'lockout', message };
      }

      if (error.response?.status === 401) {
        let message = 'Login gagal. Silakan periksa kembali input Anda.';
        let type = 'credentials';

        if (backendMessage === 'Username atau password salah') {
          message = 'Tolong masukkan username atau password yang sesuai.';
          type = 'credentials';
        } else if (backendMessage === 'Captcha salah') {
          message = 'Tolong masukkan captcha yang benar.';
          type = 'captcha';
        } else if (
          backendMessage === 'Captcha kadaluarsa atau tidak valid'
        ) {
          message =
            'Captcha tidak valid atau sudah kadaluarsa. Silakan muat ulang captcha.';
          type = 'captcha';
        }

        toast.error(message);
        return { success: false, type, message };
      }

      toast.error('Gagal terhubung ke server.');
      return { success: false, type: 'network', message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, lockoutTime };
}