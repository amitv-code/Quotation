
export const QUOTATION_STATUSES = ['In Process', 'Won', 'Lost'] as const;
export type QuotationStatus = typeof QUOTATION_STATUSES[number];

export interface Product {
  id: string;
  title: string;
  size: string;
  sku: string;
  costPrice: number;
  variantPrice: number;
  gst: number; 
  imageSrc: string;
}

export interface Customer {
  name: string; // Mandatory
  company?: string; // Optional
  addressLine1?: string; // Optional
  addressLine2?: string; // Optional
  city?: string; // Optional
  state?: string; // Optional
  zip?: string; // Optional
  phone?: string; // Optional
  email?: string; // Optional
}

export interface QuotationItem {
  productId: string;
  title: string;
  imageSrc: string;
  quantity: number;
  unitPrice: number; 
  gstRate: number;
  taxAmount: number; 
  totalAmount: number; 
}

export interface CompanyInfo {
  name: string;
  address: string;
  cityStateZip: string;
  phone: string;
  email: string;
  logoUrl: string;
}

export interface PaymentInstructions {
  payableTo: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  notes?: string[];
}

export interface Quotation {
  _id?: string; 
  quotationNumber: string;
  issueDate: string; 
  dueDate: string; 
  customer: Customer;
  items: QuotationItem[];
  relationshipManager: string;
  status: QuotationStatus; // Added status
  subtotal: number; 
  totalTax: number; 
  grandTotal: number;
  companyInfo: CompanyInfo;
  paymentInstructions: PaymentInstructions;
  thankYouMessage?: string;
  createdAt?: Date; 
}

export interface ProductFormData {
  title: string;
  size: string;
  sku: string;
  costPrice: string;
  variantPrice: string; 
  gst: string;
  imageSrc: string;
}

export type SavedQuotation = Quotation & {
  _id: string; 
  createdAt: Date;
};

// Interface for Invoice (if still needed elsewhere, or can be removed if fully migrated)
export interface InvoiceItem {
  productId: string;
  title: string;
  imageSrc: string;
  quantity: number;
  unitPrice: number; // This is tax-inclusive price
  gstRate: number;
  taxAmount: number;
  totalAmount: number; // unitPrice * quantity (total inclusive price for item)
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customer: Customer; // Re-using customer type, ensure it matches invoice needs
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  companyInfo: CompanyInfo;
  paymentInstructions: PaymentInstructions;
  thankYouMessage?: string;
  createdAt?: Date;
}

export type SavedInvoice = Invoice & {
  _id: string;
  createdAt: Date;
};
