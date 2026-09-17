"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AbsenceOverviewChartProps {
  data: { name: string; value: number }[];
}

export function AbsenceLineChart({ data }: AbsenceOverviewChartProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-slate-500">
        Belum ada data ketidakhadiran
      </div>
    );
  }

  // Prevent hydration mismatch by defaulting to light colors before mount
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = mounted && currentTheme === "dark";

  const lineColor = isDark ? "#818cf8" : "#0f172a"; // indigo-400 (dark) vs slate-900 (light)
  const gridColor = isDark ? "#3f3f46" : "#e2e8f0"; // zinc-700 (dark) vs slate-200 (light)
  const tickColor = isDark ? "#a1a1aa" : "#64748b"; // zinc-400 (dark) vs slate-500 (light)
  const dotStrokeColor = isDark ? "#18181b" : "#ffffff"; // zinc-900 (dark) vs white (light)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: tickColor }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: tickColor }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px',
              border: '1px solid',
              borderColor: isDark ? '#3f3f46' : '#e2e8f0',
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: lineColor }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor} 
            strokeWidth={3}
            dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: dotStrokeColor }}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: dotStrokeColor }}
            name="Jumlah"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
