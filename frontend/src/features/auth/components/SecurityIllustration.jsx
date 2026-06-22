import React from 'react';
import { ShieldCheck, Lock, Cpu, Database, Activity, AlertTriangle } from 'lucide-react';

export default function SecurityIllustration() {
  return (
    <div className="hidden lg:flex w-1/2 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.20),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 w-full flex flex-col justify-between p-10 xl:p-14">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-300">
              Smart Door Access
            </span>
          </div>

          <div className="space-y-4 max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight">
              Sistem Monitoring Realtime dan Manajemen Akses Pintu
            </h1>
            <p className="text-sm xl:text-base text-slate-300 leading-7 max-w-lg">
              Platform ini memantau status perangkat edge, koneksi database, dan hasil deteksi
              liveness secara terpusat melalui layanan web.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xl pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Cpu size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Node Edge</span>
              </div>
              <p className="text-xs text-slate-300 leading-5">
                Memantau status perangkat Raspberry Pi dan proses autentikasi biometrik.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-sky-400 mb-2">
                <Database size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Database</span>
              </div>
              <p className="text-xs text-slate-300 leading-5">
                Seluruh log akses tersimpan dan ditampilkan secara terpusat melalui backend.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="absolute -inset-6 rounded-[2rem] bg-emerald-400/10 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md p-6 xl:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  Security Status
                </p>
                <h2 className="text-lg font-bold text-white mt-1">
                  Ringkasan Sistem Aktif
                </h2>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                <Lock size={22} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-900/70 border border-white/5 px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <Activity size={15} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    Monitoring Realtime
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Aktif
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-900/70 border border-white/5 px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
                    <Database size={15} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    Koneksi Database
                  </span>
                </div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Terhubung
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-900/70 border border-white/5 px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <AlertTriangle size={15} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    Deteksi Spoofing
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Siaga
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}