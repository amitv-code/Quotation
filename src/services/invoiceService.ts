
import type { Invoice, SavedInvoice } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import { Collection, ObjectId } from 'mongodb';

async function getInvoicesCollection(): Promise<Collection<Invoice>> {
  const { db } = await connectToDatabase();
  return db.collection<Invoice>('invoices');
}

export async function saveInvoice(invoiceData: Omit<Invoice, '_id' | 'createdAt'>): Promise<SavedInvoice> {
  const collection = await getInvoicesCollection();
  const invoiceToInsert: Invoice = {
    ...invoiceData,
    createdAt: new Date(),
  };
  const result = await collection.insertOne(invoiceToInsert);
  
  if (!result.insertedId) {
    throw new Error('Failed to save invoice to database.');
  }
  
  // Fetch the inserted document to return it with the _id
  const savedInvoice = await collection.findOne({ _id: result.insertedId });
  if (!savedInvoice) {
    throw new Error('Failed to retrieve saved invoice from database.');
  }
  // Ensure _id is a string
  return { ...savedInvoice, _id: savedInvoice._id.toString() } as SavedInvoice;
}

export async function getInvoices(): Promise<SavedInvoice[]> {
  const collection = await getInvoicesCollection();
  const invoices = await collection.find({}).sort({ createdAt: -1 }).toArray();
  // Convert ObjectId to string for each invoice
  return invoices.map(invoice => ({
    ...invoice,
    _id: invoice._id!.toString(), // ObjectId will exist
  })) as SavedInvoice[];
}

export async function getInvoiceById(id: string): Promise<SavedInvoice | null> {
  if (!ObjectId.isValid(id)) {
    return null; // Or throw an error: throw new Error('Invalid invoice ID format');
  }
  const collection = await getInvoicesCollection();
  const invoice = await collection.findOne({ _id: new ObjectId(id) });
  if (!invoice) {
    return null;
  }
  return { ...invoice, _id: invoice._id.toString() } as SavedInvoice;
}
