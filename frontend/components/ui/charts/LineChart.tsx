"use client";

import React from "react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface LineChartProps {
  data: Record<string, unknown>[];
  lines: { key: string; color: string; label: string }[];
  xAxisKey: string;
  height?: number;
}

export function LineChart({ data, lines, xAxisKey, height = 240 }: LineChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Legend 
            iconType="circle" 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ fontSize: "11px", fontFamily: "Inter, sans-serif", paddingTop: "10px" }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
