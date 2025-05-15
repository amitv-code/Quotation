"use client";
import QuotationForm from "@/components/quotation/QuotationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateQuotationPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Create New Quotation</CardTitle>
          <CardDescription>Fill in the details below to generate a new quotation.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuotationForm />
        </CardContent>
      </Card>
    </div>
  );
}
