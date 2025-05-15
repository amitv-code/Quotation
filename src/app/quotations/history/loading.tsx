
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Quotation History</CardTitle>
          <CardDescription>
            View all previously created and saved quotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Skeletons */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <Skeleton className="h-5 w-1/3 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-1/3 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full md:w-auto" />
            </div>
          </div>
          
          {/* Table Skeletons */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-32" /></TableHead> {/* Relationship Manager */}
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead> {/* Status */}
                  <TableHead className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableHead>
                  <TableHead className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell> {/* Relationship Manager */}
                    <TableCell><Skeleton className="h-8 w-28 rounded-md" /></TableCell> {/* Status Select Skeleton */}
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
