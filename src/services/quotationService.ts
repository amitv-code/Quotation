
import type { Quotation, SavedQuotation, QuotationStatus } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import { Collection, ObjectId, Filter } from 'mongodb';

async function getQuotationsCollection(): Promise<Collection<Quotation>> {
  const { db } = await connectToDatabase();
  return db.collection<Quotation>('quotations');
}

export async function saveQuotation(quotationData: Omit<Quotation, '_id' | 'createdAt'>): Promise<SavedQuotation> {
  const collection = await getQuotationsCollection();
  const quotationToInsert: Quotation = {
    ...quotationData,
    status: quotationData.status || 'In Process', // Ensure status is set
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

export async function getQuotations(filters?: { relationshipManager?: string; status?: QuotationStatus }): Promise<SavedQuotation[]> {
  const collection = await getQuotationsCollection();
  const query: Filter<Quotation> = {};

  if (filters?.relationshipManager && filters.relationshipManager !== 'All') {
    query.relationshipManager = filters.relationshipManager;
  }
  if (filters?.status && filters.status !== 'All' /* Assuming 'All' might be a UI option */) {
    query.status = filters.status;
  }

  const quotations = await collection.find(query).sort({ createdAt: -1 }).toArray();
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

export async function updateQuotation(id: string, updates: Partial<Omit<Quotation, '_id' | 'createdAt'>>): Promise<SavedQuotation | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await getQuotationsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  
  if (!result) { // In MongoDB Driver v4+, findOneAndUpdate returns null if no document found
    return null;
  }
  // The 'value' property is from older driver versions or different MongoDB interfaces.
  // For Node.js driver v4+, the updated document is directly in 'result' if returnDocument:'after'
  const updatedDoc = result as unknown as Quotation | null; // Casting because of potential type mismatch with findOneAndUpdate result type

  if (!updatedDoc) {
    return null;
  }

  return { ...updatedDoc, _id: updatedDoc._id!.toString() } as SavedQuotation;
}
