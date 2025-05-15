"use client";

import React, { useEffect, useState, useRef } from 'react';
import type { Quotation } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuotationHTMLRenderer from '@/components/quotation/QuotationHTMLRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function QuotationPreviewPage() {
  const [quotationData, setQuotationData] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const data = localStorage.getItem('current_quotation_data');
    if (data) {
      try {
        setQuotationData(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse quotation data for preview:", e);
        toast({
          title: "Error Loading Quotation",
          description: "Could not load quotation data for preview. It might be corrupted.",
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
        description: "Quotation preview is not available or not ready for printing.",
        variant: "destructive",
      });
      return;
    }

    const iframeWindow = iframe.contentWindow;
    
    iframeWindow.focus();

    setTimeout(() => {
      try {
        if (typeof iframeWindow.print === 'function') {
          iframeWindow.print();
        } else {
          window.print(); 
          toast({
            title: "Print Note",
            description: "Attempted to print. If the main page printed instead of just the quotation, please try using your browser's print option directly on the preview.",
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
    }, 100);
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

  if (!quotationData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle>No Quotation Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">No quotation data found for preview. Please create a quotation first.</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Create Quotation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quotationHtml = QuotationHTMLRenderer({ quotation: quotationData });

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl">Quotation Preview</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Edit Quotation
            </Button>
            <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90">
              <Printer className="mr-2 h-4 w-4" /> Print Quotation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <iframe
            ref={iframeRef}
            srcDoc={quotationHtml}
            title="Quotation Preview"
            className="w-full h-[calc(100vh-200px)] border rounded-md"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
          />
        </CardContent>
      </Card>
    </div>
  );
}
