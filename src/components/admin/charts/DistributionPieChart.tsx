"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface DistributionData {
  name: string;
  value: number;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#64748b'];

export function DistributionPieChart({ data }: { data: DistributionData[] }) {
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChartIcon className="size-4 text-amber-500" />
            Distribusi Jenis Izin
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Persentase kategori ketidakhadiran
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-2">
            <PieChartIcon className="size-8 opacity-50" />
            <p className="text-sm font-medium">Belum ada data distribusi izin</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 600
                }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
