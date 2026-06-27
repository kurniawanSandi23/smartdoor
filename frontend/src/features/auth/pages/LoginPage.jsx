import React from 'react';
import { Fingerprint } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from '../../../components/ui/Toast';

const pills = [
  'Captcha & rate limiting',
  'Log akses real-time',
  'Keamanan berlapis',
];

export default function LoginPage() {
  const { login, isLoading, lockoutTime } = useAuth();

  const handleLoginRequest = async (formData) => {
    await login(formData);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-indigo-50 p-6 antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <ToastContainer />

      <div className="grid w-full max-w-[860px] overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(99,102,241,0.13),0_2px_8px_rgba(0,0,0,0.06)]"
        style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* ── Left panel ── */}
        <div
          className="relative flex flex-col justify-between overflow-hidden p-[52px_44px]"
          style={{ background: 'linear-gradient(145deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)' }}
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-white/[0.05]" />

          <div className="relative z-10 space-y-8">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/20 bg-white/15 text-white">
              <Fingerprint size={28} />
            </div>

            {/* Text */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
                Smart Door Lock
              </p>
              <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.04em] text-white">
                Admin<br />Dashboard
              </h1>
              <p className="max-w-[220px] text-xs leading-[1.75] text-white/50">
                Monitoring akses pintu secara real-time, aman dan responsif.
              </p>
            </div>

            {/* Pills */}
            <div className="flex flex-col gap-2">
              {pills.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-[10px] rounded-full border border-white/10 bg-white/[0.08] px-[14px] py-[9px]"
                >
                  <span className="h-[7px] w-[7px] flex-shrink-0 rounded-full bg-cyan-200" />
                  <span className="text-[11px] text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 border-t border-white/10 pt-4">
            <p className="text-[10px] text-white/20">
              Smart Door Lock System &mdash; Secure Access
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col justify-center bg-white px-11 py-[52px]">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-400">
            Autentikasi
          </p>
          <h2 className="mb-8 text-[22px] font-extrabold tracking-[-0.04em] text-indigo-950">
            Selamat datang
          </h2>

          <LoginForm
            onLoginSubmit={handleLoginRequest}
            isFormDisabled={isLoading || lockoutTime > 0}
            lockoutTime={lockoutTime}
          />
        </div>

      </div>
    </div>
  );
}