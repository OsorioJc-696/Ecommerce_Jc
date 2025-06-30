'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package2, User, Heart, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Function to get initials
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
    setNotificationCount(3);
  }, []);

  const HeaderSkeleton = () => (
    <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-pulse">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-sm" />
            <Skeleton className="h-5 w-28" />
          </div>
          <nav className="hidden items-center space-x-6 md:flex">
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

  if (isLoading) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo and Desktop Navigation */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 link-hover-effect">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block text-foreground">DigitalZone JC</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {!isAdminView && (
              <>
                <Link href="/" className={cn("text-foreground/80 link-hover-effect")}>Home</Link>
                <Link href="/products" className={cn("text-foreground/80 link-hover-effect")}>Products</Link>
                {currentUser && (
                  <>
                    <Link href="/favorites" className={cn("text-foreground/80 link-hover-effect")}>Favorites</Link>
                    <Link href="/orders" className={cn("text-foreground/80 link-hover-effect")}>Orders</Link>
                    <Link href="/profile" className={cn("text-foreground/80 link-hover-effect")}>Profile</Link>
                  </>
                )}
                <Link href="/about" className={cn("text-foreground/80 link-hover-effect")}>About</Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className={cn("text-foreground/80 link-hover-effect flex items-center gap-1")}>
                <ShieldCheck className="h-4 w-4 text-primary" /> Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          {/* Notifications */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5 text-foreground/80" />
                  {notificationCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {notificationCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-popover text-popover-foreground border-border" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="cursor-default focus:bg-transparent text-xs text-muted-foreground">
                  No new notifications.
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5 text-foreground/80" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {/* Auth */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.photoUrl || undefined} alt={currentUser.username} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(currentUser)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover text-popover-foreground border-border" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{`Hi, ${currentUser.firstName || currentUser.username}`}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                  <Link href="/profile" className="link-hover-effect">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                  <Link href="/favorites" className="link-hover-effect">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                  <Link href="/orders" className="link-hover-effect">
                    <Package2 className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      <Link href="/admin" className="link-hover-effect">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer focus:bg-destructive/80 focus:text-destructive-foreground text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
