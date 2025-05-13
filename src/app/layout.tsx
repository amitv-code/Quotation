import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { ProductProvider } from '@/contexts/ProductContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'InvoiceFlow - Create & Manage Invoices',
  description: 'Easily create and manage professional invoices with InvoiceFlow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ProductProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </ProductProvider>
      </body>
    </html>
  );
}
