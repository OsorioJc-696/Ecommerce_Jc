'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
// Import the Server Action from the separate file
import { handleSignupAction } from './actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Import form components
import { useForm } from "react-hook-form"; // Import useForm
import { zodResolver } from '@hookform/resolvers/zod'; // Import resolver
import { z } from 'zod'; // Import zod

// Define Zod schema for client-side validation (matches server-side)
const formSchema = z.object({
  username: z.string().min(1, "Username is required").trim(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

type SignupFormData = z.infer<typeof formSchema>;


export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Initialize react-hook-form
  const form = useForm<SignupFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
      },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    // Create FormData object from react-hook-form data
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);

    // Call the Server Action
    const result = await handleSignupAction(formData);

    if (result.success) {
      toast({
        title: "Signup Successful",
        description: result.message,
      });
      router.push('/login'); // Redirect to login page
    } else {
      // Display general error message
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: result.message,
      });
       // Set field-specific errors from the server action response
       if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
             if (errors && errors.length > 0) {
                form.setError(field as keyof SignupFormData, {
                   type: "server",
                   message: errors.join(", "),
                });
             }
          });
       }
       setIsLoading(false); // Only set loading false on failure
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg border border-border bg-card text-card-foreground">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Use react-hook-form */}
           <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="YourUsername" {...field} disabled={isLoading} className="bg-input text-foreground border-border focus:ring-ring"/></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} disabled={isLoading} className="bg-input text-foreground border-border focus:ring-ring"/></FormControl><FormMessage /></FormItem>
                  )}/>
                 <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem className="relative"><FormLabel>Password (min. 6 characters)</FormLabel><FormControl><Input type={showPassword ? "text" : "password"} placeholder="******" {...field} disabled={isLoading} className="bg-input text-foreground border-border focus:ring-ring pr-10"/></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} disabled={isLoading}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><FormMessage /></FormItem>
                 )}/>
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                     <FormItem className="relative"><FormLabel>Confirm Password</FormLabel><FormControl><Input type={showConfirmPassword ? "text" : "password"} placeholder="******" {...field} disabled={isLoading} className="bg-input text-foreground border-border focus:ring-ring pr-10"/></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} disabled={isLoading}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><FormMessage /></FormItem>
                  )}/>

                 <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account... </> ) : "Sign Up"}
                </Button>
              </form>
           </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
           <p>Already have an account?</p>
           <Link href="/login" className="text-primary hover:underline">
              Log in
           </Link>
        </CardFooter>
      </Card>
    </div>
  );
}