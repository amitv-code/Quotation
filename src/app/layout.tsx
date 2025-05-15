
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { ProductProvider } from '@/contexts/ProductContext';
import AuthProvider from '@/components/layout/AuthProvider'; // Added AuthProvider

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PerformaFlow - Create & Manage Quotations',
  description: 'Easily create and manage professional quotations with PerformaFlow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider> {/* Wrapped with AuthProvider */}
          <ProductProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
