'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DepreciationChartProps {
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  purchaseDate: Date;
}

export function DepreciationChart({ purchaseCost, salvageValue, usefulLifeYears, purchaseDate }: DepreciationChartProps) {
  const data = useMemo(() => {
    const chartData = [];
    const yearlyDepreciation = (purchaseCost - salvageValue) / usefulLifeYears;
    
    let currentValue = purchaseCost;
    const startYear = new Date(purchaseDate).getFullYear();

    for (let year = 0; year <= usefulLifeYears; year++) {
      chartData.push({
        name: (startYear + year).toString(),
        "Değer (₺)": Math.max(salvageValue, Math.round(currentValue))
      });
      currentValue -= yearlyDepreciation;
    }
    return chartData;
  }, [purchaseCost, salvageValue, usefulLifeYears, purchaseDate]);

  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `₺${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <Tooltip 
            formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Mevcut Değer']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="Değer (₺)" 
            stroke="#4f46e5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
