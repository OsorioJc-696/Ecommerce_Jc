'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';

import {
  Package2,
  Home,
  ShoppingCart,
  Users,
  Settings,
  LineChart,
  LayoutDashboard,
  Folder,
  AlertCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirigir si no está autorizado
  useEffect(() => {
    if (!isLoading && (!currentUser || !isAdmin)) {
      router.replace('/login?redirect=/admin');
    }
  }, [isLoading, currentUser, isAdmin, router]);

  if (isLoading || !currentUser || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">
        Loading admin access...
      </div>
    );
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package2 },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/categories', label: 'Categories', icon: Folder },
    { href: '/admin/reports', label: 'Reports', icon: AlertCircle },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="text-lg">Admin Panel</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <Link href={href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    variant="default"
                    isActive={isActive(href)}
                    className={cn(
                      'justify-start',
                      isActive(href)
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'hover:bg-muted'
                    )}
                  >
                    <a>
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t">
          <Link href="/" passHref legacyBehavior>
            <SidebarMenuButton variant="ghost" className="justify-start">
              <Home className="mr-2 h-4 w-4" />
              Go to Store
            </SidebarMenuButton>
          </Link>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          {/* Optional: Page title or breadcrumbs could go here */}
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
