import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChatWidget } from '@/components/chat/chat-widget';

export const metadata: Metadata = {
    title: 'DigitalZone JC',
    description: 'Your source for the latest in technology.',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
        <body className="font-sans antialiased flex flex-col min-h-screen" suppressHydrationWarning={true}>
        <AuthProvider>
            <CartProvider>
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>
                <ChatWidget />
                <Footer />
                <Toaster />
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
