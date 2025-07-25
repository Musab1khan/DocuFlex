
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/dms/logo';
import { DmsProvider, useDms } from '@/context/dms-context';


function LoginComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const { users, setCurrentUser } = useDms();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would have more robust authentication
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === email.toLowerCase());

    if (user && user.password === password) {
      setCurrentUser(user);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      router.push('/dashboard');
    } else if (email === 'administrator' && password === 'password') { // Legacy fallback
       const adminUser = users.find(u => u.name === 'administrator');
        if (adminUser) {
            setCurrentUser(adminUser);
            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            router.push('/dashboard');
        }
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username or password.',
      });
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <Logo className="mx-auto" />
                <h1 className="text-3xl font-bold">Login</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your username or email below to login.
                </p>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Username or Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="administrator"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Created by Ibni Wali
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="abstract background"
        />
      </div>
    </div>
  );
}


export default function LoginPage() {
    return (
        <DmsProvider>
            <LoginComponent />
        </DmsProvider>
    )
}
