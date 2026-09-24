"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface TrendData {
  date: string;
  total: number;
}

export function TrendChart({ data }: { data: TrendData[] }) {
  const maxTotal = Math.max(...data.map(d => d.total));
  const hasData = data.some(d => d.total > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="size-4 text-indigo-500" />
            Tren Absensi 7 Hari Terakhir
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Total ketidakhadiran siswa (Sakit, Izin, Alpha) per hari
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        {!hasData ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-2">
            <BarChart3 className="size-8 opacity-50" />
            <p className="text-sm font-medium">Belum ada data ketidakhadiran dalam 7 hari terakhir</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                allowDecimals={false}
                domain={[0, maxTotal < 5 ? 5 : 'auto']}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 600
                }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Bar dataKey="total" radius={[6, 6, 6, 6]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.total === maxTotal && maxTotal > 0 ? '#4f46e5' : '#94a3b8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
