'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLogging, setAutoLogging] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const autoLoginAttempted = useRef(false);

  // If already authenticated, go to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Auto-login as admin on first visit (unless user explicitly logged out)
  useEffect(() => {
    if (status !== 'unauthenticated' || autoLoginAttempted.current) return;
    const explicitLogout = sessionStorage.getItem('freight-crm-logout');
    if (explicitLogout) return; // User chose to log out — show login form
    autoLoginAttempted.current = true;
    setAutoLogging(true);
    signIn('credentials', {
      email: 'admin@demo.com',
      password: 'password123',
      redirect: false,
    }).then((res) => {
      if (res?.ok) {
        router.push('/dashboard');
      } else {
        setAutoLogging(false);
      }
    });
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Clear the logout flag since user is explicitly logging in
    sessionStorage.removeItem('freight-crm-logout');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }
  };

  if (autoLogging) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">FreightCRM</h1>
          <p className="text-muted-foreground">Signing in as admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">FreightCRM</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary underline">Register</Link>
            </p>
            <div className="text-xs text-center text-muted-foreground border-t pt-3 space-y-1">
              <p className="font-medium">Demo accounts:</p>
              <p>admin@demo.com · jake@demo.com · maria@demo.com</p>
              <p>Password: password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
