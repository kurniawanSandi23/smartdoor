import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import { Users, Clock, Monitor, ShieldCheck, Info, RefreshCw, Mail, BadgeCheck, BadgeX } from 'lucide-react';

export default function KelolaPengguna() {
  const [profiles, setProfiles] = useState([]);
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchProfiles = async () => {
    try {
      const [profilesResponse, facesResponse] = await Promise.all([
        api.get('/api/user/profiles'),
        api.get('/api/user/registered-faces'),
      ]);

      setProfiles(Array.isArray(profilesResponse.data?.data) ? profilesResponse.data.data : []);
      setRegisteredFaces(Array.isArray(facesResponse.data?.data) ? facesResponse.data.data : []);
      setIsError(false);
      setLastUpdated(new Date().toLocaleString('id-ID'));
    } catch (error) {
      console.error('Gagal memuat data pengguna:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    const interval = setInterval(fetchProfiles, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total User Profil</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">{profiles.length} Terdaftar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Wajah Tersimpan</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">{registeredFaces.length} Record</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Update Terakhir</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">{lastUpdated || '-'}</span>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl flex items-start space-x-3 text-xs text-emerald-800">
        <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Data Bersumber dari Database</p>
          <p className="text-emerald-700/90 leading-relaxed font-medium">
            Halaman ini membaca data dari tabel registered_faces.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-slate-50 text-slate-600 rounded-md">
              <Users size={14} />
            </div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Data Pengguna Terdaftar
            </h3>
          </div>

          <button
            type="button"
            onClick={fetchProfiles}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={12} />
            MUAT ULANG
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Nama</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-xs font-semibold text-slate-400 font-mono">
                    SEDANG MEMUAT DATA PENGGUNA...
                  </td>
                </tr>
              ) : profiles.length > 0 ? (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="font-bold text-slate-900">{profile.fullName || '-'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-300" />
                        {profile.email || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {profile.role || '-'}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          profile.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40'
                            : 'bg-red-50 text-red-700 border-red-200/40'
                        }`}
                      >
                        {profile.isActive ? <BadgeCheck size={12} /> : <BadgeX size={12} />}
                        {profile.isActive ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleString('id-ID') : '-'}
                    </td>

                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-xs font-semibold text-slate-400 font-mono">
                    BELUM ADA DATA USER DI DATABASE.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-50 text-slate-600 rounded-md">
            <Monitor size={14} />
          </div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Registered Faces
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Nama</th>
                <th className="px-6 py-3.5">Reg Latency</th>
                <th className="px-6 py-3.5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {registeredFaces.length > 0 ? (
                registeredFaces.map((face) => (
                  <tr key={face.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{face.name || '-'}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {typeof face.regLatencyMs === 'number' ? `${face.regLatencyMs.toFixed(2)} ms` : (face.regLatencyMs || '-')}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {face.createdAt ? new Date(face.createdAt).toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-xs font-semibold text-slate-400 font-mono">
                    BELUM ADA DATA REGISTERED FACE.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between text-center text-[11px] font-medium text-slate-400 shadow-sm">
        <span>&copy; {new Date().getFullYear()} Kurniawan Sandi &bull; Politeknik Negeri Jakarta. All Rights Reserved.</span>
        <span>Terakhir diperbarui: {lastUpdated || '-'}</span>
      </div>
    </div>
  );
}