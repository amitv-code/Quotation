
import { getInvoices } from '@/services/invoiceService';
import type { SavedInvoice } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import InvoiceHistoryClient from '@/components/invoice/InvoiceHistoryClient';

export const revalidate = 0; // Disable caching for this page to always fetch fresh data

export default async function InvoiceHistoryPage() {
  let invoices: SavedInvoice[] = [];
  let error: string | null = null;

  try {
    invoices = await getInvoices();
  } catch (e) {
    console.error("Failed to fetch invoices:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching invoices.";
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Invoice History</CardTitle>
          <CardDescription>
            View all previously created and saved invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          {!error && invoices.length === 0 && (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No Invoices Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven&apos;t created any invoices yet.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/">Create New Invoice</Link>
                </Button>
              </div>
            </div>
          )}
          {!error && invoices.length > 0 && (
            <InvoiceHistoryClient invoices={invoices} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
