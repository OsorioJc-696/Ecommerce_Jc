import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NoOrdersCard() {
  return (
    <Card className="max-w-xl mx-auto shadow-lg border border-border bg-muted text-muted-foreground text-center">
      <CardHeader>
        <CardTitle>No Orders Found</CardTitle>
        <CardDescription>You haven't placed any orders yet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/products">
          <Button variant="default">Start Shopping</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
