"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, BarChart3, Layers, LineChart as LineIcon } from "lucide-react";

interface TrendData {
  date: string;
  total: number;
  sakit?: number;
  izin?: number;
  alpha?: number;
}

export function TrendChart({ data }: { data: TrendData[] }) {
  const [viewMode, setViewMode] = useState<"area" | "breakdown">("area");
  
  const maxTotal = Math.max(...data.map(d => d.total), 0);
  const totalPeriod = data.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const hasData = data.some(d => d.total > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="size-4 text-indigo-500" />
              Tren Ketidakhadiran (7 Hari)
            </h3>
            {hasData && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Total: {totalPeriod}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Grafik harian siswa izin, sakit, dan alpha
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setViewMode("area")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === "area"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LineIcon className="size-3" />
            <span>Tren Area</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("breakdown")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === "breakdown"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="size-3" />
            <span>Rincian Jenis</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        {!hasData ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-2">
            <BarChart3 className="size-8 opacity-40" />
            <p className="text-xs font-medium">Belum ada catatan ketidakhadiran dalam 7 hari terakhir</p>
          </div>
        ) : viewMode === "area" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                domain={[0, maxTotal < 4 ? 4 : 'auto']}
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
                formatter={(val: any) => [`${val} Siswa`, 'Total Ketidakhadiran']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#areaGradient)"
                activeDot={{ r: 5, strokeWidth: 0, fill: "#4f46e5" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
                domain={[0, maxTotal < 4 ? 4 : 'auto']}
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
              />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar dataKey="sakit" name="Sakit" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="izin" name="Izin/Dispensasi" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="alpha" name="Alpha" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
