import React, { useState } from 'react';
import { LayoutDashboard, UserCheck, Users, ClipboardList, LogOut, Terminal, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import MonitoringRealtime from '../components/MonitoringRealtime';
import DaftarWajahUser from '../components/DaftarWajahUser';
import KelolaPengguna from '../components/KelolaPengguna';
import LogAksesPintu from '../components/LogAksesPintu';

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState('monitoring');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State kontrol menu di HP
  const navigate = useNavigate();

  const menuItems = [
    { id: 'monitoring', name: 'Monitoring Realtime', icon: LayoutDashboard },
    { id: 'daftar-wajah', name: 'Daftar Wajah User', icon: UserCheck },
    { id: 'kelola-pengguna', name: 'Kelola Pengguna', icon: Users },
    { id: 'log-akses', name: 'Log Akses Pintu', icon: ClipboardList },
  ];

  const handleLogout = () => {
    navigate('/login', { replace: true });
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setIsSidebarOpen(false); // Otomatis tutup sidebar setelah pilih menu di HP
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased relative">
      
      {/* 1. SIDEBAR UNTUK DESKTOP (Layar Lebar) */}
      <aside className="w-72 bg-slate-950 text-slate-200 flex-col justify-between border-r border-slate-800 p-6 hidden lg:flex shrink-0">
        <div className="space-y-8">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-5">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Terminal size={18} />
            </div>
            <div>
              <span className="font-bold tracking-wider text-sm block text-white font-mono">SECURE-PANEL</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Web Service Console</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto"
        >
          <LogOut size={16} />
          <span>Keluar Sesi Admin</span>
        </button>
      </aside>

      {/* 2. SIDEBAR OVERLAY/DRAWER UNTUK MOBILE (Akan meluncur dari kiri ke kanan di HP) */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop hitam transparan jika diklik menu menutup */}
        <div 
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Konten Menu Drawer */}
        <aside className={`absolute inset-y-0 left-0 w-72 bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-900 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600 rounded-lg text-white">
                  <Terminal size={18} />
                </div>
                <span className="font-bold tracking-wider text-sm text-white font-mono">SECURE-PANEL</span>
              </div>
              {/* Tombol Close Sidebar */}
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-400 hover:text-white lg:hidden">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                      isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl mt-auto">
            <LogOut size={16} />
            <span>Keluar Sesi Admin</span>
          </button>
        </aside>
      </div>

      {/* 3. AREA KONTEN UTAMA DENGAN ADJUSTMENT HEADER */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header Bar (Ditambahkan Tombol Hamburger Menu untuk Layar HP) */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            {/* Tombol Hamburger - Hanya muncul di layar kecil */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden focus:outline-none"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider font-mono truncate">
              {menuItems.find((m) => m.id === activeMenu)?.name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block"></span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              Admin
            </span>
          </div>
        </header>

        {/* Kontainer Utama Area Konten */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {activeMenu === 'monitoring' && <MonitoringRealtime />}
          {activeMenu === 'daftar-wajah' && <DaftarWajahUser />}
          {activeMenu === 'kelola-pengguna' && <KelolaPengguna />}
          {activeMenu === 'log-akses' && <LogAksesPintu />}
        </div>
      </main>
    </div>
  );
}