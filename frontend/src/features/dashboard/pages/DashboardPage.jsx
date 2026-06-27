import React, { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, UserCheck, Users, ClipboardList, LogOut, Fingerprint, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import MonitoringRealtime from '../components/MonitoringRealtime';
import DaftarWajahUser from '../components/DaftarWajahUser';
import KelolaPengguna from '../components/KelolaPengguna';
import LogAksesPintu from '../components/LogAksesPintu';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const menuItems = [
  { id: 'monitoring',       name: 'Monitoring Realtime', icon: LayoutDashboard },
  { id: 'daftar-wajah',    name: 'Daftar Wajah User',   icon: UserCheck },
  { id: 'kelola-pengguna', name: 'Kelola Pengguna',      icon: Users },
  { id: 'log-akses',       name: 'Log Akses Pintu',      icon: ClipboardList },
];

export default function DashboardPage() {
  const [activeMenu, setActiveMenu]         = useState('monitoring');
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const navigate     = useNavigate();
  const idleTimerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login', { replace: true });
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    resetIdleTimer();
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, []);

  const handleMenuClick = (id) => {
    setActiveMenu(id);
    setIsSidebarOpen(false);
  };

  const activeLabel = menuItems.find((m) => m.id === activeMenu)?.name;

  /* ── Shared nav item ── */
  const NavItem = ({ item }) => {
    const Icon     = item.icon;
    const isActive = activeMenu === item.id;
    return (
      <button
        onClick={() => handleMenuClick(item.id)}
        className={`
          w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold
          tracking-wide transition-all duration-200 group relative overflow-hidden
          ${isActive
            ? 'text-white shadow-lg shadow-indigo-500/30'
            : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
          }
        `}
        style={isActive ? {
          background: 'linear-gradient(135deg, #6C63FF 0%, #9B59F5 100%)',
        } : {}}
      >
        {/* Active left accent bar */}
        {isActive && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white/60"
          />
        )}
        <Icon
          size={16}
          className={`shrink-0 transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
          }`}
        />
        <span>{item.name}</span>
      </button>
    );
  };

  /* ── Sidebar content (reused desktop + mobile) ── */
  const SidebarContent = () => (
    <div className="flex h-full flex-col">

      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #9B59F5 100%)',
            boxShadow: '0 8px 24px rgba(108,99,255,0.35)',
          }}
        >
          <Fingerprint size={18} />
        </div>
        <div>
          <p className="text-[13px] font-bold tracking-tight text-white leading-tight">Smart Door Lock</p>
          <p
            className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em]"
            style={{ color: 'rgba(108,99,255,0.7)' }}
          >
            Admin Panel
          </p>
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div
        className="pointer-events-none absolute left-4 top-16 h-32 w-32 rounded-full blur-3xl opacity-10"
        style={{ background: '#6C63FF' }}
      />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-5">
        <p
          className="mb-3 px-4 text-[9px] font-bold uppercase tracking-[0.22em]"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Menu Utama
        </p>
        {menuItems.map((item) => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* User card + Logout */}
      <div className="px-4 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Mini user info */}
        <div
          className="mb-3 mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #9B59F5)' }}
          >
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-slate-200">Administrator</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Super Admin</p>
          </div>
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
          />
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200"
          style={{ color: '#f87171' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Desktop sidebar ── */}
      <aside
        className="relative hidden w-64 shrink-0 overflow-hidden lg:block"
        style={{ background: '#080e1a' }}
      >
        {/* Subtle bottom gradient fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 z-10"
          style={{ background: 'linear-gradient(to top, #080e1a, transparent)' }}
        />
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(8,14,26,0.7)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: '#080e1a' }}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
          <SidebarContent />
        </aside>
      </div>

      {/* ── Main area ── */}
      <div
        className="flex flex-1 flex-col min-w-0"
        style={{ background: '#f0f4ff' }}
      >

        {/* Topbar */}
        <header
          className="flex h-14 shrink-0 items-center justify-between px-5 sm:px-8"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(108,99,255,0.12)',
            boxShadow: '0 1px 0 rgba(108,99,255,0.06), 0 4px 16px rgba(108,99,255,0.04)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-500 transition-colors lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              {/* Breadcrumb-style label */}
              <span className="text-[11px] font-medium text-slate-400 hidden sm:block">Dashboard</span>
              <span className="text-slate-300 hidden sm:block">/</span>
              <h1
                className="text-[13px] font-bold tracking-tight"
                style={{ color: '#1e1b4b' }}
              >
                {activeLabel}
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div
              className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: 'rgba(34,197,94,0.08)',
                color: '#16a34a',
                border: '1px solid rgba(34,197,94,0.15)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Sistem Aktif
            </div>

            {/* Admin badge — mirrors login card style */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5"
              style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(155,89,245,0.08) 100%)',
                border: '1px solid rgba(108,99,255,0.18)',
              }}
            >
              <div
                className="flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #9B59F5)' }}
              >
                A
              </div>
              <span
                className="text-[11px] font-semibold"
                style={{ color: '#6C63FF' }}
              >
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          {activeMenu === 'monitoring'       && <MonitoringRealtime />}
          {activeMenu === 'daftar-wajah'    && <DaftarWajahUser />}
          {activeMenu === 'kelola-pengguna' && <KelolaPengguna />}
          {activeMenu === 'log-akses'       && <LogAksesPintu />}
        </main>

      </div>
    </div>
  );
}