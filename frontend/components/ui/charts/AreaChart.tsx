"use client";

import React from "react";
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AreaChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export function AreaChart({ data, dataKey, xAxisKey, color = "#2F4F3A", height = 240 }: AreaChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E8E6" vertical={false} />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#888888" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#888888" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A2820",
              border: "1px solid #2F4F3A",
              color: "#F5F5F2",
              borderRadius: "10px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
            }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fill={color}
            fillOpacity={0.1} 
            strokeWidth={2} 
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
