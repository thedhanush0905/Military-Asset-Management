"use client";

import React from "react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TrendChartProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  barKey: string;
  lineKey?: string;
  barColor?: string;
  lineColor?: string;
  height?: number;
}

export function TrendChart({
  data,
  xAxisKey,
  barKey,
  lineKey,
  barColor = "#2F4F3A",
  lineColor = "#556B2F",
  height = 240,
}: TrendChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Bar dataKey={barKey} fill={barColor} radius={[4, 4, 0, 0]} />
          {lineKey && (
            <Line 
              type="monotone" 
              dataKey={lineKey} 
              stroke={lineColor} 
              strokeWidth={2.5} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
