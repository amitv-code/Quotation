export interface Product {
  id: string;
  title: string;
  size: string;
  sku: string;
  costPrice: number;
  variantPrice: number;
  gst: number; // Percentage, e.g., 12 for 12%
  imageSrc: string;
}

export interface Customer {
  name: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
}

export interface InvoiceItem {
  productId: string;
  title: string;
  imageSrc: string;
  quantity: number;
  unitPrice: number; // This is variantPrice from Product
  gstRate: number; // GST percentage from Product
  taxAmount: number; // (unitPrice * quantity) * (gstRate / 100)
  totalAmount: number; // (unitPrice * quantity) + taxAmount
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
  notes?: string[]; // Additional notes like "Late payments subject to X% fee"
}

export interface Invoice {
  invoiceNumber: string;
  issueDate: string; // Format YYYY-MM-DD
  dueDate: string; // Format YYYY-MM-DD
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number; // Sum of (unitPrice * quantity) for all items
  totalTax: number; // Sum of taxAmount for all items
  grandTotal: number; // subtotal + totalTax
  companyInfo: CompanyInfo;
  paymentInstructions: PaymentInstructions;
  thankYouMessage?: string;
}

// For product form, allow string inputs before conversion
export interface ProductFormData {
  title: string;
  size: string;
  sku: string;
  costPrice: string;
  variantPrice: string;
  gst: string;
  imageSrc: string;
}
