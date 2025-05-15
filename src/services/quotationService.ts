
import type { Quotation, SavedQuotation } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import { Collection, ObjectId } from 'mongodb';

async function getQuotationsCollection(): Promise<Collection<Quotation>> {
  const { db } = await connectToDatabase();
  return db.collection<Quotation>('quotations');
}

export async function saveQuotation(quotationData: Omit<Quotation, '_id' | 'createdAt'>): Promise<SavedQuotation> {
  const collection = await getQuotationsCollection();
  const quotationToInsert: Quotation = {
    ...quotationData,
    createdAt: new Date(),
  };
  const result = await collection.insertOne(quotationToInsert);
  
  if (!result.insertedId) {
    throw new Error('Failed to save quotation to database.');
  }
  
  const savedQuotation = await collection.findOne({ _id: result.insertedId });
  if (!savedQuotation) {
    throw new Error('Failed to retrieve saved quotation from database.');
  }
  return { ...savedQuotation, _id: savedQuotation._id.toString() } as SavedQuotation;
}

export async function getQuotations(): Promise<SavedQuotation[]> {
  const collection = await getQuotationsCollection();
  const quotations = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return quotations.map(quotation => ({
    ...quotation,
    _id: quotation._id!.toString(),
  })) as SavedQuotation[];
}

export async function getQuotationById(id: string): Promise<SavedQuotation | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await getQuotationsCollection();
  const quotation = await collection.findOne({ _id: new ObjectId(id) });
  if (!quotation) {
    return null;
  }
  return { ...quotation, _id: quotation._id.toString() } as SavedQuotation;
}
