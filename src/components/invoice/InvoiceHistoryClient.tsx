
"use client";

import type { SavedInvoice } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


interface InvoiceHistoryClientProps {
  invoices: SavedInvoice[];
}

export default function InvoiceHistoryClient({ invoices }: InvoiceHistoryClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handlePreview = (invoice: SavedInvoice) => {
    try {
      // The Invoice type used by InvoiceHTMLRenderer does not expect _id or createdAt
      const { _id, createdAt, ...invoiceForPreview } = invoice;
      localStorage.setItem('current_invoice_data', JSON.stringify(invoiceForPreview));
      router.push('/invoice/preview');
    } catch (e) {
      console.error("Error setting invoice for preview:", e);
      toast({
        title: "Preview Error",
        description: "Could not prepare invoice for preview.",
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <Table>
        <TableCaption>A list of your saved invoices.</TableCaption>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.customer.name}</TableCell>
              <TableCell>{format(new Date(invoice.issueDate), 'PPP')}</TableCell>
              <TableCell>{format(new Date(invoice.dueDate), 'PPP')}</TableCell>
              <TableCell className="text-right">₹{invoice.grandTotal.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(invoice)}
                >
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
