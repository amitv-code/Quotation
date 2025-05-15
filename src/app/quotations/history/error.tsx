
"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="shadow-xl w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-bold tracking-tight text-destructive">An Error Occurred</CardTitle>
          <CardDescription>
            Sorry, something went wrong while trying to load the quotation history.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            {error.message || "An unexpected error occurred."}
          </p>
          <Button
            onClick={() => reset()}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
