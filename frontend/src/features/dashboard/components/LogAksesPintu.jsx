import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import { ClipboardList, Calendar, Database, Search } from 'lucide-react';

export default function LogAksesPintu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [databaseLogs, setDatabaseLogs] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/logs/akses-pintu', {
        params: { limit: 100 },
      });

      const logs = response.data?.data || [];
      setDatabaseLogs(Array.isArray(logs) ? logs : []);
      setIsError(false);
    } catch (error) {
      console.error('Gagal memuat data log akses:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = databaseLogs.filter((log) =>
    String(log.namaUser || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
            <Database size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-mono">
              Log Akses Pintu Real-Time
            </h3>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              Status koneksi server:{' '}
              {isError ? (
                <span className="text-red-500 font-bold">TERHUBUNG</span>
              ) : (
                <span className="text-emerald-500 font-bold">TERHUBUNG (PostgreSQL)</span>
              )}
            </span>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Cari nama pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:font-normal"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center space-x-2">
          <ClipboardList size={14} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Riwayat Akses Tersimpan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5 text-center w-16">No</th>
                <th className="px-6 py-3.5">Nama Pengguna</th>
                <th className="px-6 py-3.5">Waktu Scan</th>
                <th className="px-6 py-3.5">Keterangan Sistem</th>
                <th className="px-6 py-3.5 text-center w-44">Status Solenoid</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-xs font-semibold text-slate-400 font-mono">
                    SEDANG MEMUAT DATA RIWAYAT AKSES...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400 text-center font-bold">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${log.status === 'AKSES DITOLAK' ? 'text-red-600' : 'text-slate-900'}`}>
                        {log.namaUser || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono flex items-center space-x-1.5">
                      <Calendar size={12} className="text-slate-300" />
                      <span>{log.waktuAkses || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {log.keterangan || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          log.status === 'AKSES DITERIMA'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40'
                            : 'bg-red-50 text-red-700 border-red-200/40'
                        }`}
                      >
                        {log.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-xs font-semibold text-slate-400 font-mono">
                    BELUM ADA DATA RIWAYAT AKSES YANG TERSIMPAN.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-center justify-center text-center text-[11px] font-medium text-slate-400 shadow-sm">
        <span>&copy; {new Date().getFullYear()} SMART DOOR LOCK &bull; Smart Door Lock. All Rights Reserved.</span>
      </div>
    </div>
  );
}