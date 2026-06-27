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
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onlineDevices = devices.filter(
    (device) => String(device.status || '').toLowerCase() === 'online'
  ).length;

  /* ── Stat Card ── */
  const StatCard = ({ label, value, sub, icon: Icon, accent, isError: cardError }) => {
    const accentMap = {
      violet:  { bg: 'bg-[#f5f3ff]', text: 'text-[#6C63FF]', border: 'border-[#ede9fe]', iconBg: 'bg-[#ede9fe]', dot: 'bg-[#6C63FF]', bar: 'from-[#6C63FF] to-[#9B59F5]' },
      emerald: { bg: 'bg-[#f0fdf4]', text: 'text-emerald-600', border: 'border-emerald-100', iconBg: 'bg-emerald-50', dot: 'bg-emerald-500', bar: 'from-emerald-400 to-emerald-500' },
      rose:    { bg: 'bg-[#fff1f2]', text: 'text-rose-600', border: 'border-rose-100', iconBg: 'bg-rose-50', dot: 'bg-rose-500', bar: 'from-rose-400 to-rose-500' },
    };
    const a = accentMap[accent] || accentMap.violet;

    return (
      <div
        className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between p-5 gap-3"
        style={{ boxShadow: '0 1px 3px rgba(108,99,255,0.06), 0 4px 16px rgba(108,99,255,0.04)' }}
      >
        {/* Top accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${a.bar}`} />

        <div className="flex items-start justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
              {label}
            </span>
            <span
              className={`flex items-center gap-1.5 text-lg font-extrabold font-mono leading-none ${
                cardError ? 'text-rose-500' : a.text
              }`}
            >
              {accent === 'violet' && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-70 ${
                      cardError ? 'bg-rose-400' : 'bg-emerald-400 animate-ping'
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      cardError ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  />
                </span>
              )}
              {accent === 'emerald' && <CheckCircle size={15} />}
              {accent === 'rose' && <AlertTriangle size={15} className="animate-pulse" />}
              {value}
            </span>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.iconBg} ${a.text}`}>
            <Icon size={18} />
          </div>
        </div>

        <p className="text-[11px] font-medium text-slate-400 leading-snug">{sub}</p>
      </div>
    );
  };

  return (
    <div className="space-y-5">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Status Node Edge"
          value={isError ? 'TERPUTUS' : 'TERHUBUNG'}
          sub={isLoading ? 'Memuat status perangkat...' : `${onlineDevices} dari ${devices.length} device online`}
          icon={Cpu}
          accent="violet"
          isError={isError}
        />
        <StatCard
          label="Koneksi Database"
          value="TERHUBUNG"
          sub={`${summary.total_access_logs} log akses tersimpan`}
          icon={Database}
          accent="emerald"
        />
        <StatCard
          label="Ancaman Spoofing"
          value={`${summary.total_spoofing_logs} EVENT`}
          sub="Deteksi liveness aktif"
          icon={ShieldAlert}
          accent="rose"
        />
      </div>

      {/* ── Spoofing Log Table ── */}
      <div
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(108,99,255,0.06), 0 4px 16px rgba(108,99,255,0.04)' }}
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg,#6C63FF,#9B59F5)' }}
            >
              <Activity size={13} className="text-white" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-slate-800 tracking-tight leading-none">
                Log Ancaman Spoofing
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pembaruan otomatis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold px-2.5 py-1 rounded-lg tracking-wider"
              style={{
                background: 'linear-gradient(135deg,rgba(108,99,255,.08),rgba(155,89,245,.08))',
                color: '#6C63FF',
                border: '1px solid rgba(108,99,255,.18)',
              }}
            >
              METODE: LIVENESS
            </span>
            <button
              type="button"
              onClick={fetchMonitoringData}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all duration-150"
            >
              <RefreshCw size={11} />
              Muat Ulang
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="text-[10px] font-bold uppercase tracking-wider border-b border-slate-100"
                style={{ background: '#fafbff' }}
              >
                <th className="px-6 py-3 text-slate-400">Waktu Event</th>
                <th className="px-6 py-3 text-slate-400">Jenis Ancaman</th>
                <th className="px-6 py-3 text-center text-slate-400">Skor Spoofing</th>
                <th className="px-6 py-3 text-right text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="h-7 w-7 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'rgba(108,99,255,.3)', borderTopColor: '#6C63FF' }}
                      />
                      <span className="text-[11px] font-semibold text-slate-400">
                        Memuat data monitoring...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : spoofingLogs.length > 0 ? (
                spoofingLogs.map((log) => {
                  const waktu = log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID') : '-';
                  const isHigh = Number(log.spoofScore) >= 0.5;
                  return (
                    <tr
                      key={log.id}
                      className="transition-colors duration-100 hover:bg-[#fafbff]"
                    >
                      <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">{waktu}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-slate-800">{log.spoofType || '-'}</span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className="inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-md"
                          style={{
                            background: isHigh ? 'rgba(244,63,94,.08)' : 'rgba(16,185,129,.08)',
                            color: isHigh ? '#e11d48' : '#059669',
                          }}
                        >
                          {typeof log.spoofScore === 'number'
                            ? log.spoofScore.toFixed(2)
                            : log.spoofScore || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                          style={
                            isHigh
                              ? { background: 'rgba(244,63,94,.08)', color: '#e11d48', border: '1px solid rgba(244,63,94,.15)' }
                              : { background: 'rgba(16,185,129,.08)', color: '#059669', border: '1px solid rgba(16,185,129,.15)' }
                          }
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: isHigh ? '#e11d48' : '#10b981' }}
                          />
                          {isHigh ? 'Ditolak' : 'Diterima'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl mb-1"
                        style={{ background: 'rgba(108,99,255,.08)' }}
                      >
                        <ShieldAlert size={18} style={{ color: '#6C63FF' }} />
                      </div>
                      <span className="text-[12px] font-semibold text-slate-500">
                        Belum ada data spoofing
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Sistem liveness aktif memantau ancaman
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-2xl border border-slate-100 bg-white text-[11px] font-medium text-slate-400"
        style={{ boxShadow: '0 1px 3px rgba(108,99,255,.04)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-md"
            style={{ background: 'linear-gradient(135deg,#6C63FF,#9B59F5)' }}
          >
            <span className="text-[8px] font-bold text-white">S</span>
          </div>
          <span>© {new Date().getFullYear()} Smart Door Lock — All Rights Reserved.</span>
        </div>
        <span>
          Terakhir diperbarui:{' '}
          <span className="font-semibold text-slate-500">{lastUpdated || '—'}</span>
        </span>
      </div>

    </div>
  );
}