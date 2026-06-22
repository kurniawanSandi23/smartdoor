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

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                <UserPlus size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                Registrasi Wajah Pengguna
              </h3>
            </div>

            <form onSubmit={handleRegisterFace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Nama Lengkap Pengguna
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  disabled={statusPi === 'WAITING' || isSubmitting}
                  placeholder="Contoh: Kurniawan Sandi"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 transition-all disabled:opacity-50"
                />
              </div>

              {statusPi === 'IDLE' && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-colors flex justify-center items-center space-x-2 shadow-sm"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Permintaan ke Raspberry Pi'}</span>
                </button>
              )}

              {statusPi === 'WAITING' && (
                <div className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase flex justify-center items-center space-x-2 shadow-md shadow-amber-500/10 animate-pulse">
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Menunggu Respons Sistem...</span>
                </div>
              )}

              {statusPi === 'SUCCESS' && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-colors flex justify-center items-center space-x-2 shadow-sm"
                >
                  <span>Daftarkan Pengguna Lain</span>
                </button>
              )}
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status Sinkronisasi Perangkat</span>
              {statusPi === 'IDLE' && (
                <span className="text-xs font-bold text-slate-500 block mt-0.5">Sistem siap menerima permintaan</span>
              )}
              {statusPi === 'WAITING' && (
                <span className="text-xs font-bold text-amber-600 flex items-center mt-0.5 font-mono">
                  Permintaan sedang diproses...
                </span>
              )}
              {statusPi === 'SUCCESS' && (
                <span className="text-xs font-bold text-emerald-600 block mt-0.5">Permintaan berhasil diproses</span>
              )}
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors ${
                statusPi === 'WAITING'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : statusPi === 'SUCCESS'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              Status: {statusPi}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {statusPi !== 'WAITING' ? (
            <div>
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                  <HelpCircle size={16} />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Prosedur Registrasi Wajah
                </h3>
              </div>

              <ol className="space-y-3.5 text-xs text-slate-500 font-medium">
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-800 font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-2.5">1</span>
                  <span>Administrator memasukkan nama lengkap pengguna pada form yang tersedia.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-800 font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-2.5">2</span>
                  <span>Frontend mengirimkan permintaan ke backend Flask untuk diteruskan ke Raspberry Pi.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-800 font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-2.5">3</span>
                  <span>Raspberry Pi melakukan proses perekaman dan hasilnya disimpan ke database melalui backend.</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center justify-center py-6 relative z-10 text-center">
              <div className="relative mb-4 flex items-center justify-center">
                <span className="absolute inline-flex h-20 w-20 rounded-full bg-amber-400/20 animate-ping"></span>
                <span className="absolute inline-flex h-28 w-28 rounded-full bg-amber-400/10 animate-pulse"></span>
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-600 relative z-10">
                  <Camera size={28} className="animate-bounce" />
                </div>
              </div>
              <h4 className="text-xs font-mono font-black text-slate-900 tracking-wider uppercase">
                Proses Registrasi Berjalan
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1 font-medium">
                Sistem sedang memproses permintaan pendaftaran wajah pada perangkat edge.
              </p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex items-center space-x-2.5 text-[11px] font-medium text-slate-500 mt-6 md:mt-0">
            <Shield size={14} className="text-slate-400" />
            <span>Proses registrasi dijalankan melalui otorisasi admin yang aman.</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-center justify-center text-center text-[11px] font-medium text-slate-400 shadow-sm">
        <span>&copy; {new Date().getFullYear()} Kurniawan Sandi &bull; Politeknik Negeri Jakarta. All Rights Reserved.</span>
      </div>
    </div>
  );
}