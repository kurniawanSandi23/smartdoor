import React, { useState } from 'react';
import { Cpu, Database, ShieldAlert, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MonitoringRealtime() {
  const [spoofingLogs] = useState([
    { id: 1, waktu: '05:01:22', tipe: 'Serangan Foto', status: 'DITOLAK', skor: '0.94' },
    { id: 2, waktu: '04:58:10', tipe: 'Serangan Video', status: 'DITOLAK', skor: '0.89' },
    { id: 3, waktu: '04:12:05', tipe: 'Wajah Valid', status: 'DITERIMA', skor: '0.12' }
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status Node Edge</span>
            <span className="text-base font-black text-emerald-600 font-mono mt-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 animate-ping"></span>
              TERHUBUNG
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Beban CPU: 24% | Suhu: 48°C</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Cpu size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Koneksi Database</span>
            <span className="text-base font-black text-emerald-600 font-mono mt-1 flex items-center">
              <CheckCircle size={16} className="mr-1.5 text-emerald-500" />
              TERHUBUNG
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Database server melalui layanan API</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Database size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ancaman Spoofing</span>
            <span className="text-base font-black text-red-600 font-mono mt-1 flex items-center">
              <AlertTriangle size={16} className="mr-1.5 animate-pulse" />
              2 ANCAMAN TERDETEKSI
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Deteksi liveness aktif</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity size={14} className="text-slate-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Log Analitik Anti-Spoofing Real-Time
            </h3>
          </div>
          <span className="text-[9px] bg-slate-100 px-2 py-1 text-slate-500 font-mono font-bold rounded">
            METODE: LIVENESS CNN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Waktu Event</th>
                <th className="px-6 py-3">Analisis Citra Masuk</th>
                <th className="px-6 py-3 text-center">Nilai Kedalaman (Spoof Score)</th>
                <th className="px-6 py-3 text-right">Tindakan Sistem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {spoofingLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-slate-500">{log.waktu}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{log.tipe}</td>
                  <td className="px-6 py-3.5 font-mono text-center font-bold text-slate-600">{log.skor}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        log.status === 'DITOLAK'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-center justify-center text-center text-[11px] font-medium text-slate-400 shadow-sm">
        <span>&copy; {new Date().getFullYear()} Kurniawan Sandi &bull; Politeknik Negeri Jakarta. All Rights Reserved.</span>
      </div>
    </div>
  );
}