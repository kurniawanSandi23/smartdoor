import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import { Cpu, Database, ShieldAlert, Activity, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function MonitoringRealtime() {
  const [summary, setSummary] = useState({
    total_access_logs: 0,
    total_register_logs: 0,
    total_spoofing_logs: 0,
  });
  const [spoofingLogs, setSpoofingLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchMonitoringData = async () => {
    try {
      const [summaryResponse, spoofingResponse, devicesResponse] = await Promise.all([
        api.get('/api/logs/dashboard-summary'),
        api.get('/api/logs/spoofing', { params: { limit: 10 } }),
        api.get('/api/devices'),
      ]);

      const summaryData = summaryResponse.data?.data || summaryResponse.data?.summary || summaryResponse.data || {
        total_access_logs: 0,
        total_register_logs: 0,
        total_spoofing_logs: 0,
      };

      const extractDataArray = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray(payload.data)) return payload.data;
        if (payload && payload.data && Array.isArray(payload.data.data)) return payload.data.data;
        if (payload && payload.result && Array.isArray(payload.result)) return payload.result;
        return [];
      };

      const spoofingData = extractDataArray(spoofingResponse.data);
      const deviceData = extractDataArray(devicesResponse.data);

      setSummary(summaryData);
      setSpoofingLogs(spoofingData);
      setDevices(deviceData);
      setIsError(false);
      setLastUpdated(new Date().toLocaleString('id-ID'));
    } catch (error) {
      console.error('Gagal memuat data monitoring:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 5000);
    return () => clearInterval(interval);
  }, []);

  const onlineDevices = devices.filter(
    (device) => String(device.status || '').toLowerCase() === 'online'
  ).length;

  return (
    <div className="space-y-6 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status Node Edge</span>
            <span className="text-base font-black text-emerald-600 font-mono mt-1 flex items-center">
              <span className={`w-2 h-2 rounded-full inline-block mr-2 ${isError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              {isError ? 'TERPUTUS' : 'TERHUBUNG'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              {isLoading ? 'Memuat status perangkat...' : `${onlineDevices} dari ${devices.length} device online`}
            </span>
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
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              {summary.total_access_logs} log akses tersimpan
            </span>
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
              {summary.total_spoofing_logs} EVENT
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              Deteksi liveness aktif
            </span>
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
              Log Ancaman Spoofing Real-Time
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] bg-slate-100 px-2 py-1 text-slate-500 font-mono font-bold rounded">
              METODE: LIVENESS
            </span>
            <button
              type="button"
              onClick={fetchMonitoringData}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={12} />
              MUAT ULANG
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Waktu Event</th>
                <th className="px-6 py-3">Jenis Ancaman</th>
                <th className="px-6 py-3 text-center">Skor Spoof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-xs font-semibold text-slate-400 font-mono">
                    SEDANG MEMUAT DATA MONITORING...
                  </td>
                </tr>
              ) : spoofingLogs.length > 0 ? (
                spoofingLogs.map((log) => {
                  const waktu = log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID') : '-';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-slate-500">{waktu}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{log.spoofType || '-'}</td>
                      <td className="px-6 py-3.5 font-mono text-center font-bold text-slate-600">
                        {typeof log.spoofScore === 'number' ? log.spoofScore.toFixed(2) : log.spoofScore || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            Number(log.spoofScore) >= 0.5
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {Number(log.spoofScore) >= 0.5 ? 'DITOLAK' : 'DITERIMA'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-xs font-semibold text-slate-400 font-mono">
                    BELUM ADA DATA SPOOFING YANG TERSIMPAN.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-slate-400 shadow-sm">
        <span>&copy; {new Date().getFullYear()} SMART DOOR LOCK &bull; Smart Door Lock. All Rights Reserved.</span>
        <span>Terakhir diperbarui: {lastUpdated || '-'}</span>
      </div>
    </div>
  );
}