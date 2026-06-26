import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, User, Shield, RefreshCw } from 'lucide-react';
import api from '../../../config/api';
import { loginSchema } from '../../../validators/authValidator';
import { sanitizeInput } from '../utils/securitySanitizer';

export default function LoginForm({ onLoginSubmit, isFormDisabled, lockoutTime }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captchaInput: '',
    challengeId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const fetchCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      const response = await api.get('/api/auth/captcha');
      const data = response.data?.data || {};

      setCaptchaSvg(data.captchaSvg || '');
      setFormData((prev) => ({
        ...prev,
        challengeId: data.challengeId || '',
        captchaInput: '',
      }));
    } catch {
      setCaptchaSvg('');
      setFormData((prev) => ({
        ...prev,
        challengeId: '',
        captchaInput: '',
      }));
      setErrors((prev) => ({
        ...prev,
        captchaInput: 'Captcha gagal dimuat. Silakan muat ulang.',
      }));
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      setErrors((prev) => ({
        ...prev,
        captchaInput: `Akses dikunci sementara. Coba lagi dalam ${lockoutTime} detik.`,
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.captchaInput;
        return next;
      });
    }
  }, [lockoutTime]);

  const handleChange = (field, value) => {
    const updatedValue =
      field === 'username' || field === 'captchaInput'
        ? sanitizeInput(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [field]: updatedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = () => {
    try {
      loginSchema.parse({
        username: formData.username,
        password: formData.password,
        rememberMe: false,
      });

      if (!formData.challengeId) {
        setErrors({ captchaInput: 'Captcha belum siap. Silakan muat ulang captcha.' });
        return false;
      }

      if (!formData.captchaInput.trim()) {
        setErrors({ captchaInput: 'Kode captcha wajib diisi.' });
        return false;
      }

      return true;
    } catch (error) {
      const nextErrors = {};
      error.errors?.forEach((item) => {
        nextErrors[item.path[0]] = item.message;
      });
      setErrors(nextErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormDisabled) return;
    if (!validateForm()) return;
    await onLoginSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Username</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <User size={15} />
          </span>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            disabled={isFormDisabled}
            placeholder="Masukkan username"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          />
        </div>
        {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Lock size={15} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={isFormDisabled}
            placeholder="Masukkan password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-12 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Kode Captcha</label>
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-28 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 select-none">
            {captchaLoading ? (
              <RefreshCw size={16} className="animate-spin text-slate-500" />
            ) : captchaSvg ? (
              <img src={captchaSvg} alt="captcha" className="h-full w-full object-contain" draggable="false" />
            ) : (
              <span className="text-xs text-slate-400">Gagal</span>
            )}
          </div>

          <input
            type="text"
            value={formData.captchaInput}
            onChange={(e) => handleChange('captchaInput', e.target.value.toUpperCase())}
            disabled={isFormDisabled}
            maxLength={5}
            placeholder="Captcha"
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm uppercase text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={fetchCaptcha}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:bg-slate-50"
            title="Muat ulang captcha"
            disabled={isFormDisabled}
          >
            <RefreshCw size={15} />
          </button>
        </div>
        {errors.captchaInput && <p className="text-xs text-red-500">{errors.captchaInput}</p>}
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-2.5 text-sm text-slate-600">
        <Shield size={15} className="mt-0.5 shrink-0 text-emerald-600" />
        <span>Gunakan akun administrator yang valid untuk mengakses sistem.</span>
      </div>

      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full rounded-2xl bg-slate-900 py-2.75 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md disabled:bg-slate-400"
      >
        Masuk
      </button>
    </form>
  );
}