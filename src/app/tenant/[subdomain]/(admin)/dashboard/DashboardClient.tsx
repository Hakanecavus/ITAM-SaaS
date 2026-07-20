'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  Laptop, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Wallet,
  Clock,
  ShieldAlert,
  Wrench,
  AlertOctagon
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  overview: {
    totalAssets: number;
    availableAssets: number;
    assignedAssets: number;
    inMaintenanceAssets: number;
    brokenAssets: number;
    lostAssets: number;
    totalInventoryValue: number | null;
  };
  charts: {
    categoryData: { name: string; value: number }[];
  };
  alerts: {
    expiringLicenses: number;
    expiredLicenses: number;
    criticalConsumables: number;
  };
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function DashboardClient({ data, subdomain }: { data: DashboardData; subdomain: string }) {
  const { overview, charts, alerts } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">IT Envanterinize genel bakış ve kritik uyarılar.</p>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-2xl">
              <Laptop size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Cihaz</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{overview.totalAssets}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Boştaki Cihazlar</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{overview.availableAssets}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 rounded-2xl">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Serviste</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{overview.inMaintenanceAssets}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-2xl">
              <AlertOctagon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Arızalı</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{overview.brokenAssets}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-2xl">
              <HelpCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kayıp Cihazlar</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{overview.lostAssets}</h3>
            </div>
          </div>
        </div>

        {overview.totalInventoryValue !== null ? (
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-3xl border border-indigo-500 shadow-lg shadow-indigo-500/20 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/20 text-white rounded-2xl backdrop-blur-sm">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-100">Toplam Envanter Değeri</p>
                <h3 className="text-2xl font-black text-white">
                  {overview.totalInventoryValue.toLocaleString('tr-TR')} ₺
                </h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 rounded-2xl">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Zimmetli Cihazlar</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{overview.assignedAssets}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ALERTS SECTION (Left Col on Desktop, Top on Mobile) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Kritik Uyarılar
            </h2>
            
            <div className="space-y-3">
              {alerts.expiringLicenses > 0 && (
                <Link href={`/licenses`} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Clock className="text-amber-500" size={18} />
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Yaklaşan Lisanslar</span>
                  </div>
                  <span className="bg-amber-200 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {alerts.expiringLicenses}
                  </span>
                </Link>
              )}

              {alerts.expiredLicenses > 0 && (
                <Link href={`/licenses`} className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-rose-500" size={18} />
                    <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">Süresi Biten Lisanslar</span>
                  </div>
                  <span className="bg-rose-200 text-rose-800 dark:bg-rose-500/30 dark:text-rose-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {alerts.expiredLicenses}
                  </span>
                </Link>
              )}

              {alerts.criticalConsumables > 0 && (
                <Link href={`/consumables`} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Package className="text-orange-500" size={18} />
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Azalan Sarf Malzemesi</span>
                  </div>
                  <span className="bg-orange-200 text-orange-800 dark:bg-orange-500/30 dark:text-orange-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {alerts.criticalConsumables}
                  </span>
                </Link>
              )}

              {alerts.expiringLicenses === 0 && alerts.expiredLicenses === 0 && alerts.criticalConsumables === 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="mx-auto w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tüm sistem sağlıklı çalışıyor. Kritik bir uyarı yok.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
              Kategorilere Göre Cihaz Dağılımı
            </h2>
            
            {charts.categoryData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center flex-col text-slate-400">
                <Laptop size={48} className="mb-4 opacity-50" />
                <p>Henüz yeterli veri yok.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
