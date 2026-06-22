import React, { useState } from 'react';
import { Users, Clock, Monitor, ShieldCheck, Info } from 'lucide-react';

export default function KelolaPengguna() {
  // Data simulasi log otentikasi administrator (Sesuai kebutuhan pencatatan web service skripsi)
  const [adminLogins] = useState([
    { id: 1, nama: 'Kurniawan Sandi (Admin Utama)', waktu: '2026-06-22 05:08:42', tempat: 'Lab Jaringan PNJ (IP: 10.20.30.15)', device: 'Chrome v126 - Windows 11' },
    { id: 2, nama: 'Kurniawan Sandi (Admin Utama)', waktu: '2026-06-22 04:45:12', tempat: 'Sistem Lokal (IP: 127.0.0.1)', device: 'Edge v125 - Windows 11' },
    { id: 3, nama: 'Kurniawan Sandi (Admin Utama)', waktu: '2026-06-21 21:24:02', tempat: 'Akses Wi-Fi Luar (IP: 192.168.1.105)', device: 'Safari v17.4 - MacOS' },
  ]);

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* SECTION 1: RINGKASAN METRIK AUDIT SESI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Level Hak Akses</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">Root Administrator (Full Privilege)</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Riwayat Sesi Tercatat</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">{adminLogins.length} Aktif di Database</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: BLOK INFORMASI ATURAN AKADEMIS */}
      <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl flex items-start space-x-3 text-xs text-emerald-800">
        <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Informasi Sesi Read-Only</p>
          <p className="text-emerald-700/90 leading-relaxed font-medium">
            Halaman ini mencatat integritas data forensik dari setiap administrator yang berhasil melewati pengujian verifikasi kata sandi dan Captcha 4 Huruf. Demi kepatuhan keamanan audit skripsi, data ini tidak dapat dimodifikasi atau dihapus oleh aksi pengguna.
          </p>
        </div>
      </div>

      {/* SECTION 3: TABEL DATA UTAMA AUDIT LOGIN */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-50 text-slate-600 rounded-md">
            <Users size={14} />
          </div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            User Authentication Tracking Logs
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Nama Administrator</th>
                <th className="px-6 py-3.5">Waktu Sesi Aktif (Timestamp)</th>
                <th className="px-6 py-3.5">Lokasi Jaringan (IP Address)</th>
                <th className="px-6 py-3.5">User-Agent Perangkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {adminLogins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/40 transition-colors">
                  {/* Kolom Nama */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-slate-900">{admin.nama}</span>
                    </div>
                  </td>
                  
                  {/* Kolom Waktu */}
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {admin.waktu}
                  </td>
                  
                  {/* Kolom Lokasi Tempat */}
                  <td className="px-6 py-4 text-slate-600">
                    {admin.tempat}
                  </td>
                  
                  {/* Kolom Spesifikasi Device */}
                  <td className="px-6 py-4 text-slate-400 font-mono text-[11px] flex items-center space-x-1.5">
                    <Monitor size={12} className="text-slate-300" />
                    <span>{admin.device}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: HAK CIPTA / COPYRIGHT FOOTER CARD */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-center justify-center text-center text-[11px] font-medium text-slate-400 shadow-sm">
        <span>&copy; {new Date().getFullYear()} Kurniawan Sandi &bull; Politeknik Negeri Jakarta. All Rights Reserved.</span>
      </div>

    </div>
  );
}