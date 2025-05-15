
import { getQuotations } from '@/services/quotationService';
import type { SavedQuotation } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import QuotationHistoryClient from '@/components/quotation/QuotationHistoryClient';

export const revalidate = 0; 

export default async function QuotationHistoryPage() {
  let initialQuotations: SavedQuotation[] = [];
  let error: string | null = null;
  let uniqueManagers: string[] = ["All"]; // Start with "All"

  try {
    // Fetch all quotations to get initial data and manager list
    initialQuotations = await getQuotations(); 
    
    const managerSet = new Set<string>();
    initialQuotations.forEach(q => managerSet.add(q.relationshipManager));
    uniqueManagers = ["All", ...Array.from(managerSet).sort()];

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
            View, filter, and manage all previously created quotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          {!error && initialQuotations.length === 0 && ( // Check initialQuotations instead of quotations
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
          {!error && ( // Always render QuotationHistoryClient if no error, it handles its own "no results"
             <QuotationHistoryClient 
                initialQuotations={initialQuotations} 
                allManagers={uniqueManagers} 
             />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
