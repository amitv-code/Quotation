"use client";

import type { Product } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return <p className="text-muted-foreground">No products imported yet. Upload a TSV file to see them here.</p>;
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableCaption>A list of your imported products.</TableCaption>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Variant Price</TableHead>
            <TableHead className="text-right">GST (%)</TableHead>
            <TableHead>Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="w-12 h-12 relative rounded-md overflow-hidden border bg-muted">
                {product.imageSrc ? (
                    <Image
                      src={product.imageSrc}
                      alt={product.title}
                      data-ai-hint="product photo"
                      fill
                      sizes="48px"
                      className="object-contain"
                      onError={(e) => { e.currentTarget.src = 'https://picsum.photos/48/48?grayscale'; }} // Fallback
                    />
                  ) : (
                    <Image
                      src="https://picsum.photos/48/48?grayscale" // Placeholder
                      alt="No image"
                       data-ai-hint="placeholder image"
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium max-w-xs truncate">{product.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{product.sku || 'N/A'}</Badge>
              </TableCell>
              <TableCell className="text-right">₹{product.variantPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">{product.gst}%</TableCell>
              <TableCell>{product.size}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
