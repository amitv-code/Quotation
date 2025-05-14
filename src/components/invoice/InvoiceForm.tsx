
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Invoice, Customer, InvoiceItem, CompanyInfo, PaymentInstructions } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Trash2, Eye, Save, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useProducts } from '@/contexts/ProductContext';
import ProductSearch from '@/components/invoice/ProductSearch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; 
import { defaultCompanyInfo, defaultPaymentInstructions } from '@/lib/invoiceDefaults';

const customerSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  company: z.string().optional(),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
});

const invoiceItemSchema = z.object({
  productId: z.string().min(1),
  title: z.string().min(1),
  imageSrc: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0), // This is tax-inclusive price
  gstRate: z.number().min(0),
  taxAmount: z.number().min(0), 
  totalAmount: z.number().min(0), // unitPrice * quantity (total inclusive price for item)
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.date({ required_error: "Issue date is required."}),
  dueDate: z.date({ required_error: "Due date is required."}),
  customer: customerSchema,
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const LOCAL_STORAGE_CUSTOMER_KEY = 'invoiceflow_customer';

export default function InvoiceForm() {
  const { products, loading: productsLoading } = useProducts();
  const { toast } = useToast();
  const router = useRouter();
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(0);
  const [isSaving, setIsSaving] = useState(false);


  const methods = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: '',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), 
      customer: {
        name: '',
        company: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
      },
      items: [],
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  useEffect(() => {
    const storedCustomer = localStorage.getItem(LOCAL_STORAGE_CUSTOMER_KEY);
    if (storedCustomer) {
      try {
        const customerData = JSON.parse(storedCustomer);
        setValue('customer', customerData, { shouldValidate: true });
      } catch (e) {
        console.error("Failed to parse customer data from localStorage", e);
      }
    }
    const storedLastInvoiceNum = localStorage.getItem('invoiceflow_lastInvoiceNum');
    const currentNum = storedLastInvoiceNum ? parseInt(storedLastInvoiceNum, 10) : 0;
    setLastInvoiceNumber(currentNum);
    setValue('invoiceNumber', `INV-${String(currentNum + 1).padStart(4, '0')}`);

  }, [setValue]);

  const customerData = watch('customer');
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CUSTOMER_KEY, JSON.stringify(customerData));
  }, [customerData]);


  const calculateTotals = (currentItems: InvoiceItem[]) => {
    const grandTotal = currentItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalTax = currentItems.reduce((sum, item) => sum + item.taxAmount, 0);
    // Subtotal (pre-tax) = Grand Total (inclusive) - Total Tax
    const subtotal = grandTotal - totalTax;
    return { subtotal, totalTax, grandTotal };
  };

  const { subtotal, totalTax, grandTotal } = calculateTotals(items);

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const quantity = 1;
      const unitPriceInclusive = product.variantPrice; 
      
      const taxAmountPerUnit = unitPriceInclusive - (unitPriceInclusive / (1 + (product.gst / 100)));
      const taxAmountForItem = taxAmountPerUnit * quantity;
      const totalAmountForItem = unitPriceInclusive * quantity;
      
      append({
        productId: product.id,
        title: product.title,
        imageSrc: product.imageSrc,
        quantity: quantity,
        unitPrice: unitPriceInclusive, 
        gstRate: product.gst,
        taxAmount: taxAmountForItem,
        totalAmount: totalAmountForItem,
      });
    }
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const item = items[index];
    if (item && newQuantity > 0) {
      const unitPriceInclusive = item.unitPrice;
      
      const taxAmountPerUnit = unitPriceInclusive - (unitPriceInclusive / (1 + (item.gstRate / 100)));
      const taxAmountForItem = taxAmountPerUnit * newQuantity;
      const totalAmountForItem = unitPriceInclusive * newQuantity;

      update(index, { 
        ...item, 
        quantity: newQuantity, 
        taxAmount: taxAmountForItem, 
        totalAmount: totalAmountForItem 
      });
    }
  };

  const handleUnitPriceChange = (index: number, newUnitPrice: number) => {
    const item = items[index];
    if (item && newUnitPrice >= 0) {
      const quantity = item.quantity;
      
      const taxAmountPerUnit = newUnitPrice - (newUnitPrice / (1 + (item.gstRate / 100)));
      const taxAmountForItem = taxAmountPerUnit * quantity;
      const totalAmountForItem = newUnitPrice * quantity;

      update(index, { 
        ...item, 
        unitPrice: newUnitPrice, 
        taxAmount: taxAmountForItem, 
        totalAmount: totalAmountForItem 
      });
    }
  };
  
  const onSubmit = async (data: InvoiceFormData) => {
    setIsSaving(true);
    const completeInvoiceData: Omit<Invoice, '_id' | 'createdAt'> = { 
      ...data,
      issueDate: format(data.issueDate, "yyyy-MM-dd"),
      dueDate: format(data.dueDate, "yyyy-MM-dd"),
      items: data.items.map(item => ({ 
          productId: item.productId,
          title: item.title,
          imageSrc: item.imageSrc || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice, 
          gstRate: item.gstRate,
          taxAmount: item.taxAmount, 
          totalAmount: item.totalAmount, 
      })),
      subtotal, 
      totalTax, 
      grandTotal, 
      companyInfo: defaultCompanyInfo,
      paymentInstructions: defaultPaymentInstructions,
      thankYouMessage: "Thank you for your business!"
    };

    try {
      localStorage.setItem('current_invoice_data', JSON.stringify(completeInvoiceData));

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeInvoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save invoice to database (status: ${response.status})`);
      }
      
      const result = await response.json();

      const newInvoiceNum = lastInvoiceNumber + 1;
      localStorage.setItem('invoiceflow_lastInvoiceNum', String(newInvoiceNum));
      setLastInvoiceNumber(newInvoiceNum); 

      toast({
        title: "Invoice Saved & Prepared",
        description: `Invoice ${completeInvoiceData.invoiceNumber} saved to database (ID: ${result.invoiceId}) and ready for preview.`,
      });
      router.push('/invoice/preview');
    } catch (e) {
      console.error("Error processing invoice:", e);
      toast({
        title: "Processing Error",
        description: e instanceof Error ? e.message : "Could not save or prepare invoice.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Invoice Meta */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <FormFieldItem name="invoiceNumber" label="Invoice Number" error={errors.invoiceNumber?.message}>
              <Input {...methods.register("invoiceNumber")} readOnly className="bg-muted/50" />
            </FormFieldItem>
            <FormFieldItem name="issueDate" label="Issue Date" error={errors.issueDate?.message}>
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </FormFieldItem>
            <FormFieldItem name="dueDate" label="Due Date" error={errors.dueDate?.message}>
               <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </FormFieldItem>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Enter the client's information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <FormFieldItem name="customer.name" label="Client Name" error={errors.customer?.name?.message}>
                <Input {...methods.register("customer.name")} />
              </FormFieldItem>
              <FormFieldItem name="customer.company" label="Company (Optional)" error={errors.customer?.company?.message}>
                <Input {...methods.register("customer.company")} />
              </FormFieldItem>
            </div>
            <FormFieldItem name="customer.addressLine1" label="Address Line 1" error={errors.customer?.addressLine1?.message}>
              <Input {...methods.register("customer.addressLine1")} />
            </FormFieldItem>
            <FormFieldItem name="customer.addressLine2" label="Address Line 2 (Optional)" error={errors.customer?.addressLine2?.message}>
              <Input {...methods.register("customer.addressLine2")} />
            </FormFieldItem>
            <div className="grid md:grid-cols-3 gap-6">
              <FormFieldItem name="customer.city" label="City" error={errors.customer?.city?.message}>
                <Input {...methods.register("customer.city")} />
              </FormFieldItem>
              <FormFieldItem name="customer.state" label="State/Province" error={errors.customer?.state?.message}>
                <Input {...methods.register("customer.state")} />
              </FormFieldItem>
              <FormFieldItem name="customer.zip" label="ZIP/Postal Code" error={errors.customer?.zip?.message}>
                <Input {...methods.register("customer.zip")} />
              </FormFieldItem>
            </div>
             <div className="grid md:grid-cols-2 gap-6">
                <FormFieldItem name="customer.email" label="Email (Optional)" error={errors.customer?.email?.message}>
                    <Input type="email" {...methods.register("customer.email")} />
                </FormFieldItem>
                <FormFieldItem name="customer.phone" label="Phone (Optional)" error={errors.customer?.phone?.message}>
                    <Input {...methods.register("customer.phone")} />
                </FormFieldItem>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>Add products to the invoice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {productsLoading ? <p>Loading products for search...</p> : <ProductSearch products={products} onProductSelect={handleAddProduct} />}
            {errors.items?.message && <p className="text-sm font-medium text-destructive">{errors.items.message}</p>}
            {fields.length > 0 && (
              <div className="mt-4 space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-2 items-center">
                      <span className="font-medium md:col-span-2 truncate" title={items[index].title}>{items[index].title}</span>
                      
                      <FormFieldItem name={`items.${index}.quantity`} label="Quantity" srOnlyLabel={true} noBottomMargin>
                        <Input
                          type="number"
                          min="1"
                          {...methods.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value,10) || 1)}
                          className="w-full md:w-20 text-center"
                        />
                      </FormFieldItem>

                      <FormFieldItem name={`items.${index}.unitPrice`} label="Unit Price (incl. tax)" srOnlyLabel={true} noBottomMargin>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...methods.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                            onChange={(e) => handleUnitPriceChange(index, parseFloat(e.target.value) || 0)}
                            className="w-full md:w-28 text-right pl-7 pr-2" 
                          />
                        </div>
                      </FormFieldItem>
                      
                      <span className="text-sm text-muted-foreground text-center">GST: {items[index].gstRate.toFixed(0)}%</span>
                      
                      <span className="text-sm font-semibold text-right">₹{items[index].totalAmount.toFixed(2)}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (Pre-tax):</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tax (GST):</span>
              <span>₹{totalTax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total (Incl. Tax):</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
           <Button type="button" variant="outline" onClick={() => { 
               const currentInvNum = lastInvoiceNumber; 
               methods.reset(); 
               setValue('invoiceNumber', `INV-${String(currentInvNum + 1).padStart(4, '0')}`);
               // Restore default dates after reset
               setValue('issueDate', new Date());
               setValue('dueDate', new Date(new Date().setDate(new Date().getDate() + 30)));
               // Attempt to restore customer data if it was in localStorage
                const storedCustomer = localStorage.getItem(LOCAL_STORAGE_CUSTOMER_KEY);
                if (storedCustomer) {
                  try {
                    const customerData = JSON.parse(storedCustomer);
                    setValue('customer', customerData, { shouldValidate: true });
                  } catch (e) { /* ignore */ }
                }
             }}
             disabled={isSaving}
           >
            Clear Form
          </Button>
          <Button type="submit" variant="default" className="bg-accent hover:bg-accent/90" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            {isSaving ? 'Processing...' : 'Preview & Generate Invoice'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}


// Helper component for form fields to reduce repetition
interface FormFieldItemProps {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  srOnlyLabel?: boolean;
  noBottomMargin?: boolean;
}

function FormFieldItem({ name, label, error, children, srOnlyLabel = false, noBottomMargin = false }: FormFieldItemProps) {
  return (
    <div className={cn("space-y-1", noBottomMargin ? "" : "mb-4")}>
      <Label htmlFor={name} className={cn(srOnlyLabel ? "sr-only" : "")}>{label}</Label>
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

