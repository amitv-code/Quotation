"use client";

import React, { useState } from 'react';
import { highlightPaymentClauses } from '@/ai/flows/highlight-payment-clauses'; // Adjust path if needed
import type { HighlightPaymentClausesInput } from '@/ai/flows/highlight-payment-clauses';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wand2, AlertTriangle } from 'lucide-react'; // Using Wand2 for AI/magic
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown'; // For rendering markdown

// Default Payment Policy Example (can be fetched or configured elsewhere in a real app)
const defaultPaymentPolicy = `
Standard Payment Terms:
1.  Payment Due Date: All invoices are due within 30 days of the invoice date (Net 30).
2.  New Customer Incentive: For first-time customers in good standing, a 5% discount is offered if payment is made within 10 days.
3.  Late Payment Penalty: A late fee of 1.5% per month will be applied to outstanding balances after the due date.
4.  Payment Methods: We accept payment via bank transfer, credit card, or company check.
5.  Disputed Charges: Any disputed charges must be reported within 15 days of the invoice date.
6.  Installment Plan: For orders over $10,000, an installment plan may be available upon request and credit approval.
7.  Delinquency Protocol: Accounts overdue by more than 60 days may be subject to collections and suspension of services.
8.  Prepayment Discount: A 2% discount is available for full prepayment on orders exceeding $5,000.
`;


export default function PaymentClauseHighlighter() {
  const [paymentHistory, setPaymentHistory] = useState('');
  const [paymentPolicy, setPaymentPolicy] = useState(defaultPaymentPolicy);
  const [highlightedClauses, setHighlightedClauses] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!paymentHistory.trim() || !paymentPolicy.trim()) {
      setError("Both payment history and payment policy fields are required.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setHighlightedClauses('');

    const input: HighlightPaymentClausesInput = {
      paymentHistory,
      paymentPolicy,
    };

    try {
      const result = await highlightPaymentClauses(input);
      setHighlightedClauses(result.highlightedClauses);
      toast({
        title: "Clauses Highlighted",
        description: "Payment policy clauses have been highlighted by AI.",
      });
    } catch (err: any) {
      console.error("Error highlighting clauses:", err);
      const errorMessage = err.message || "An unexpected error occurred while processing your request.";
      setError(errorMessage);
      toast({
        title: "Highlighting Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="paymentHistory">Customer Payment History</Label>
          <Textarea
            id="paymentHistory"
            value={paymentHistory}
            onChange={(e) => setPaymentHistory(e.target.value)}
            placeholder="e.g., New customer. OR Consistently pays on time. OR History of late payments, currently 45 days overdue on last invoice."
            rows={6}
            className="border-input focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentPolicy">Company Payment Policy</Label>
          <Textarea
            id="paymentPolicy"
            value={paymentPolicy}
            onChange={(e) => setPaymentPolicy(e.target.value)}
            placeholder="Enter your company's standard payment policy here..."
            rows={6}
            className="border-input focus:border-primary"
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90">
        <Wand2 className="mr-2 h-4 w-4" />
        {isLoading ? 'Analyzing...' : 'Highlight Relevant Clauses'}
      </Button>

      {error && (
         <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {highlightedClauses && (
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle>AI-Highlighted Payment Policy</CardTitle>
            <CardDescription>
              Relevant clauses based on the customer's payment history are highlighted in <strong>bold</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none p-4 border rounded-md bg-muted/30">
              <ReactMarkdown
                components={{
                  strong: ({node, ...props}) => <strong className="text-primary font-semibold bg-primary/10 p-0.5 rounded" {...props} />
                }}
              >
                {highlightedClauses}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
