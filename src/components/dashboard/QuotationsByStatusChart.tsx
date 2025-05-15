
"use client"

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { QuotationStatus } from '@/types';

interface ChartDataPoint {
  name: QuotationStatus | string; // Allow string for flexibility if other categories are added
  count: number;
}

interface QuotationsByStatusChartProps {
  data: ChartDataPoint[];
}

const statusColors: Record<QuotationStatus, string> = {
  'In Process': "hsl(var(--chart-2))", // Blue
  'Won': "hsl(var(--chart-1))",         // Green (accent)
  'Lost': "hsl(var(--chart-5))",        // Red (destructive)
};

const chartConfig = {
  count: {
    label: "Count",
  },
  'In Process': { label: 'In Process', color: statusColors['In Process']},
  'Won': { label: 'Won', color: statusColors['Won']},
  'Lost': { label: 'Lost', color: statusColors['Lost']},
} satisfies ChartConfig;


export default function QuotationsByStatusChart({ data }: QuotationsByStatusChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available for chart.</div>;
  }

  // Map data to include fill colors for each bar based on status
  const coloredData = data.map(item => ({
    ...item,
    fill: statusColors[item.name as QuotationStatus] || "hsl(var(--chart-3))", // Fallback color
  }));

  return (
    <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={coloredData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8}
            fontSize={12}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8}
            fontSize={12}
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
           <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="count" radius={4} barSize={60}>
             {coloredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
