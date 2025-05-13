
import type { Product } from '@/types';

// Parses comma-separated values (CSV) or tab-separated values (TSV)
export function parseProductCSV(fileContent: string): Product[] {
  const products: Product[] = [];
  const lines = fileContent.trim().split(/\r?\n/);

  if (lines.length < 2) {
    // Needs header and at least one data line
    throw new Error("File must contain a header row and at least one data row.");
  }

  let headerLine = lines[0];
  // Remove BOM from the start of the header line, if present
  if (headerLine.charCodeAt(0) === 0xFEFF) {
    headerLine = headerLine.substring(1);
  }

  // Detect delimiter (comma or tab)
  const commaCount = (headerLine.match(/,/g) || []).length;
  const tabCount = (headerLine.match(/\t/g) || []).length;
  
  let delimiter = '\t'; // Default to tab
  if (commaCount > tabCount) {
    delimiter = ',';
  }
  
  // Process headers: split by detected delimiter, then robustly trim and convert to lowercase
  const headers = headerLine
    .split(delimiter)
    .map(h => 
      h
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') // More robust trim for various spaces and BOM
        .toLowerCase()
    );
  
  const expectedHeaders = ["title", "size", "variant sku", "cost price", "variant price", "gst", "image src"];
  
  const missingHeaders = expectedHeaders.filter(eh => !headers.includes(eh));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing expected headers: ${missingHeaders.join(', ')}. Found in file: ${headers.join(', ')}. Please ensure your ${delimiter === ',' ? 'CSV' : 'TSV'} file has the correct headers.`);
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

    const values = line.split(delimiter).map(v => v.trim());

    // Ensure all necessary columns are present for the row
    if (values.length < Math.max(titleIndex, skuIndex, costPriceIndex, variantPriceIndex, gstIndex, imageSrcIndex) + 1) {
        console.warn(`Skipping row ${i + 1} due to insufficient columns for detected delimiter '${delimiter}'. Expected at least ${Math.max(titleIndex, skuIndex, costPriceIndex, variantPriceIndex, gstIndex, imageSrcIndex) + 1} columns, got ${values.length}. Line: "${line}"`);
        continue;
    }

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
      console.warn(`Skipping row ${i+1} ('${title}') due to invalid numeric value(s). CostPrice: ${values[costPriceIndex]}, VariantPrice: ${values[variantPriceIndex]}, GST: ${values[gstIndex]}`);
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

