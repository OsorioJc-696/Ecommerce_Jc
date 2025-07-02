import { Gift } from 'lucide-react';

export default function OrderItem({ item }: { item: any }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <div>
        <p className="font-medium text-sm">{item.name}</p>
        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
        {item.customizationDetails && typeof item.customizationDetails === 'object' && (
          <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 pl-1 space-y-0.5">
            {Object.entries(item.customizationDetails).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(value)}
              </li>
            ))}
          </ul>
        )}
        {item.giftWrap && (
          <p className="text-xs text-primary flex items-center gap-1 mt-1">
            <Gift className="h-3 w-3" /> Gift Wrapped
          </p>
        )}
      </div>
      <p className="font-semibold text-sm">${Number(item.price).toFixed(2)}</p>
    </div>
  );
}
