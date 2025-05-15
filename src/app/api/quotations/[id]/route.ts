
import { NextResponse, type NextRequest } from 'next/server';
import { updateQuotation as updateQuotationInDb, getQuotationById } from '@/services/quotationService';
import type { Quotation, QuotationStatus } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Quotation ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, ...otherUpdates } = body as Partial<Omit<Quotation, '_id' | 'createdAt'>> & { status?: QuotationStatus };

    // For now, we only allow updating the status explicitly.
    // If other updates are present, ensure they are valid if you expand this.
    if (Object.keys(otherUpdates).length > 0 && !status) {
        return NextResponse.json({ message: 'Only status updates are currently supported or invalid update fields provided.' }, { status: 400 });
    }
    if (status && !['In Process', 'Won', 'Lost'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status value.' }, { status: 400 });
    }
    
    const updatesToApply: Partial<Omit<Quotation, '_id' | 'createdAt'>> = {};
    if (status) {
        updatesToApply.status = status;
    }
    // Add other updatable fields here if needed
    // e.g., if (otherUpdates.someField) updatesToApply.someField = otherUpdates.someField;


    if (Object.keys(updatesToApply).length === 0) {
        return NextResponse.json({ message: 'No valid fields provided for update.' }, { status: 400 });
    }
    
    const updatedQuotation = await updateQuotationInDb(id, updatesToApply);

    if (!updatedQuotation) {
      return NextResponse.json({ message: 'Quotation not found or failed to update' }, { status: 404 });
    }

    return NextResponse.json(updatedQuotation, { status: 200 });
  } catch (error) {
    console.error(`Error updating quotation ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to update quotation', error: errorMessage }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Quotation ID is required' }, { status: 400 });
  }

  try {
    const quotation = await getQuotationById(id);
    if (!quotation) {
      return NextResponse.json({ message: 'Quotation not found' }, { status: 404 });
    }
    return NextResponse.json(quotation, { status: 200 });
  } catch (error) {
    console.error(`Error fetching quotation ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch quotation', error: errorMessage }, { status: 500 });
  }
}
