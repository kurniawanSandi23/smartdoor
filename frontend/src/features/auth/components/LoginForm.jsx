import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, User, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../../../config/api';
import { loginSchema } from '../../../validators/authValidator';
import { sanitizeInput } from '../utils/securitySanitizer';

const inputBase =
  'w-full rounded-xl border-[1.5px] bg-[#f8f7ff] py-3 text-[13px] text-indigo-950 placeholder:text-gray-300 outline-none transition-all duration-150 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

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
      setFormData((prev) => ({ ...prev, challengeId: data.challengeId || '', captchaInput: '' }));
    } catch {
      setCaptchaSvg('');
      setFormData((prev) => ({ ...prev, challengeId: '', captchaInput: '' }));
      setErrors((prev) => ({ ...prev, captchaInput: 'Captcha gagal dimuat. Silakan muat ulang.' }));
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => { fetchCaptcha(); }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      setErrors((prev) => ({ ...prev, captchaInput: `Akses diblokir. Coba lagi dalam ${lockoutTime} detik.` }));
    } else {
      setErrors((prev) => { const n = { ...prev }; delete n.captchaInput; return n; });
    }
  }, [lockoutTime]);

  const handleChange = (field, value) => {
    const v = field === 'username' || field === 'captchaInput' ? sanitizeInput(value) : value;
    setFormData((prev) => ({ ...prev, [field]: v }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    try {
      loginSchema.parse({ username: formData.username, password: formData.password, rememberMe: false });
      if (!formData.challengeId) { setErrors({ captchaInput: 'Captcha belum siap. Silakan muat ulang.' }); return false; }
      if (!formData.captchaInput.trim()) { setErrors({ captchaInput: 'Kode captcha wajib diisi.' }); return false; }
      return true;
    } catch (error) {
      const e = {};
      error.errors?.forEach((i) => { e[i.path[0]] = i.message; });
      setErrors(e);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormDisabled || !validateForm()) return;
    const result = await onLoginSubmit(formData);
    if (!result?.success) {
      if (result.type === 'credentials') {
        setErrors({ username: 'Username tidak sesuai.', password: 'Password tidak sesuai.' });
      } else if (result.type === 'captcha') {
        setErrors({ captchaInput: result.message || 'Captcha salah.' });
      } else if (result.type === 'lockout') {
        setErrors({ captchaInput: result.message || `Akses diblokir. Coba lagi dalam ${lockoutTime} detik.` });
      }
    }
  };

  const fieldError = (key) =>
    errors[key] ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">

      {/* Username */}
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Username
        </label>
        <div className="relative">
          <User size={15} className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-violet-300" />
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            disabled={isFormDisabled}
            placeholder="admin"
            className={`${inputBase} pl-10 pr-4 border-[#e9e8f8] ${errors.username ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : ''}`}
          />
        </div>
        {fieldError('username')}
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Password
        </label>
        <div className="relative">
          <Lock size={15} className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-violet-300" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={isFormDisabled}
            placeholder="••••••••"
            className={`${inputBase} pl-10 pr-11 border-[#e9e8f8] ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : ''}`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-[13px] top-1/2 -translate-y-1/2 text-violet-300 transition hover:text-violet-500"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {fieldError('password')}
      </div>

      {/* Captcha */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Captcha
          </label>
          <button
            type="button"
            onClick={fetchCaptcha}
            disabled={isFormDisabled}
            className="flex items-center gap-1 rounded-lg border border-[#e9e8f8] px-2.5 py-1 text-[11px] text-gray-400 transition hover:border-indigo-400 hover:text-indigo-500 disabled:opacity-40"
          >
            <RefreshCw size={11} className={captchaLoading ? 'animate-spin' : ''} />
            Muat ulang
          </button>
        </div>

        <div className="grid gap-2.5" style={{ gridTemplateColumns: '88px 1fr' }}>
          <div className="flex h-11 items-center justify-center rounded-xl border-[1.5px] border-[#e9e8f8] bg-[#f8f7ff]">
            {captchaLoading ? (
              <RefreshCw size={15} className="animate-spin text-violet-300" />
            ) : captchaSvg ? (
              <img src={captchaSvg} alt="captcha" className="h-full w-full object-contain" draggable="false" />
            ) : (
              <span className="text-[11px] text-gray-300">Gagal</span>
            )}
          </div>
          <input
            type="text"
            value={formData.captchaInput}
            onChange={(e) => handleChange('captchaInput', e.target.value.toUpperCase())}
            disabled={isFormDisabled}
            maxLength={6}
            placeholder="Kode"
            className={`${inputBase} px-4 font-mono tracking-[0.14em] uppercase border-[#e9e8f8] ${errors.captchaInput ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : ''}`}
          />
        </div>
        {fieldError('captchaInput')}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isFormDisabled}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-[14px] text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
      >
        <ArrowRight size={15} />
        {isFormDisabled ? 'Memproses...' : 'Masuk'}
      </button>

      {/* Lockout banner */}
      {lockoutTime > 0 && (
        <div className="rounded-xl border-[1.5px] border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[11px] font-bold text-red-500">Akses diblokir sementara</p>
          <p className="mt-0.5 text-[11px] text-red-300">
            Coba lagi dalam <strong className="text-red-400">{lockoutTime} detik</strong>.
          </p>
        </div>
      )}
    </form>
  );
}