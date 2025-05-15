
import { NextResponse, type NextRequest } from 'next/server';
import { saveQuotation as saveQuotationToDb, getQuotations as getQuotationsFromDb } from '@/services/quotationService';
import type { Quotation } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const quotationData = (await request.json()) as Omit<Quotation, '_id' | 'createdAt'>;
    
    if (!quotationData || !quotationData.quotationNumber || !quotationData.items || quotationData.items.length === 0) {
      return NextResponse.json({ message: 'Invalid quotation data provided.' }, { status: 400 });
    }

    const savedQuotation = await saveQuotationToDb(quotationData);
    return NextResponse.json({ message: 'Quotation saved successfully', quotationId: savedQuotation._id }, { status: 201 });
  } catch (error) {
    console.error('Error saving quotation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to save quotation', error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const quotations = await getQuotationsFromDb();
    return NextResponse.json(quotations, { status: 200 });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch quotations', error: errorMessage }, { status: 500 });
  }
}
