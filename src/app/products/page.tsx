"use client";

import React from 'react';
import ProductImport from '@/components/products/ProductImport';
import ProductList from '@/components/products/ProductList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProductsPage() {
  const { products, clearProducts, loading } = useProducts();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Import Products</CardTitle>
          <CardDescription>Upload a TSV (Tab Separated Values) file with product details.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImport />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Product List</CardTitle>
            <CardDescription>View and manage your imported products. ({products.length} products)</CardDescription>
          </div>
          {products.length > 0 && (
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear All Products
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all product data from your browser's local storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearProducts} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete all products
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading products...</p> : <ProductList products={products} />}
        </CardContent>
      </Card>
    </div>
  );
}
