"use client";
import PaymentClauseHighlighter from "@/components/ai/PaymentClauseHighlighter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIPaymentClausesPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">AI Payment Clause Highlighter</CardTitle>
          <CardDescription>
            Analyze customer payment history against your company's payment policy. 
            The AI will highlight relevant clauses, suggesting terms adjustments based on risk profile for quotations or orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentClauseHighlighter />
        </CardContent>
      </Card>
    </div>
  );
}
