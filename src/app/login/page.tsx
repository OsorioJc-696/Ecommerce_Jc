'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // Added Loader2

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth(); // Get login function and loading state from context
  const { toast } = useToast(); // Get toast function directly if needed for local errors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic frontend validation (optional, as context/backend should handle it)
     if (!identifier || !password) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Please enter both username/email and password.",
        });
        return;
     }

    await login(identifier, password); // Call the login function from context
    // Error handling and redirection are managed within the login function
  };

  return (
    <div className="flex items-center justify-center py-12">
       <Card className="w-full max-w-md shadow-lg border border-border bg-card text-card-foreground">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your email or username to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="your@email.com or your_username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                 className="bg-transparent border-input text-foreground focus:ring-ring"
              />
            </div>
            <div className="space-y-2 relative">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password">Password</Label>
                 <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                 </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="******"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-transparent border-input text-foreground focus:ring-ring pr-10"
              />
               <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading} // Disable toggle when loading
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
             <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                 <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                 </>
              ) : "Login"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
            <div className="mt-2 text-center">
                <p>Don't have an account?</p>
                <Link href="/signup" className="text-primary hover:underline">
                   Sign up
                </Link>
            </div>
         </CardFooter>
      </Card>
    </div>
  );
}
