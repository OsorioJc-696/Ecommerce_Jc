'use client';

import { useAuth, type User } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { User as UserIcon, Edit, Camera, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Schema for profile editing form
const profileSchema = z.object({
  username: z.string().min(1, "Username is required").nullable().optional().or(z.literal("")),
  dni: z.string().length(8, "DNI must be 8 digits").regex(/^\d{8}$/, "DNI must contain only digits").nullable().optional().or(z.literal("")),
  firstName: z.string().min(1, "First name is required").nullable().optional().or(z.literal("")),
  lastName: z.string().min(1, "Last name is required").nullable().optional().or(z.literal("")),
  phoneNumber: z.string().length(9, "Phone must be 9 digits").regex(/^9\d{8}$/, "Phone must start with 9").nullable().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required").nullable().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { currentUser, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to get user initials
  const getInitials = (user: User | null) => {
    if (!user) return '??';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    if (first && last) return `${first}${last}`.toUpperCase();
    return (user.username?.[0] || user.email?.[0] || '?').toUpperCase();
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
     dni: "", lastName: "", phoneNumber: "", address: "",
    },
  });

  // En resetForm 
const resetForm = useCallback(() => {
  if (currentUser) {
    form.reset({
      username: currentUser.username || "",
      dni: currentUser.dni || "",
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      phoneNumber: currentUser.phoneNumber || "",
      address: currentUser.address || "",
    });
  }
}, [currentUser, form]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login?redirect=/profile");
    }
    resetForm();
  }, [currentUser, authLoading, router, resetForm]);

  const handleEditClick = () => {
    resetForm();
    setIsEditing(true);
  };

  if (authLoading) return <ProfileSkeleton />;
  if (!currentUser) return <div className="container mx-auto px-4 py-12 text-center">Redirecting to login...</div>;

  const onSubmit = async (data: ProfileFormData) => {
    const dataWithNulls = {
      username: data.username || undefined,
      dni: data.dni || undefined,
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      phoneNumber: data.phoneNumber || undefined,
      address: data.address || undefined,
    };
  
    const changes: Partial<User> = {};
  
    if (dataWithNulls.username !== currentUser?.username) changes.username = dataWithNulls.username;
    if (dataWithNulls.dni !== currentUser?.dni) changes.dni = dataWithNulls.dni;
    if (dataWithNulls.firstName !== currentUser?.firstName) changes.firstName = dataWithNulls.firstName;
    if (dataWithNulls.lastName !== currentUser?.lastName) changes.lastName = dataWithNulls.lastName;
    if (dataWithNulls.phoneNumber !== currentUser?.phoneNumber) changes.phoneNumber = dataWithNulls.phoneNumber;
    if (dataWithNulls.address !== currentUser?.address) changes.address = dataWithNulls.address;
  
    if (Object.keys(changes).length === 0) {
      toast({ title: "No Changes", description: "No information was modified." });
      setIsEditing(false);
      return;
    }
  
    try {
      await updateUser(changes);
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      const isUsernameError = typeof error?.message === "string" && error.message.toLowerCase().includes("username");
      const isDniError =
        typeof error?.message === "string" &&
        (error.message.toLowerCase().includes("dni") || error.message.toLowerCase().includes("duplicated"));
  
      toast({
        variant: "destructive",
        title: isUsernameError ? "Username duplicado" : isDniError ? "DNI duplicado" : "Update Failed",
        description: isUsernameError
          ? "El nombre de usuario ya está en uso por otro usuario. Por favor, ingresa otro."
          : isDniError
          ? "El DNI ya está en uso por otro usuario. Por favor, ingresa otro DNI."
          : "No se pudo actualizar el perfil. Inténtalo más tarde.",
      });
    }
  };
  
  

  // --- Photo Upload/Remove ---
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid File Type' });
      return;
    }
    const maxSize = 1 * 1024 * 1024; // 1MB limit
    if (file.size > maxSize) {
      toast({ variant: 'destructive', title: 'File Too Large', description: 'Image size max 1MB (demo).' });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        try {
          await updateUser({ photoUrl: base64Url });
          setIsUploading(false);
        } catch (updateError) {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not read file." });
        setIsUploading(false);
      };
    } catch (error) {
      console.error("Photo upload error:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not process photo." });
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = async () => {
    if (!currentUser || !currentUser.photoUrl) return;
    setIsUploading(true);
    try {
      await updateUser({ photoUrl: undefined });
    } catch (error) {
      console.error("Error removing photo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto shadow-lg border border-border bg-card text-card-foreground">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative group flex-shrink-0">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={currentUser.photoUrl || undefined} alt={currentUser.username} className="object-cover" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl">{getInitials(currentUser)}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => fileInputRef.current?.click()} aria-label="Change photo" disabled={isUploading}>
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </Button>
                {currentUser.photoUrl && (
                  <Button variant="ghost" size="icon" className="text-destructive-foreground/80 bg-destructive/70 hover:bg-destructive/90" onClick={removePhoto} aria-label="Remove photo" disabled={isUploading}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploading} />
          </div>
          <div className="flex-grow ">
            <CardTitle className="text-3xl font-bold">{ currentUser.username }</CardTitle>
            <CardDescription className="text-muted-foreground font-semibold">{currentUser.email}</CardDescription>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
              <Button
  variant="secondary"
  size="lg"
  className="
    mt-6
    flex items-center gap-3
    rounded-xl
    border border-gray-300
    bg-gradient-to-r from-gray-100 to-gray-200
    text-gray-800 font-semibold tracking-wide
    shadow-md shadow-gray-300
    transition
    duration-300
    ease-in-out
    transform
    hover:scale-105 hover:from-gray-200 hover:to-gray-300 hover:text-gray-900
    focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50
  "
  onClick={handleEditClick}
>
  <Edit className="h-5 w-5" />
  Edit Profile
</Button>




              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>Make changes. Click save.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                  <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">User name</FormLabel>
                        <FormControl className="col-span-3"><Input {...field} value={field.value ?? ""} placeholder="Username" /></FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dni" render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">DNI</FormLabel>
                        <FormControl className="col-span-3"><Input {...field} value={field.value ?? ""} placeholder="12345678" maxLength={8} /></FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">First Name</FormLabel>
                        <FormControl className="col-span-3">
                          <Input
                            {...field}
                            value={field.value ?? ""} // <-- Aquí reemplazamos null/undefined por ""
                            placeholder="John"
                          />
                          </FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Last Name</FormLabel>
                        <FormControl className="col-span-3"><Input {...field} value={field.value ?? ""} placeholder="Doe" /></FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Phone</FormLabel>
                        <FormControl className="col-span-3"><Input {...field} value={field.value ?? ""} placeholder="987654321" maxLength={9} /></FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Address</FormLabel>
                        <FormControl className="col-span-3"><Input {...field} value={field.value ?? ""} placeholder="123 Main St" /></FormControl>
                        <FormMessage className="col-span-4 text-right" />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 border-t">
          <ProfileDetail label="Username" value={currentUser.username} />
          <ProfileDetail label="Email Address" value={currentUser.email} />
          <ProfileDetail label="DNI" value={currentUser.dni} placeholder="Not set" />
          <ProfileDetail label="First Name" value={currentUser.firstName} placeholder="Not set" />
          <ProfileDetail label="Last Name" value={currentUser.lastName} placeholder="Not set" />
          <ProfileDetail label="Phone Number" value={currentUser.phoneNumber} placeholder="Not set" />
          <ProfileDetail label="Address" value={currentUser.address} placeholder="Not set" />
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground border-t pt-4">Note: Some information is required for checkout.</CardFooter>
      </Card>
    </div>
  );
}

interface ProfileDetailProps {
  label: string;
  value?: string | null;
  placeholder?: string;
}

function ProfileDetail({ label, value, placeholder = "N/A" }: ProfileDetailProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <p className="text-lg text-foreground">{value || <span className="text-muted-foreground/70 italic">{placeholder}</span>}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto shadow-lg border border-border bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
            <Skeleton className="h-9 w-32 mt-4 mx-auto sm:mx-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 border-t">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Skeleton className="h-4 w-1/2" />
        </CardFooter>
      </Card>
    </div>
  );
}
