// ✅ src/app/admin/users/page.tsx (corregido)
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User as AuthUser } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

// ✅ ACCIONES CORRECTAMENTE IMPORTADAS
import { deleteUserAction, updateUserAdminStatusAction, fetchAllUsersAction } from './actions';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const { toast } = useToast();

  const getInitials = (user: AuthUser | null) => {
    if (!user) return '??';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    if (first && last) return `${first}${last}`.toUpperCase();
    return (user.username?.[0] || user.email?.[0] || '?').toUpperCase();
  };

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const fetchedUsers = await fetchAllUsersAction();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
        toast({ variant: "destructive", title: "Error", description: (error as Error).message || "Could not load users." });
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, [toast]);

  const handleToggleAdmin = async (userId: number, currentIsAdmin: boolean) => {
    setUpdatingUserId(userId);
    try {
      const updatedUser = await updateUserAdminStatusAction(userId, !currentIsAdmin);
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, isAdmin: updatedUser.isAdmin } : user));
      toast({ title: "User Updated", description: `Admin status ${updatedUser.isAdmin ? 'granted to' : 'revoked from'} ${updatedUser.email}.` });
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message || "Could not update admin status." });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number, userIdentifier: string) => {
    setUpdatingUserId(userId);
    try {
      await deleteUserAction(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({ title: "User Deleted", description: `User ${userIdentifier} has been removed.` });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ variant: "destructive", title: "Deletion Failed", description: (error as Error).message || "Could not delete user." });
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) return <AdminUsersSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>View and manage customer accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[60px] sm:table-cell"><span className="sr-only">Avatar</span></TableHead>
                <TableHead>Name / Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoUrl || undefined} alt={user.username} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
                    {(user.firstName || user.lastName) && <div className="text-xs text-muted-foreground">{user.username}</div>}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant={user.isAdmin ? 'default' : 'outline'}>{user.isAdmin ? 'Admin' : 'Customer'}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">{user.phoneNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={updatingUserId === user.id}>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={updatingUserId === user.id}>
                            {updatingUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {user.email !== 'admin@digitalzone.com' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, user.isAdmin)} className="cursor-pointer">
                                {user.isAdmin ? <ShieldOff className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete user "{user.username}" ({user.email}).</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.username)} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">No users found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const buttonVariants = cva("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function AdminUsersSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[60px] sm:table-cell"><span className="sr-only">Avatar</span></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-9 w-9 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
