"use client";

import React, { useState, useMemo } from 'react';
import type { Product } from '@/types';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  products: Product[];
  onProductSelect: (productId: string) => void;
}

export default function ProductSearch({ products, onProductSelect }: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(""); // Stores the selected product's SKU or ID

  const productOptions = useMemo(() => 
    products.map(p => ({
      value: p.id, // Use product ID as the unique value
      label: `${p.title} (SKU: ${p.sku || 'N/A'})`,
    })), [products]);

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between md:w-[400px]" // Adjusted width
          >
            {value
              ? productOptions.find((product) => product.value === value)?.label
              : "Select product..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full md:w-[400px] p-0"> {/* Adjusted width */}
          <Command>
            <CommandInput placeholder="Search product by title or SKU..." />
            <CommandList>
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {productOptions.map((product) => (
                  <CommandItem
                    key={product.value}
                    value={product.label} // Search against label
                    onSelect={() => {
                      onProductSelect(product.value);
                      setValue(product.value); // Store selected product's ID
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {product.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button type="button" onClick={() => { if(value) onProductSelect(value); }} disabled={!value}>
        <Search className="mr-2 h-4 w-4" /> Add to Invoice
      </Button>
    </div>
  );
}
