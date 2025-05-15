import type { CompanyInfo, PaymentInstructions } from '@/types';

export const defaultCompanyInfo: CompanyInfo = {
  name: "Meddey Technologies Pvt Ltd",
  address: "Plot No. 46, Industrial Area, Phase 1",
  cityStateZip: "Panchkula, Haryana 134113",
  phone: "+91-7527043232",
  email: "support@meddey.com",
  logoUrl: "https://meddey.com/cdn/shop/files/Meddey_1_a9e7c93d-6b1b-4d73-b4cb-bb110a73204f.png?v=1680854022&width=200"
};

export const defaultPaymentInstructions: PaymentInstructions = {
  payableTo: "Meddey Technologies Pvt Ltd",
  bankName: "HDFC Bank",
  accountName: "Meddey Technologies Pvt Ltd",
  accountNumber: "50200030670441",
  notes: ["Thank you for your consideration!"] // Updated note
};
