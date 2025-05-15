
"use client";

import React, { useEffect, useState } from 'react';
import type { SavedQuotation, QuotationStatus } from '@/types';
import { QUOTATION_STATUSES } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StatsCard from '@/components/dashboard/StatsCard';
import QuotationsByStatusChart from '@/components/dashboard/QuotationsByStatusChart';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface DashboardStats {
  totalQuotations: number;
  inProcessCount: number;
  wonCount: number;
  lostCount: number;
  totalValueWon: number;
  averageQuotationValue: number;
}

export default function DashboardPage() {
  const [quotations, setQuotations] = useState<SavedQuotation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/quotations'); // Fetch all quotations
        if (!response.ok) {
          throw new Error('Failed to fetch quotations data');
        }
        const data: SavedQuotation[] = await response.json();
        setQuotations(data);

        // Calculate stats
        const totalQuotations = data.length;
        const inProcessCount = data.filter(q => q.status === 'In Process').length;
        const wonCount = data.filter(q => q.status === 'Won').length;
        const lostCount = data.filter(q => q.status === 'Lost').length;
        const totalValueWon = data.filter(q => q.status === 'Won').reduce((sum, q) => sum + q.grandTotal, 0);
        const averageQuotationValue = totalQuotations > 0 ? data.reduce((sum, q) => sum + q.grandTotal, 0) / totalQuotations : 0;

        setStats({
          totalQuotations,
          inProcessCount,
          wonCount,
          lostCount,
          totalValueWon,
          averageQuotationValue,
        });

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return <div className="container mx-auto py-8">No data available for the dashboard.</div>;
  }
  
  const chartData = QUOTATION_STATUSES.map(status => ({
    name: status,
    count: quotations.filter(q => q.status === status).length,
    // Fill color can be set here or in the chart component based on status
  }));


  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Quotation Dashboard</CardTitle>
          <CardDescription>Overview of your quotation activities and performance.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Quotations" value={stats.totalQuotations.toString()} />
        <StatsCard title="Quotations In Process" value={stats.inProcessCount.toString()} />
        <StatsCard title="Quotations Won" value={stats.wonCount.toString()} accentValue={true}/>
        <StatsCard title="Quotations Lost" value={stats.lostCount.toString()} />
        <StatsCard title="Total Value (Won)" value={`₹${stats.totalValueWon.toFixed(2)}`} accentValue={true}/>
        <StatsCard title="Avg. Quotation Value" value={`₹${stats.averageQuotationValue.toFixed(2)}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1"> {/* Changed to 1 column for the chart initially */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quotations by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] p-2 md:p-6"> {/* Ensure chart has height */}
            <QuotationsByStatusChart data={chartData} />
          </CardContent>
        </Card>
        {/* Add more charts/tables here as needed */}
        {/* e.g., Performance by Relationship Manager */}
      </div>
    </div>
  );
}
