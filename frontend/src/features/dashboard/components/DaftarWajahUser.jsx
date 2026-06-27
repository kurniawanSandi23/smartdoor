import React, { useState } from 'react';
import { Send, RefreshCw, UserPlus, HelpCircle, Shield, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../config/api';

export default function DaftarWajahUser() {
  const [nama, setNama] = useState('');
  const [statusPi, setStatusPi] = useState('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterFace = async (e) => {
    e.preventDefault();

    const cleanName = nama.trim();
    if (!cleanName) {
      toast.error('Nama lengkap pengguna wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setStatusPi('WAITING');

    try {
      const response = await api.post('/api/user/register-face', {
        namaUser: cleanName,
      });

      if (response.status === 200 || response.status === 201) {
        setStatusPi('SUCCESS');
        toast.success(response.data?.message || `Permintaan pendaftaran wajah untuk "${cleanName}" berhasil dikirim.`);
      } else {
        setStatusPi('IDLE');
        toast.error('Gagal mengirim permintaan pendaftaran wajah.');
      }
    } catch (error) {
      setStatusPi('IDLE');

      const errorMessage =
        error.response?.data?.message ||
        'Server tidak merespons saat permintaan pendaftaran wajah dikirim.';

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNama('');
    setStatusPi('IDLE');
  };

  /* ── Status config ── */
  const statusConfig = {
    IDLE:    { label: 'Siap',       color: 'text-slate-500',  bg: 'bg-slate-50',   border: 'border-slate-200',   dot: 'bg-slate-400' },
    WAITING: { label: 'Memproses', color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500' },
    SUCCESS: { label: 'Berhasil',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  };
  const sc = statusConfig[statusPi] || statusConfig.IDLE;

  return (
    <div className="space-y-5 max-w-4xl">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── Left: Form Card ── */}
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
          style={{ boxShadow: '0 1px 3px rgba(108,99,255,.06), 0 4px 16px rgba(108,99,255,.04)' }}
        >
          {/* Top accent bar */}
          <div
            className="h-[3px] w-full"
            style={{ background: 'linear-gradient(90deg,#6C63FF,#9B59F5)' }}
          />

          <div className="p-6 flex flex-col flex-1 gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg,#6C63FF,#9B59F5)', boxShadow: '0 4px 12px rgba(108,99,255,.3)' }}
              >
                <UserPlus size={16} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-slate-800 tracking-tight leading-none">
                  Registrasi Wajah Pengguna
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Kirim permintaan ke Raspberry Pi
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterFace} className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[.15em] block">
                  Nama Lengkap Pengguna
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  disabled={statusPi === 'WAITING' || isSubmitting}
                  placeholder="Contoh: Kurniawan Sandi"
                  className="w-full px-4 py-3 bg-[#fafbff] border border-indigo-100 rounded-xl focus:outline-none focus:ring-4 focus:border-[#6C63FF] text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 transition-all disabled:opacity-50"
                  style={{ '--tw-ring-color': 'rgba(108,99,255,.12)' }}
                />
              </div>

              {statusPi === 'IDLE' && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-[11px] font-bold tracking-wider text-white transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: isSubmitting
                      ? 'rgba(108,99,255,.6)'
                      : 'linear-gradient(135deg,#6C63FF,#9B59F5)',
                    boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(108,99,255,.35)',
                  }}
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Permintaan ke Raspberry Pi'}</span>
                </button>
              )}

              {statusPi === 'WAITING' && (
                <div
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-[11px] font-bold tracking-wider text-white animate-pulse"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', boxShadow: '0 4px 16px rgba(245,158,11,.25)' }}
                >
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Menunggu Respons Sistem...</span>
                </div>
              )}

              {statusPi === 'SUCCESS' && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-[11px] font-bold tracking-wider text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 4px 16px rgba(16,185,129,.3)' }}
                >
                  <UserPlus size={13} />
                  <span>Daftarkan Pengguna Lain</span>
                </button>
              )}
            </form>

            {/* Status Footer */}
            <div
              className="flex items-center justify-between pt-4 mt-auto"
              style={{ borderTop: '1px solid #f1f5f9' }}
            >
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[.18em] block">
                  Status Sinkronisasi
                </span>
                {statusPi === 'IDLE' && (
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                    Sistem siap menerima permintaan
                  </span>
                )}
                {statusPi === 'WAITING' && (
                  <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">
                    Permintaan sedang diproses...
                  </span>
                )}
                {statusPi === 'SUCCESS' && (
                  <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
                    Permintaan berhasil diproses
                  </span>
                )}
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border ${sc.bg} ${sc.color} ${sc.border}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Info / Waiting Card ── */}
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
          style={{ boxShadow: '0 1px 3px rgba(108,99,255,.06), 0 4px 16px rgba(108,99,255,.04)' }}
        >
          {/* Top accent bar — amber when waiting, violet otherwise */}
          <div
            className="h-[3px] w-full"
            style={{
              background: statusPi === 'WAITING'
                ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                : statusPi === 'SUCCESS'
                ? 'linear-gradient(90deg,#10b981,#34d399)'
                : 'linear-gradient(90deg,#6C63FF,#9B59F5)',
            }}
          />

          <div className="p-6 flex flex-col flex-1 gap-5">
            {statusPi !== 'WAITING' ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: '#f5f3ff', color: '#6C63FF' }}
                  >
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-800 tracking-tight leading-none">
                      Prosedur Registrasi Wajah
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Ikuti langkah berikut dengan benar
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <ol className="flex flex-col gap-3 flex-1">
                  {[
                    'Administrator memasukkan nama lengkap pengguna pada form yang tersedia.',
                    'Frontend mengirimkan permintaan ke backend Flask untuk diteruskan ke Raspberry Pi.',
                    'Raspberry Pi melakukan proses perekaman dan hasilnya disimpan ke database melalui backend.',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white mt-0.5"
                        style={{ background: 'linear-gradient(135deg,#6C63FF,#9B59F5)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[12px] text-slate-500 font-medium leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              /* Waiting animation */
              <div className="flex flex-col items-center justify-center flex-1 py-4 text-center gap-4">
                <div className="relative flex items-center justify-center">
                  <span className="absolute h-24 w-24 rounded-full bg-amber-400/15 animate-ping" />
                  <span className="absolute h-32 w-32 rounded-full bg-amber-400/08 animate-pulse" />
                  <div
                    className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border"
                    style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#f59e0b' }}
                  >
                    <Camera size={26} className="animate-bounce" />
                  </div>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-800 tracking-tight">
                    Proses Registrasi Berjalan
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Sistem sedang memproses permintaan pendaftaran wajah pada perangkat edge.
                  </p>
                </div>
              </div>
            )}

            {/* Security notice */}
            <div
              className="flex items-center gap-2.5 p-3 rounded-xl mt-auto"
              style={{ background: '#f8f7ff', border: '1px solid rgba(108,99,255,.12)' }}
            >
              <Shield size={14} style={{ color: '#6C63FF', flexShrink: 0 }} />
              <span className="text-[11px] font-medium text-slate-500 leading-snug">
                Proses registrasi dijalankan melalui otorisasi admin yang aman.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-100 bg-white text-[11px] font-medium text-slate-400"
        style={{ boxShadow: '0 1px 3px rgba(108,99,255,.04)' }}
      >
        <div
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{ background: 'linear-gradient(135deg,#6C63FF,#9B59F5)' }}
        >
          <span className="text-[8px] font-bold text-white">S</span>
        </div>
        <span>© {new Date().getFullYear()} Smart Door Lock — All Rights Reserved.</span>
      </div>

    </div>
  );
}