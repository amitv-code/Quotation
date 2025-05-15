
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { SavedQuotation, QuotationStatus } from '@/types';
import { QUOTATION_STATUSES } from '@/types';
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
import { Eye, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface QuotationHistoryClientProps {
  initialQuotations: SavedQuotation[];
  allManagers: string[];
}

export default function QuotationHistoryClient({ initialQuotations, allManagers }: QuotationHistoryClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<SavedQuotation[]>(initialQuotations);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedManager, setSelectedManager] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus | "All">("All");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedManager !== "All") {
        queryParams.append('relationshipManager', selectedManager);
      }
      if (selectedStatus !== "All") {
        queryParams.append('status', selectedStatus);
      }
      const response = await fetch(`/api/quotations?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quotations');
      }
      const data = await response.json();
      setQuotations(data);
    } catch (error) {
      console.error("Error fetching filtered quotations:", error);
      toast({
        title: "Fetch Error",
        description: "Could not fetch filtered quotations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedManager, selectedStatus, toast]);

  useEffect(() => {
    // Initial fetch is handled by initialQuotations, only fetch if filters change from initial "All"
    if (selectedManager !== "All" || selectedStatus !== "All") {
        fetchQuotations();
    } else {
        setQuotations(initialQuotations); // Reset to initial if filters are back to "All"
    }
  }, [selectedManager, selectedStatus, fetchQuotations, initialQuotations]);


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

  const handleStatusChange = async (quotationId: string, newStatus: QuotationStatus) => {
    setUpdatingStatusId(quotationId);
    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      const updatedQuotation = await response.json();
      setQuotations(prev => prev.map(q => q._id === quotationId ? { ...q, status: updatedQuotation.status } : q));
      toast({
        title: "Status Updated",
        description: `Quotation ${updatedQuotation.quotationNumber} status set to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Error",
        description: (error instanceof Error ? error.message : "Could not update quotation status."),
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };
  
  const getStatusBadgeVariant = (status: QuotationStatus) => {
    switch (status) {
      case 'Won': return 'default'; // default is often green-ish or primary
      case 'Lost': return 'destructive';
      case 'In Process': return 'secondary';
      default: return 'outline';
    }
  };


  return (
    <>
      <div className="mb-6 p-4 border rounded-lg bg-muted/30">
        <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
                <label htmlFor="managerFilter" className="block text-sm font-medium text-foreground mb-1">Relationship Manager</label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                    <SelectTrigger id="managerFilter" className="w-full">
                        <SelectValue placeholder="Filter by Manager" />
                    </SelectTrigger>
                    <SelectContent>
                        {allManagers.map(manager => (
                        <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-foreground mb-1">Status</label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as QuotationStatus | "All")}>
                    <SelectTrigger id="statusFilter" className="w-full">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        {QUOTATION_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={fetchQuotations} disabled={isLoading} className="w-full md:w-auto self-end">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                Apply Filters
            </Button>
        </div>
      </div>

      {isLoading && quotations.length === 0 ? (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading quotations...</p>
        </div>
      ) : !isLoading && quotations.length === 0 ? (
         <div className="text-center py-10 text-muted-foreground">
            No quotations found matching your criteria.
        </div>
      ) : (
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableCaption>A list of your saved quotations.</TableCaption>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Quotation #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{quotation.relationshipManager}</TableCell>
                  <TableCell>
                    {updatingStatusId === quotation._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                    <Select
                        value={quotation.status}
                        onValueChange={(newStatus) => handleStatusChange(quotation._id, newStatus as QuotationStatus)}
                    >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                             <Badge variant={getStatusBadgeVariant(quotation.status)} className="mr-1 px-1.5 py-0.5">
                                {quotation.status}
                             </Badge>
                             <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                        {QUOTATION_STATUSES.map(stat => (
                            <SelectItem key={stat} value={stat} className="text-xs">{stat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                  </TableCell>
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
      )}
    </>
  );
}
