"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AbsenceOverviewChartProps {
  data: { name: string; value: number }[];
}

export function AbsenceLineChart({ data }: AbsenceOverviewChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-slate-500">
        Belum ada data ketidakhadiran
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#0f172a" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#ffffff' }}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff' }}
            name="Jumlah"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
