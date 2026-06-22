import React from 'react';
import { ShieldCheck } from 'lucide-react';
import SecurityIllustration from '../components/SecurityIllustration';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from '../../../components/ui/Toast';

export default function LoginPage() {
  const { login, isLoading, lockoutTime } = useAuth();

  const handleLoginRequest = async (formData) => {
    await login(formData);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-emerald-100">
      <ToastContainer />

      <SecurityIllustration />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="text-center lg:hidden">
            <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-2">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              SMART DOOR ACCESS
            </h2>
            <p className="text-xs text-slate-500">
              Sistem Monitoring dan Akses Pintu
            </p>
          </div>

          <div className="text-left hidden lg:block">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Otentikasi Pengguna
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan kredensial administrator untuk masuk ke panel pemantauan sistem.
            </p>
          </div>

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