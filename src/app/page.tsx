"use client";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateInvoicePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Create New Invoice</CardTitle>
          <CardDescription>Fill in the details below to generate a new invoice.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceForm />
        </CardContent>
      </Card>
    </div>
  );
}
