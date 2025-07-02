import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OrdersPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="flex flex-col md:flex-row justify-between gap-2 md:items-center">
              <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-6 w-20 ml-auto mt-1" />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <Skeleton className="h-9 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
