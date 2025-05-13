import type { Product, ProductFormData } from '@/types';

// Parses specifically tab-separated values
export function parseProductCSV(csvText: string): Product[] {
  const products: Product[] = [];
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    // Needs header and at least one data line
    throw new Error("CSV must contain a header row and at least one data row.");
  }

  const headerLine = lines[0].trim();
  const headers = headerLine.split('\t').map(h => h.trim().toLowerCase());
  
  const expectedHeaders = ["title", "size", "variant sku", "cost price", "variant price", "gst", "image src"];
  const missingHeaders = expectedHeaders.filter(eh => !headers.includes(eh));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing expected CSV headers: ${missingHeaders.join(', ')}. Found: ${headers.join(', ')}`);
  }

  const titleIndex = headers.indexOf("title");
  const sizeIndex = headers.indexOf("size");
  const skuIndex = headers.indexOf("variant sku");
  const costPriceIndex = headers.indexOf("cost price");
  const variantPriceIndex = headers.indexOf("variant price");
  const gstIndex = headers.indexOf("gst");
  const imageSrcIndex = headers.indexOf("image src");

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split('\t').map(v => v.trim());

    const title = values[titleIndex];
    const sku = values[skuIndex];

    if (!title || !sku) {
      console.warn(`Skipping row ${i + 1} due to missing title or SKU.`);
      continue;
    }
    
    const costPrice = parseFloat(values[costPriceIndex]);
    const variantPrice = parseFloat(values[variantPriceIndex]);
    const gst = parseFloat(values[gstIndex]);

    if (isNaN(costPrice) || isNaN(variantPrice) || isNaN(gst)) {
      console.warn(`Skipping row ${i+1} ('${title}') due to invalid numeric value(s).`);
      continue;
    }

    products.push({
      id: sku || `product-${Date.now()}-${i}`, // Use SKU as ID, fallback if empty
      title: title,
      size: values[sizeIndex] || 'Standard',
      sku: sku,
      costPrice: costPrice,
      variantPrice: variantPrice,
      gst: gst,
      imageSrc: values[imageSrcIndex] || '',
    });
  }
  return products;
}
