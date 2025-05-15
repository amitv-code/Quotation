
import { getQuotations } from '@/services/quotationService';
import type { SavedQuotation } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import QuotationHistoryClient from '@/components/quotation/QuotationHistoryClient';

export const revalidate = 0; // Disable caching for this page to always fetch fresh data

export default async function QuotationHistoryPage() {
  let quotations: SavedQuotation[] = [];
  let error: string | null = null;

  try {
    quotations = await getQuotations();
  } catch (e) {
    console.error("Failed to fetch quotations:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching quotations.";
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Quotation History</CardTitle>
          <CardDescription>
            View all previously created and saved quotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          {!error && quotations.length === 0 && (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No Quotations Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven&apos;t created any quotations yet.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/">Create New Quotation</Link>
                </Button>
              </div>
            </div>
          )}
          {!error && quotations.length > 0 && (
            <QuotationHistoryClient quotations={quotations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
