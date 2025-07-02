import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import OrderItem from './OrderItem';
import OrderSummary from './OrderSummary';
import Link from 'next/link';

export default function OrderCard({ order }: { order: any }) {
  return (
    <Card className="bg-card text-card-foreground shadow-md border border-border">
      <CardHeader className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <CardTitle className="text-xl font-semibold">Order #{order.id.substring(0, 8)}...</CardTitle>
          <CardDescription className="text-sm">
            Placed: {new Date(order.orderDate).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="text-right space-y-1">
          <Badge variant="outline" className="text-xs">{order.status}</Badge>
          <div className="text-lg font-bold text-primary">${Number(order.total).toFixed(2)}</div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm font-medium">
              View Details ({order.items.length} items)
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {order.items.map((item: any) => (
                <OrderItem key={item.id} item={item} />
              ))}
              <OrderSummary order={order} />
              <Link href={`/orders/confirmation?orderId=${order.id}`} className="inline-block pt-3">
                <Button variant="outline" size="sm">View Confirmation</Button>
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
