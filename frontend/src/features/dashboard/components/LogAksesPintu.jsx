import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import { ClipboardList, Calendar, Database, Search, Wifi, WifiOff, RefreshCw, ShieldCheck } from 'lucide-react';

export default function LogAksesPintu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [databaseLogs, setDatabaseLogs] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pulse, setPulse] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/logs/akses-pintu', {
        params: { limit: 100 },
      });

      console.log('akses-pintu response', response.data);

      const logs = response.data?.data || [];
      setDatabaseLogs(Array.isArray(logs) ? logs.map(normalizeLog) : []);
      setIsError(false);
      setLastUpdated(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    } catch (error) {
      console.error('Gagal memuat data log akses:', error.response?.data || error);
      setIsError(true);
      setDatabaseLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const normalizeLog = (log) => ({
    id: log.id,
    name: log.name || log.user_id || log.namaUser || log.nama_user || '-',
    created_at: log.created_at || log.waktuAkses || log.waktu_akses,
    light_condition: log.light_condition || log.keterangan || log.keterangan_sistem || '-',
    status: log.status || log.solenoid_status || '-',
  });

  const filteredLogs = databaseLogs.filter((log) => {
    const displayName = String(
      log.name || log.user_id || log.namaUser || log.nama_user || ''
    ).toLowerCase();
    return displayName.includes(searchTerm.toLowerCase());
  });

  const unlockedCount = databaseLogs.filter(l => String(l.status).toUpperCase().includes('UNLOCKED')).length;
  const lockedCount = databaseLogs.length - unlockedCount;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .sdl-wrapper {
          font-family: 'Inter', sans-serif;
          --purple: #7C3AED;
          --purple-light: #8B5CF6;
          --purple-dim: rgba(124,58,237,0.12);
          --emerald: #10B981;
          --emerald-dim: rgba(16,185,129,0.12);
          --red: #EF4444;
          --red-dim: rgba(239,68,68,0.10);
          --dark: #0F1117;
          --surface: #FFFFFF;
          --border: rgba(0,0,0,0.07);
          --text-primary: #0F172A;
          --text-muted: #64748B;
          --text-faint: #94A3B8;
          --bg-page: #F5F6FA;
        }

        .sdl-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Header card */
        .sdl-header-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04);
          padding: 20px 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .sdl-icon-box {
          width: 42px;
          height: 42px;
          background: var(--dark);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(124,58,237,0.3), 0 4px 12px rgba(124,58,237,0.2);
        }

        .sdl-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-primary);
        }

        .sdl-subtitle {
          font-size: 11px;
          color: var(--text-faint);
          font-weight: 500;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sdl-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }

        .sdl-status-dot.connected {
          background: var(--emerald);
          box-shadow: 0 0 0 3px var(--emerald-dim);
          animation: sdl-pulse-green 2s infinite;
        }

        .sdl-status-dot.disconnected {
          background: var(--red);
          box-shadow: 0 0 0 3px var(--red-dim);
        }

        @keyframes sdl-pulse-green {
          0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
          50% { box-shadow: 0 0 0 5px rgba(16,185,129,0.08); }
        }

        .sdl-status-text.connected {
          color: var(--emerald);
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }

        .sdl-status-text.disconnected {
          color: var(--red);
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }

        /* Search input */
        .sdl-search-wrap {
          position: relative;
          width: 280px;
          max-width: 100%;
        }

        .sdl-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-faint);
          pointer-events: none;
        }

        .sdl-search-input {
          width: 100%;
          padding: 9px 14px 9px 36px;
          background: #F8F9FC;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: 'Inter', sans-serif;
        }

        .sdl-search-input:focus {
          border-color: var(--purple-light);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }

        .sdl-search-input::placeholder {
          color: var(--text-faint);
          font-weight: 400;
        }

        /* Stat chips */
        .sdl-chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .sdl-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
        }

        .sdl-chip.total {
          background: var(--purple-dim);
          color: var(--purple);
          border: 1px solid rgba(124,58,237,0.15);
        }

        .sdl-chip.unlocked {
          background: var(--emerald-dim);
          color: #059669;
          border: 1px solid rgba(16,185,129,0.2);
        }

        .sdl-chip.locked {
          background: var(--red-dim);
          color: #DC2626;
          border: 1px solid rgba(239,68,68,0.15);
        }

        /* Table card */
        .sdl-table-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .sdl-table-header {
          padding: 16px 24px;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sdl-table-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .sdl-live-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 6px;
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 700;
          color: #059669;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
        }

        .sdl-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          animation: sdl-blink 1.5s ease-in-out infinite;
        }

        @keyframes sdl-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Table itself */
        .sdl-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 750px;
        }

        .sdl-table thead tr {
          background: #FAFBFD;
          border-bottom: 1.5px solid #F1F5F9;
        }

        .sdl-table thead th {
          padding: 11px 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }

        .sdl-table thead th.center {
          text-align: center;
        }

        .sdl-table tbody tr {
          border-bottom: 1px solid #F8FAFC;
          transition: background 0.15s;
        }

        .sdl-table tbody tr:last-child {
          border-bottom: none;
        }

        .sdl-table tbody tr:hover {
          background: #F8F9FC;
        }

        .sdl-table td {
          padding: 14px 20px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .sdl-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #CBD5E1;
          text-align: center;
        }

        .sdl-name-unlocked {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 12.5px;
        }

        .sdl-name-locked {
          font-weight: 700;
          color: #EF4444;
          font-size: 12.5px;
        }

        .sdl-time-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #94A3B8;
          font-weight: 500;
        }

        .sdl-detail {
          font-size: 12px;
          color: #94A3B8;
          font-weight: 500;
          max-width: 220px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Status badge */
        .sdl-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .sdl-badge.unlocked {
          background: rgba(16,185,129,0.1);
          color: #059669;
          border: 1px solid rgba(16,185,129,0.2);
        }

        .sdl-badge.locked {
          background: rgba(239,68,68,0.08);
          color: #DC2626;
          border: 1px solid rgba(239,68,68,0.15);
        }

        .sdl-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .sdl-badge.unlocked .sdl-badge-dot {
          background: #10B981;
        }

        .sdl-badge.locked .sdl-badge-dot {
          background: #EF4444;
        }

        .sdl-td-center {
          text-align: center;
        }

        /* Empty / loading */
        .sdl-empty {
          padding: 56px 24px;
          text-align: center;
        }

        .sdl-empty-icon {
          width: 44px;
          height: 44px;
          background: #F1F5F9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }

        .sdl-empty-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #CBD5E1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sdl-empty-sub {
          font-size: 11px;
          color: #CBD5E1;
          margin-top: 4px;
          font-weight: 400;
        }

        /* Loading shimmer rows */
        @keyframes sdl-shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }

        .sdl-shimmer {
          background: linear-gradient(90deg, #F1F5F9 25%, #E8EDF4 50%, #F1F5F9 75%);
          background-size: 600px 100%;
          animation: sdl-shimmer 1.4s infinite;
          border-radius: 4px;
          height: 10px;
        }

        /* Footer */
        .sdl-footer {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .sdl-footer-text {
          font-size: 11px;
          color: #CBD5E1;
          font-weight: 500;
        }

        .sdl-footer-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.08em;
        }

        .sdl-footer-brand-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--purple-light);
        }

        /* Divider accent line */
        .sdl-accent-line {
          height: 3px;
          background: linear-gradient(90deg, var(--purple) 0%, #A78BFA 50%, transparent 100%);
          border-radius: 0 0 0 0;
        }

        /* Pulse flash on update */
        @keyframes sdl-flash {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .sdl-pulse-flash {
          animation: sdl-flash 0.6s ease;
        }

        .sdl-overflow-x {
          overflow-x: auto;
        }
      `}</style>

      <div className="sdl-wrapper space-y-5 max-w-6xl">

        {/* ── Header Card ── */}
        <div className="sdl-header-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sdl-icon-box">
              <Database size={18} color="#8B5CF6" />
            </div>
            <div>
              <div className="sdl-title">Log Akses Pintu Real-Time</div>
              <div className="sdl-subtitle">
                <span className={`sdl-status-dot ${isError ? 'disconnected' : 'connected'}`} />
                <span className={`sdl-status-text ${isError ? 'disconnected' : 'connected'}`}>
                  {isError ? 'TERPUTUS' : 'TERHUBUNG · POSTGRESQL'}
                </span>
                {lastUpdated && !isError && (
                  <span style={{ color: '#CBD5E1', fontWeight: 400, fontSize: '10px' }}>
                    · diperbarui {lastUpdated.toLocaleTimeString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Stat chips */}
            {!isLoading && (
              <div className="sdl-chips">
                <div className="sdl-chip total">
                  <span>{databaseLogs.length}</span>
                  <span style={{ opacity: 0.6, fontWeight: 400 }}>TOTAL</span>
                </div>
                <div className="sdl-chip unlocked">
                  <span>{unlockedCount}</span>
                  <span style={{ opacity: 0.7, fontWeight: 400 }}>DIBUKA</span>
                </div>
                <div className="sdl-chip locked">
                  <span>{lockedCount}</span>
                  <span style={{ opacity: 0.7, fontWeight: 400 }}>DITOLAK</span>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="sdl-search-wrap">
              <span className="sdl-search-icon">
                <Search size={13} />
              </span>
              <input
                type="text"
                className="sdl-search-input"
                placeholder="Cari nama pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="sdl-table-card">
          {/* Accent top line */}
          <div className="sdl-accent-line" />

          {/* Table section header */}
          <div className="sdl-table-header">
            <div className="sdl-table-title">
              <ClipboardList size={13} />
              Riwayat Akses Tersimpan
            </div>
            {!isLoading && !isError && (
              <div className="sdl-live-badge">
                <span className="sdl-live-dot" />
                LIVE
              </div>
            )}
            {isError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 6, padding: '3px 9px',
                fontSize: 10, fontWeight: 700, color: '#DC2626',
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                OFFLINE
              </div>
            )}
          </div>

          {/* Table */}
          <div className="sdl-overflow-x">
            <table className="sdl-table">
              <thead>
                <tr>
                  <th className="center" style={{ width: 56 }}>No</th>
                  <th>Nama Pengguna</th>
                  <th>Waktu Scan</th>
                  <th>Keterangan Sistem</th>
                  <th className="center" style={{ width: 160 }}>Status Solenoid</th>
                </tr>
              </thead>
              <tbody className={pulse ? 'sdl-pulse-flash' : ''}>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td><div className="sdl-shimmer" style={{ width: 24, margin: '0 auto' }} /></td>
                      <td><div className="sdl-shimmer" style={{ width: 120 }} /></td>
                      <td><div className="sdl-shimmer" style={{ width: 160 }} /></td>
                      <td><div className="sdl-shimmer" style={{ width: 180 }} /></td>
                      <td><div className="sdl-shimmer" style={{ width: 90, margin: '0 auto' }} /></td>
                    </tr>
                  ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => {
                    const displayName = log.name || log.user_id || log.namaUser || log.nama_user || '-';
                    const displayTime = log.created_at || log.waktuAkses || log.waktu_akses
                      ? new Date(log.created_at || log.waktuAkses || log.waktu_akses).toLocaleString('id-ID')
                      : '-';
                    const displayDetail = log.light_condition || log.keterangan || log.keterangan_sistem || '-';
                    const statusText = log.status || log.solenoid_status || '-';
                    const isAccepted = String(statusText).toUpperCase().includes('UNLOCKED');

                    return (
                      <tr key={log.id || index}>
                        <td className="sdl-num">{String(index + 1).padStart(2, '0')}</td>
                        <td>
                          <span className={isAccepted ? 'sdl-name-unlocked' : 'sdl-name-locked'}>
                            {displayName}
                          </span>
                        </td>
                        <td>
                          <div className="sdl-time-cell">
                            <Calendar size={11} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                            <span>{displayTime}</span>
                          </div>
                        </td>
                        <td>
                          <span className="sdl-detail">{displayDetail}</span>
                        </td>
                        <td className="sdl-td-center">
                          <span className={`sdl-badge ${isAccepted ? 'unlocked' : 'locked'}`}>
                            <span className="sdl-badge-dot" />
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="sdl-empty">
                        <div className="sdl-empty-icon">
                          <ShieldCheck size={20} color="#CBD5E1" />
                        </div>
                        <div className="sdl-empty-text">
                          {searchTerm ? 'Tidak Ditemukan' : 'Belum Ada Data'}
                        </div>
                        <div className="sdl-empty-sub">
                          {searchTerm
                            ? `Tidak ada hasil untuk "${searchTerm}"`
                            : 'Riwayat akses pintu akan muncul di sini'}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="sdl-footer">
          <div className="sdl-footer-brand">
            <span className="sdl-footer-brand-dot" />
            SMART DOOR LOCK · ADMIN PANEL
          </div>
          <div className="sdl-footer-text">
            © {new Date().getFullYear()} Smart Door Lock. All Rights Reserved.
          </div>
        </div>

      </div>
    </>
  );
}