import { Separator } from '@/components/ui/separator';

export default function OrderSummary({ order }: { order: any }) {
  return (
    <>
      <div className="text-xs text-muted-foreground space-y-1">
        <p><span className="font-medium">Subtotal:</span> ${Number(order.subtotal).toFixed(2)}</p>
        {Number(order.giftWrapTotal) > 0 && (
          <p><span className="font-medium">Gift Wrap:</span> ${Number(order.giftWrapTotal).toFixed(2)}</p>
        )}
        <p><span className="font-medium">Shipping:</span> Free</p>
        <p className="font-semibold pt-1">Total Paid: ${Number(order.total).toFixed(2)}</p>
      </div>
      <Separator className="my-3" />
      <div className="text-xs text-muted-foreground space-y-1">
        <p><span className="font-medium">Shipped To:</span> {order.shippingAddress}</p>
        <p><span className="font-medium">Billed To:</span> {order.billingAddress} ({order.billingEmail})</p>
      </div>
    </>
  );
}
