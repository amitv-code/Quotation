
import { NextResponse, type NextRequest } from 'next/server';
import { saveQuotation as saveQuotationToDb, getQuotations as getQuotationsFromDb } from '@/services/quotationService';
import type { Quotation, QuotationStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const quotationData = (await request.json()) as Omit<Quotation, '_id' | 'createdAt'>;
    
    if (!quotationData || !quotationData.quotationNumber || !quotationData.items || quotationData.items.length === 0) {
      return NextResponse.json({ message: 'Invalid quotation data provided.' }, { status: 400 });
    }
    if (!quotationData.relationshipManager) {
      return NextResponse.json({ message: 'Relationship manager is required.' }, { status: 400 });
    }
    // Status will be defaulted by form if not provided, or explicitly set
    quotationData.status = quotationData.status || 'In Process';


    const savedQuotation = await saveQuotationToDb(quotationData);
    return NextResponse.json({ message: 'Quotation saved successfully', quotationId: savedQuotation._id }, { status: 201 });
  } catch (error) {
    console.error('Error saving quotation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to save quotation', error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relationshipManager = searchParams.get('relationshipManager') || undefined;
    const status = searchParams.get('status') as QuotationStatus | undefined;
    
    const filters: { relationshipManager?: string; status?: QuotationStatus } = {};
    if (relationshipManager && relationshipManager !== "All") {
      filters.relationshipManager = relationshipManager;
    }
    if (status && status !== "All" as any) { // 'All' is a UI convention, not a valid status
      filters.status = status;
    }

    const quotations = await getQuotationsFromDb(Object.keys(filters).length > 0 ? filters : undefined);
    return NextResponse.json(quotations, { status: 200 });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch quotations', error: errorMessage }, { status: 500 });
  }
}
