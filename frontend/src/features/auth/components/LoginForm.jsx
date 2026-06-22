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
    } catch (error) {
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
        setErrors({
          captchaInput: 'Captcha belum siap. Silakan muat ulang captcha.',
        });
        return false;
      }

      if (!formData.captchaInput.trim()) {
        setErrors({
          captchaInput: 'Kode captcha wajib diisi.',
        });
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Username
        </label>
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
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 transition-all disabled:opacity-50"
          />
        </div>
        {errors.username && (
          <p className="text-xs text-red-500 font-medium">{errors.username}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Password
        </label>
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
            className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 transition-all disabled:opacity-50"
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
        {errors.password && (
          <p className="text-xs text-red-500 font-medium">{errors.password}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Kode Captcha
        </label>

        <div className="flex items-center gap-3">
          <div className="w-32 h-12 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden select-none">
            {captchaLoading ? (
              <RefreshCw size={16} className="animate-spin text-slate-500" />
            ) : captchaSvg ? (
              <img
                src={captchaSvg}
                alt="captcha"
                className="w-full h-full object-contain"
                draggable="false"
              />
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
            placeholder="Tulis captcha"
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold uppercase placeholder:font-normal placeholder:text-slate-400 transition-all disabled:opacity-50"
          />

          <button
            type="button"
            onClick={fetchCaptcha}
            className="px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            title="Muat ulang captcha"
            disabled={isFormDisabled}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {errors.captchaInput && (
          <p className="text-xs text-red-500 font-medium">{errors.captchaInput}</p>
        )}
      </div>

      <div className="flex items-start space-x-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <Shield size={14} className="text-slate-400 mt-0.5 shrink-0" />
        <span>
          Gunakan kredensial administrator yang valid untuk mengakses panel pemantauan sistem.
        </span>
      </div>

      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-colors flex justify-center items-center space-x-2 shadow-sm"
      >
        <span>Masuk ke Sistem</span>
      </button>
    </form>
  );
}