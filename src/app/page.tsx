'use client';
import { ProductBrowser } from '@/components/products/product-browser';

export default function Home() {
  return (
    <div className="container py-2">
      <h1 className="text-4xl font-bold text-center mb-5">Welcome to DigitalZone JC</h1>
      <ProductBrowser showTitle={false} />
    </div>
  );
}
