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
import { School, BarChart2 } from "lucide-react";

interface ClassComparisonData {
  className: string;
  total: number;
  sakit: number;
  izin: number;
  alpha: number;
}

const BAR_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#64748b"];

export function ClassComparisonChart({ data }: { data: ClassComparisonData[] }) {
  const hasData = data && data.length > 0 && data.some(d => d.total > 0);
  const maxTotal = Math.max(...(data || []).map(d => d.total), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <School className="size-4 text-emerald-500" />
              Perbandingan Ketidakhadiran per Kelas
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Kelas dengan frekuensi izin & alpha terbanyak
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        {!hasData ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-2">
            <BarChart2 className="size-8 opacity-40" />
            <p className="text-xs font-medium">Belum ada data ketidakhadiran per kelas</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 20, left: 25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={[0, maxTotal < 4 ? 4 : 'auto']}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="className"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.08)',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0f172a'
                }}
                formatter={(value: any, _name: any, item: any) => [
                  `${value} Siswa (Sakit: ${item.payload.sakit}, Izin: ${item.payload.izin}, Alpha: ${item.payload.alpha})`,
                  'Total Absensi'
                ]}
              />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={20}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
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
