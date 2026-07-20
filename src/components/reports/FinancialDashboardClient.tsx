'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, PieChart } from 'lucide-react';

interface Props {
  totalInvestment: number;
  totalCurrentValue: number;
  totalYearlyDepreciation: number;
  categoryChartData: { name: string; value: number }[];
}

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

export function FinancialDashboardClient({ totalInvestment, totalCurrentValue, totalYearlyDepreciation, categoryChartData }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Toplam IT Yatırımı</h3>
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{formatCurrency(totalInvestment)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sisteme kayıtlı tüm cihazların satın alma maliyeti</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Güncel Net Değer</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{formatCurrency(totalCurrentValue)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Amortisman düşüldükten sonraki bugünkü değer</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Bu Yılki Amortisman Gideri</h3>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{formatCurrency(totalYearlyDepreciation)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Bu yıl bilançoya yansıyacak toplam değer kaybı</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <PieChart className="text-indigo-600 dark:text-indigo-400" size={24} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kategorilere Göre Yatırım Dağılımı</h2>
        </div>
        
        {categoryChartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  angle={-45} 
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₺${(value/1000)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Yatırım Miktarı']}
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
            <p>Gösterilecek finansal veri bulunamadı.</p>
            <p className="text-sm mt-2">Cihaz eklerken "Satın Alma Maliyeti" alanını doldurduğunuzdan emin olun.</p>
          </div>
        )}
      </div>
    </div>
  );
}
