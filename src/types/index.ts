

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
  unitPrice: number; // This is variantPrice from Product, TAX-INCLUSIVE
  gstRate: number; // GST percentage from Product
  // Tax amount per unit = unitPrice - (unitPrice / (1 + gstRate/100))
  // Total tax amount for line item = (unitPrice - (unitPrice / (1 + gstRate/100))) * quantity
  taxAmount: number; 
  // Total amount for line item = unitPrice * quantity (This is TAX-INCLUSIVE)
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
  notes?: string[]; // Additional notes like "Late payments subject to X% fee"
}

export interface Invoice {
  _id?: string; // Optional: MongoDB ID, string representation of ObjectId
  invoiceNumber: string;
  issueDate: string; // Format YYYY-MM-DD
  dueDate: string; // Format YYYY-MM-DD
  customer: Customer;
  items: InvoiceItem[];
  // Subtotal = sum of (totalAmount / (1 + gstRate/100)) for each item. This is PRE-TAX.
  subtotal: number; 
  totalTax: number; // Sum of taxAmount for all items
  grandTotal: number; // subtotal + totalTax. This is also the sum of item.totalAmount (total TAX-INCLUSIVE value).
  companyInfo: CompanyInfo;
  paymentInstructions: PaymentInstructions;
  thankYouMessage?: string;
  createdAt?: Date; // For MongoDB timestamp
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

export type SavedInvoice = Invoice & {
  _id: string; // MongoDB ID will always be present for saved invoices
  createdAt: Date;
};
