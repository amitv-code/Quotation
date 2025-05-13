
export interface Product {
  id: string;
  title: string;
  size: string;
  sku: string;
  costPrice: number;
  variantPrice: number; // This is now treated as tax-inclusive price from CSV/Product Management
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
  unitPrice: number; // This is variantPrice from Product, treated as TAX-INCLUSIVE
  gstRate: number; // GST percentage from Product
  taxAmount: number; // Tax portion of (unitPrice * quantity). Calculated as (unitPrice * (gstRate / 100)) * quantity
  totalAmount: number; // (unitPrice * quantity). This is the total TAX-INCLUSIVE amount for the line item.
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
  subtotal: number; // Sum of (item.totalAmount - item.taxAmount) for all items. This is the total PRE-TAX value.
  totalTax: number; // Sum of taxAmount for all items
  grandTotal: number; // subtotal + totalTax. This is also the sum of item.totalAmount (total TAX-INCLUSIVE value).
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
  variantPrice: string; // User inputs this, now considered tax-inclusive
  gst: string;
  imageSrc: string;
}

