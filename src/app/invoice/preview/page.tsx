"use client";

import React, { useEffect, useState, useRef } from 'react';
import type { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import InvoiceHTMLRenderer from '@/components/invoice/InvoiceHTMLRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function InvoicePreviewPage() {
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const data = localStorage.getItem('current_invoice_data');
    if (data) {
      try {
        setInvoiceData(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse invoice data for preview:", e);
        toast({
          title: "Error Loading Invoice",
          description: "Could not load invoice data for preview. It might be corrupted.",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  }, [toast]);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) {
      toast({
        title: "Print Error",
        description: "Invoice preview is not available or not ready for printing.",
        variant: "destructive",
      });
      return;
    }

    const iframeWindow = iframe.contentWindow;
    
    // Focus the iframe's window before printing
    iframeWindow.focus();

    // Use a small timeout to ensure content is fully rendered and focused
    // Some browsers might need this, especially if there are complex styles or scripts in the iframe
    setTimeout(() => {
      try {
        if (typeof iframeWindow.print === 'function') {
          iframeWindow.print();
        } else {
          // Fallback for browsers where iframe.contentWindow.print might not be directly available
          // or due to security restrictions in some edge cases.
          // This attempts to print the main window, which is not ideal but better than nothing.
          // A more robust solution might involve opening the HTML in a new tab.
          window.print(); 
          toast({
            title: "Print Note",
            description: "Attempted to print. If the main page printed instead of just the invoice, please try using your browser's print option directly on the preview.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error during print operation:", error);
        toast({
          title: "Print Error",
          description: `Failed to initiate printing. ${error instanceof Error ? error.message : ''}`,
          variant: "destructive",
        });
      }
    }, 100); // 100ms delay
  };


  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>No Invoice Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">No invoice data found for preview. Please create an invoice first.</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Create Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invoiceHtml = InvoiceHTMLRenderer({ invoice: invoiceData });

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl">Invoice Preview</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Edit Invoice
            </Button>
            <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90">
              <Printer className="mr-2 h-4 w-4" /> Print Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <iframe
            ref={iframeRef}
            srcDoc={invoiceHtml}
            title="Invoice Preview"
            className="w-full h-[calc(100vh-200px)] border rounded-md"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
          />
        </CardContent>
      </Card>
    </div>
  );
}
