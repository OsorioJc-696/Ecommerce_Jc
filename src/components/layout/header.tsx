'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package2, User, Heart, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from '@/context/cart-context';
import { useAuth, type User as AuthUser } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const getInitials = (user: AuthUser | null) => {
  if (!user) return '??';
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  if (first && last) return `${first}${last}`.toUpperCase();
  return (user.username?.[0] || user.email?.[0] || '?').toUpperCase();
};

export function Header() {
  const pathname = usePathname();
  const isAdminView = pathname.startsWith('/admin');
  const { itemCount } = useCart();
  const { currentUser, logout, isLoading, isAdmin } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    setNotificationCount(3); // puedes reemplazar por lógica real
  }, []);

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <div className="max-w-screen-xl mx-auto w-full px-4 flex items-center justify-between h-14">

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-sm" />
              <Skeleton className="h-5 w-28" />
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <div className="max-w-screen-xl mx-auto w-full px-4 flex items-center justify-between h-14">

        {/* NAV LEFT */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <Package2 className="h-6 w-6" />
            <span className="text-base leading-none">DigitalZone JC</span>
          </Link>

          {/* Navegación principal */}
          {!isAdminView && (
            <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/" className={cn("hover:text-primary", pathname === "/" && "text-primary")}>Home</Link>
              <Link href="/products" className={cn("hover:text-primary", pathname === "/products" && "text-primary")}>Products</Link>
              {currentUser && (
                <>
                  <Link href="/favorites" className="hover:text-primary">Favorites</Link>
                  <Link href="/orders" className="hover:text-primary">Orders</Link>
                  <Link href="/profile" className="hover:text-primary">Profile</Link>
                </>
              )}
              <Link href="/about" className="hover:text-primary">About</Link>
            </nav>
          )}

          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* NAV RIGHT */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5 transition-colors duration-200" />
                  {notificationCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1.5 text-xs leading-none flex items-center justify-center rounded-full"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Carrito */}
          <Link href="/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon"  >
              <ShoppingCart className="h-5 w-5 transition-colors duration-200" />
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1.5 text-xs leading-none flex items-center justify-center rounded-full"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Auth / Avatar */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
  variant="ghost"
  className="h-8 w-8 rounded-full transition-transform duration-200 hover:scale-105" aria-label="User menu"
>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.photoUrl || ''} alt={currentUser.username} />
                    <AvatarFallback>{getInitials(currentUser)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{currentUser.firstName || currentUser.username}</div>
                  <div className="text-xs text-muted-foreground">{currentUser.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/favorites"><Heart className="mr-2 h-4 w-4" />Favorites</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/orders"><Package2 className="mr-2 h-4 w-4" />Orders</Link></DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
  <Button
    variant="outline"
    className="transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]"
  >
    Login
  </Button>
</Link>

<Link href="/signup">
  <Button className="transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]">
    Sign Up
  </Button>
</Link>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
