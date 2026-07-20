'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6'];

interface AssetFinancials {
  id: string;
  brandModel: string;
  categoryName: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  purchaseDate: Date | null;
}

export function FinancialCharts({ assets }: { assets: AssetFinancials[] }) {
  // Aggregate data for category breakdown
  const categoryData = assets.reduce((acc, asset) => {
    if (!asset.purchaseCost) return acc;
    const existing = acc.find(c => c.name === asset.categoryName);
    if (existing) {
      existing.value += asset.purchaseCost;
    } else {
      acc.push({ name: asset.categoryName, value: asset.purchaseCost });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Calculate Amortization timeline (Next 5 years)
  const currentYear = new Date().getFullYear();
  const timelineData = Array.from({ length: 5 }, (_, i) => ({
    year: (currentYear + i).toString(),
    amortization: 0,
    netValue: 0
  }));

  // Helper for straight-line depreciation
  let totalCurrentValue = 0;
  let totalPurchaseValue = 0;
  let totalMonthlyDepreciation = 0;

  assets.forEach(asset => {
    if (!asset.purchaseCost) return;
    totalPurchaseValue += asset.purchaseCost;

    if (!asset.purchaseDate || !asset.usefulLifeYears || asset.usefulLifeYears <= 0) {
      totalCurrentValue += asset.purchaseCost; // No depreciation
      return;
    }

    const salvage = asset.salvageValue || 0;
    const depreciableBase = asset.purchaseCost - salvage;
    const yearlyDepreciation = depreciableBase / asset.usefulLifeYears;
    const monthlyDepreciation = yearlyDepreciation / 12;

    const purchaseTime = new Date(asset.purchaseDate).getTime();
    const now = new Date().getTime();
    const monthsElapsed = (now - purchaseTime) / (1000 * 60 * 60 * 24 * 30.44);
    
    let accumulatedDepreciation = 0;
    if (monthsElapsed > 0) {
      accumulatedDepreciation = Math.min(
        depreciableBase,
        monthlyDepreciation * monthsElapsed
      );
    }

    const currentValue = asset.purchaseCost - accumulatedDepreciation;
    totalCurrentValue += currentValue;

    if (currentValue > salvage) {
      totalMonthlyDepreciation += monthlyDepreciation;
    }

    // Timeline forecast
    timelineData.forEach((tData, index) => {
      const yearToCheck = currentYear + index;
      const yearsSincePurchase = yearToCheck - new Date(asset.purchaseDate!).getFullYear();
      
      if (yearsSincePurchase >= 0 && yearsSincePurchase < asset.usefulLifeYears!) {
        tData.amortization += yearlyDepreciation;
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Toplam Yatırım (Satın Alma)</p>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            ₺{totalPurchaseValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Güncel Net Değer (Net Book Value)</p>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            ₺{totalCurrentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Aylık Amortisman Gideri</p>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            ₺{totalMonthlyDepreciation.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold mb-4">Kategori Bazlı Maliyet Dağılımı</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₺${Number(value).toLocaleString('tr-TR')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Year Depreciation Forecast */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold mb-4">Gelecek 5 Yıl Amortisman Gider Projeksiyonu</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value: any) => `₺${(Number(value)/1000)}k`} />
                <Tooltip formatter={(value: any) => `₺${Number(value).toLocaleString('tr-TR', {maximumFractionDigits:0})}`} />
                <Bar dataKey="amortization" name="Yıllık Amortisman (₺)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
