"use client";

import React from "react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface BarItem {
  key: string;
  color: string;
  label?: string;
}

interface BarChartProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  dataKey?: string;
  fill?: string;
  bars?: BarItem[];
  height?: number;
}

export function BarChart({ data, dataKey, xAxisKey, fill = "#2F4F3A", bars, height = 240 }: BarChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            cursor={{ fill: "rgba(47, 79, 58, 0.05)" }}
            contentStyle={{
              backgroundColor: "#1A2820",
              border: "1px solid #2F4F3A",
              color: "#F5F5F2",
              borderRadius: "10px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
            }}
          />
          {bars && (
            <Legend 
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ fontSize: "11px", fontFamily: "Inter, sans-serif", paddingTop: "10px" }}
            />
          )}
          {bars ? (
            bars.map((bar) => (
              <Bar 
                key={bar.key} 
                dataKey={bar.key} 
                name={bar.label || bar.key} 
                fill={bar.color} 
                radius={[4, 4, 0, 0]} 
              />
            ))
          ) : (
            dataKey && <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
