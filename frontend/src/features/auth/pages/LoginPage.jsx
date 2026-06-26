import React from 'react';
import { ShieldCheck } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from '../../../components/ui/Toast';

export default function LoginPage() {
  const { login, isLoading, lockoutTime } = useAuth();

  const handleLoginRequest = async (formData) => {
    await login(formData);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] font-sans text-slate-800 antialiased">
      <ToastContainer />

      <div className="flex min-h-screen items-center justify-center px-4 py-3 sm:px-6">
        <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_-20px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col items-center bg-slate-900 px-6 py-5 text-center text-white sm:px-8">
            <div className="mb-3 flex h-13 w-13 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <ShieldCheck size={24} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold">Masuk ke Sistem</h2>
            <p className="mt-1 text-sm text-slate-300">
              Silakan gunakan akun administrator untuk melanjutkan akses.
            </p>
          </div>

          <div className="px-5 py-4 sm:px-7 sm:py-5">
            <LoginForm
              onLoginSubmit={handleLoginRequest}
              isFormDisabled={isLoading || lockoutTime > 0}
              lockoutTime={lockoutTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}