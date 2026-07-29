"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number | string;
  showLegend?: boolean;
  innerRadius?: number | string;
  outerRadius?: number | string;
}

export function DonutChart({
  data,
  height = 240,
  showLegend = true,
  innerRadius = 55,
  outerRadius = 75,
}: DonutChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A2820",
              border: "1px solid #2F4F3A",
              color: "#F5F5F2",
              borderRadius: "10px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#F5F5F2" }}
          />
          {showLegend && (
            <Legend 
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ fontSize: "11px", fontFamily: "Inter, sans-serif", paddingTop: "10px" }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
