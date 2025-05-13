"use client";

import React, { useState, useCallback } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { parseProductCSV } from '@/lib/csvParser';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProductImport() {
  const { addProducts } = useProducts();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null); // Clear previous errors
    }
  };

  const handleImport = useCallback(async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }
    setIsParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const parsedProducts: Product[] = parseProductCSV(text);
        if (parsedProducts.length === 0 && text.trim().split(/\\r?\\n/).length > 1) {
           setError("No valid products found in the file. Please check the file format and content. Ensure headers are: Title, Size, Variant SKU, Cost Price, Variant Price, GST, Image Src.");
           toast({
            title: "Import Failed",
            description: "No valid products found. Check format.",
            variant: "destructive",
          });
        } else if (parsedProducts.length > 0) {
          addProducts(parsedProducts);
          toast({
            title: "Import Successful",
            description: `${parsedProducts.length} products imported/updated.`,
            variant: "default",
          });
          setFile(null); // Reset file input
        } else {
           setError("File seems empty or contains only headers.");
           toast({
            title: "Import Issue",
            description: "File might be empty or only contain headers.",
            variant: "default", // Using default as it's not a critical error
          });
        }
      } catch (err: any) {
        console.error('Error parsing CSV:', err);
        setError(err.message || 'Failed to parse the TSV file. Ensure it is correctly formatted with tab separators and includes all required columns.');
        toast({
          title: "Import Error",
          description: err.message || "Failed to parse TSV file.",
          variant: "destructive",
        });
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
      setIsParsing(false);
    };
    reader.readAsText(file);
  }, [file, addProducts, toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept=".tsv,.txt,.csv" // Accept TSV, TXT, and CSV (though parser expects TSV)
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          aria-label="Product data file"
        />
        <Button onClick={handleImport} disabled={!file || isParsing}>
          <UploadCloud className="mr-2 h-4 w-4" />
          {isParsing ? 'Parsing...' : 'Import Products'}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
       <Alert variant="default" className="mt-4 bg-primary/5 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">File Format Instructions</AlertTitle>
        <AlertDescription>
          Please upload a Tab Separated Values (TSV) file.
          Required headers (case-insensitive): <strong>Title, Size, Variant SKU, Cost Price, Variant Price, GST, Image Src</strong>.
          Ensure numeric fields (Cost Price, Variant Price, GST) contain valid numbers.
        </AlertDescription>
      </Alert>
    </div>
  );
}
