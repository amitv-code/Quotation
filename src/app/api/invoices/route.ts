
import { NextResponse, type NextRequest } from 'next/server';
import { saveInvoice as saveInvoiceToDb, getInvoices as getInvoicesFromDb } from '@/services/invoiceService';
import type { Invoice } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const invoiceData = (await request.json()) as Omit<Invoice, '_id' | 'createdAt'>;
    
    if (!invoiceData || !invoiceData.invoiceNumber || !invoiceData.items || invoiceData.items.length === 0) {
      return NextResponse.json({ message: 'Invalid invoice data provided.' }, { status: 400 });
    }

    const savedInvoice = await saveInvoiceToDb(invoiceData);
    return NextResponse.json({ message: 'Invoice saved successfully', invoiceId: savedInvoice._id }, { status: 201 });
  } catch (error) {
    console.error('Error saving invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to save invoice', error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const invoices = await getInvoicesFromDb();
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch invoices', error: errorMessage }, { status: 500 });
  }
}
