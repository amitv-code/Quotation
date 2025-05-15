
"use client";

import type { SavedQuotation } from '@/types';
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
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


interface QuotationHistoryClientProps {
  quotations: SavedQuotation[];
}

export default function QuotationHistoryClient({ quotations }: QuotationHistoryClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handlePreview = (quotation: SavedQuotation) => {
    try {
      const { _id, createdAt, ...quotationForPreview } = quotation;
      localStorage.setItem('current_quotation_data', JSON.stringify(quotationForPreview));
      router.push('/quotation/preview');
    } catch (e) {
      console.error("Error setting quotation for preview:", e);
      toast({
        title: "Preview Error",
        description: "Could not prepare quotation for preview.",
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <Table>
        <TableCaption>A list of your saved quotations.</TableCaption>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead>Quotation #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => (
            <TableRow key={quotation._id}>
              <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
              <TableCell>{quotation.customer.name}</TableCell>
              <TableCell>{format(new Date(quotation.issueDate), 'PPP')}</TableCell>
              <TableCell>{format(new Date(quotation.dueDate), 'PPP')}</TableCell>
              <TableCell>{quotation.relationshipManager}</TableCell>
              <TableCell className="text-right">₹{quotation.grandTotal.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(quotation)}
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
