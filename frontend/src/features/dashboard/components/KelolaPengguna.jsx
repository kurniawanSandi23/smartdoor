import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import { Users, Clock, Monitor, ShieldCheck, Info, RefreshCw, Mail, BadgeCheck, BadgeX } from 'lucide-react';

export default function KelolaPengguna() {
  const [registerLogs, setRegisterLogs] = useState([]);
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [registerLogsResponse, facesResponse] = await Promise.all([
        api.get('/api/logs/register'),
        api.get('/api/user/registered-faces'),
      ]);

      setRegisterLogs(Array.isArray(registerLogsResponse.data?.data) ? registerLogsResponse.data.data : []);
      setRegisteredFaces(Array.isArray(facesResponse.data?.data) ? facesResponse.data.data : []);
      setIsError(false);
      setLastUpdated(new Date().toLocaleString('id-ID'));
    } catch (error) {
      console.error('Gagal memuat data pengguna:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .kp-wrap {
          font-family: 'Inter', sans-serif;
          --purple: #7C3AED;
          --purple-light: #8B5CF6;
          --purple-dim: rgba(124,58,237,0.10);
          --emerald: #10B981;
          --emerald-dim: rgba(16,185,129,0.10);
          --amber: #F59E0B;
          --amber-dim: rgba(245,158,11,0.10);
          --red: #EF4444;
          --red-dim: rgba(239,68,68,0.08);
          --dark: #0F1117;
          --surface: #FFFFFF;
          --border: rgba(0,0,0,0.07);
          --text-primary: #0F172A;
          --text-muted: #64748B;
          --text-faint: #94A3B8;
        }

        /* ── Stat Cards ── */
        .kp-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        @media (max-width: 640px) {
          .kp-stat-grid { grid-template-columns: 1fr; }
        }

        .kp-stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03);
          position: relative;
          overflow: hidden;
        }

        .kp-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
        }

        .kp-stat-card.purple::before { background: linear-gradient(90deg, var(--purple), transparent); }
        .kp-stat-card.emerald::before { background: linear-gradient(90deg, var(--emerald), transparent); }
        .kp-stat-card.amber::before { background: linear-gradient(90deg, var(--amber), transparent); }

        .kp-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kp-stat-icon.purple { background: var(--purple-dim); color: var(--purple); }
        .kp-stat-icon.emerald { background: var(--emerald-dim); color: #059669; }
        .kp-stat-icon.amber { background: var(--amber-dim); color: #D97706; }

        .kp-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-faint);
          font-family: 'JetBrains Mono', monospace;
          display: block;
        }

        .kp-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          margin-top: 3px;
          line-height: 1;
          font-family: 'JetBrains Mono', monospace;
        }

        .kp-stat-sub {
          font-size: 11px;
          color: var(--text-faint);
          font-weight: 500;
          margin-top: 1px;
          display: block;
        }

        /* ── Info Banner ── */
        .kp-info-banner {
          background: rgba(124,58,237,0.05);
          border: 1px solid rgba(124,58,237,0.15);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .kp-info-icon {
          color: var(--purple-light);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .kp-info-title {
          font-size: 12px;
          font-weight: 700;
          color: #5B21B6;
        }

        .kp-info-desc {
          font-size: 11px;
          color: #7C3AED;
          font-weight: 500;
          margin-top: 2px;
          opacity: 0.8;
        }

        /* ── Table Card ── */
        .kp-table-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03);
          overflow: hidden;
        }

        .kp-accent-line {
          height: 3px;
        }

        .kp-accent-line.purple {
          background: linear-gradient(90deg, var(--purple) 0%, #A78BFA 60%, transparent 100%);
        }

        .kp-accent-line.emerald {
          background: linear-gradient(90deg, var(--emerald) 0%, #34D399 60%, transparent 100%);
        }

        .kp-card-header {
          padding: 16px 22px;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kp-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kp-title-icon {
          width: 30px;
          height: 30px;
          background: var(--purple-dim);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--purple);
        }

        .kp-title-icon.emerald {
          background: var(--emerald-dim);
          color: #059669;
        }

        .kp-title-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .kp-count-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          background: var(--purple-dim);
          color: var(--purple);
          border: 1px solid rgba(124,58,237,0.15);
          margin-left: 4px;
        }

        .kp-count-pill.emerald {
          background: var(--emerald-dim);
          color: #059669;
          border-color: rgba(16,185,129,0.2);
        }

        /* Refresh button */
        .kp-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          background: #F8F9FC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }

        .kp-refresh-btn:hover {
          background: var(--purple-dim);
          border-color: rgba(124,58,237,0.2);
          color: var(--purple);
        }

        @keyframes kp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .kp-spin {
          animation: kp-spin 0.7s linear infinite;
        }

        /* Table */
        .kp-overflow {
          overflow-x: auto;
        }

        .kp-table {
          width: 100%;
          border-collapse: collapse;
        }

        .kp-table thead tr {
          background: #FAFBFD;
          border-bottom: 1.5px solid #F1F5F9;
        }

        .kp-table thead th {
          padding: 10px 18px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }

        .kp-table tbody tr {
          border-bottom: 1px solid #F8FAFC;
          transition: background 0.12s;
        }

        .kp-table tbody tr:last-child { border-bottom: none; }
        .kp-table tbody tr:hover { background: #F8F9FC; }

        .kp-table td {
          padding: 13px 18px;
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .kp-name {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 12.5px;
        }

        .kp-mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #94A3B8;
        }

        .kp-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .kp-status-badge.success {
          background: var(--emerald-dim);
          color: #059669;
          border: 1px solid rgba(16,185,129,0.2);
        }

        .kp-status-badge.fail {
          background: var(--red-dim);
          color: #DC2626;
          border: 1px solid rgba(239,68,68,0.15);
        }

        .kp-status-badge.default {
          background: #F1F5F9;
          color: #64748B;
          border: 1px solid #E2E8F0;
        }

        .kp-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }

        .kp-status-badge.success .kp-status-dot { background: #10B981; }
        .kp-status-badge.fail .kp-status-dot { background: #EF4444; }
        .kp-status-badge.default .kp-status-dot { background: #94A3B8; }

        .kp-data-tag {
          display: inline-block;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: 5px;
          padding: 2px 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 600;
          color: #475569;
        }

        .kp-latency {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #7C3AED;
          font-weight: 700;
          background: var(--purple-dim);
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid rgba(124,58,237,0.12);
          display: inline-block;
        }

        /* Shimmer */
        @keyframes kp-shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }

        .kp-shimmer {
          background: linear-gradient(90deg, #F1F5F9 25%, #E8EDF4 50%, #F1F5F9 75%);
          background-size: 600px 100%;
          animation: kp-shimmer 1.3s infinite;
          border-radius: 4px;
          height: 10px;
          display: inline-block;
        }

        /* Empty */
        .kp-empty {
          padding: 48px 24px;
          text-align: center;
        }

        .kp-empty-icon {
          width: 42px; height: 42px;
          background: #F1F5F9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .kp-empty-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #CBD5E1;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .kp-empty-sub {
          font-size: 11px;
          color: #CBD5E1;
          margin-top: 4px;
        }

        /* Footer */
        .kp-footer {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 13px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .kp-footer-left {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.07em;
        }

        .kp-footer-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--purple-light);
        }

        .kp-footer-right {
          font-size: 11px;
          color: #CBD5E1;
          font-weight: 500;
        }
      `}</style>

      <div className="kp-wrap space-y-5 max-w-6xl">

        {/* ── Stat Cards ── */}
        <div className="kp-stat-grid">
          <div className="kp-stat-card purple">
            <div className="kp-stat-icon purple">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="kp-stat-label">Total Register</span>
              <span className="kp-stat-value">{isLoading ? '—' : registerLogs.length}</span>
              <span className="kp-stat-sub">Log pendaftaran</span>
            </div>
          </div>

          <div className="kp-stat-card emerald">
            <div className="kp-stat-icon emerald">
              <Users size={18} />
            </div>
            <div>
              <span className="kp-stat-label">Wajah Tersimpan</span>
              <span className="kp-stat-value">{isLoading ? '—' : registeredFaces.length}</span>
              <span className="kp-stat-sub">Face record aktif</span>
            </div>
          </div>

          <div className="kp-stat-card amber">
            <div className="kp-stat-icon amber">
              <Clock size={18} />
            </div>
            <div>
              <span className="kp-stat-label">Update Terakhir</span>
              <span className="kp-stat-value" style={{ fontSize: 12, marginTop: 5 }}>{lastUpdated || '—'}</span>
              <span className="kp-stat-sub">Auto-refresh / 10 detik</span>
            </div>
          </div>
        </div>

        {/* ── Info Banner ── */}
        <div className="kp-info-banner">
          <Info size={15} className="kp-info-icon" />
          <div>
            <div className="kp-info-title">Data Bersumber dari Database</div>
            <div className="kp-info-desc">Halaman ini membaca data dari Supabase.</div>
          </div>
        </div>

        {/* ── Table 1: Data Pengguna Terdaftar ── */}
        <div className="kp-table-card">
          <div className="kp-accent-line purple" />
          <div className="kp-card-header">
            <div className="kp-card-title">
              <div className="kp-title-icon">
                <Users size={14} />
              </div>
              <span className="kp-title-text">Data Pengguna Terdaftar</span>
              {!isLoading && (
                <span className="kp-count-pill">{registerLogs.length}</span>
              )}
            </div>
            <button type="button" className="kp-refresh-btn" onClick={handleRefresh}>
              <RefreshCw size={11} className={isRefreshing ? 'kp-spin' : ''} />
              MUAT ULANG
            </button>
          </div>

          <div className="kp-overflow">
            <table className="kp-table" style={{ minWidth: 1100 }}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Yaw Data</th>
                  <th>Pitch Data</th>
                  <th>Roll Data</th>
                  <th>Blink Data</th>
                  <th>Keterangan</th>
                  <th>Reg Latency</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1,2,3,4].map(i => (
                    <tr key={i}>
                      {[140,90,80,60,60,60,60,140,80,130].map((w, j) => (
                        <td key={j}><span className="kp-shimmer" style={{ width: w }} /></td>
                      ))}
                    </tr>
                  ))
                ) : registerLogs.length > 0 ? (
                  registerLogs.map((row) => {
                    const st = String(row.status || '').toUpperCase();
                    const badgeClass = st.includes('SUCCESS') || st.includes('DONE') ? 'success'
                      : st.includes('FAIL') || st.includes('ERROR') ? 'fail' : 'default';
                    return (
                      <tr key={row.id}>
                        <td><span className="kp-name">{row.name || '-'}</span></td>
                        <td><span className="kp-mono">{row.user_id || '-'}</span></td>
                        <td>
                          <span className={`kp-status-badge ${badgeClass}`}>
                            <span className="kp-status-dot" />
                            {row.status || '-'}
                          </span>
                        </td>
                        <td><span className="kp-data-tag">{row.yaw_data ?? '-'}</span></td>
                        <td><span className="kp-data-tag">{row.pitch_data ?? '-'}</span></td>
                        <td><span className="kp-data-tag">{row.roll_data ?? '-'}</span></td>
                        <td><span className="kp-data-tag">{row.blink_data ?? '-'}</span></td>
                        <td style={{ color: '#64748B', fontSize: 12 }}>{row.light_condition || '-'}</td>
                        <td>
                          {typeof row.reg_latency_ms === 'number'
                            ? <span className="kp-latency">{row.reg_latency_ms.toFixed(2)} ms</span>
                            : <span className="kp-mono">{row.reg_latency_ms || '-'}</span>}
                        </td>
                        <td>
                          <span className="kp-mono">
                            {row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10}>
                      <div className="kp-empty">
                        <div className="kp-empty-icon"><Users size={18} color="#CBD5E1" /></div>
                        <div className="kp-empty-text">Belum Ada Data</div>
                        <div className="kp-empty-sub">Belum ada data pengguna terdaftar dari register_logs.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Table 2: Registered Faces ── */}
        <div className="kp-table-card">
          <div className="kp-accent-line emerald" />
          <div className="kp-card-header">
            <div className="kp-card-title">
              <div className="kp-title-icon emerald">
                <Monitor size={14} />
              </div>
              <span className="kp-title-text">Registered Faces</span>
              {!isLoading && (
                <span className="kp-count-pill emerald">{registeredFaces.length}</span>
              )}
            </div>
          </div>

          <div className="kp-overflow">
            <table className="kp-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Reg Latency</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1,2,3].map(i => (
                    <tr key={i}>
                      <td><span className="kp-shimmer" style={{ width: 140 }} /></td>
                      <td><span className="kp-shimmer" style={{ width: 80 }} /></td>
                      <td><span className="kp-shimmer" style={{ width: 130 }} /></td>
                    </tr>
                  ))
                ) : registeredFaces.length > 0 ? (
                  registeredFaces.map((face) => (
                    <tr key={face.id}>
                      <td><span className="kp-name">{face.name || '-'}</span></td>
                      <td>
                        {typeof face.regLatencyMs === 'number'
                          ? <span className="kp-latency">{face.regLatencyMs.toFixed(2)} ms</span>
                          : <span className="kp-mono">{face.regLatencyMs || '-'}</span>}
                      </td>
                      <td>
                        <span className="kp-mono">
                          {face.createdAt ? new Date(face.createdAt).toLocaleString('id-ID') : '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="kp-empty">
                        <div className="kp-empty-icon"><Monitor size={18} color="#CBD5E1" /></div>
                        <div className="kp-empty-text">Belum Ada Data</div>
                        <div className="kp-empty-sub">Belum ada data registered face.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="kp-footer">
          <div className="kp-footer-left">
            <span className="kp-footer-dot" />
            © {new Date().getFullYear()} Smart door Lock. All rights reserved.
          </div>
          <div className="kp-footer-right">Terakhir diperbarui: {lastUpdated || '-'}</div>
        </div>

      </div>
    </>
  );
}