// Auth Provider Component - Handles auth state and initialization
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthProviderProps {
  children: ReactNode;
}

const publicPaths = ['/', '/login', '/signup', '/forgot-password'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Check if current path is public
  const isPublicPath = publicPaths.includes(pathname);
  
  // Simple auth state listener
  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthProvider: Auth state changed', firebaseUser?.uid || 'no user');
      setUser(firebaseUser);
      setIsReady(true);
    });
    
    // Fallback timeout - if auth takes too long, show the page anyway
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, showing page');
      setIsReady(true);
    }, 2000);
    
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);
  
  // Handle auth redirects
  useEffect(() => {
    if (!isReady) return;
    
    console.log('AuthProvider: Checking redirect', { user: !!user, pathname, isPublicPath });
    
    if (!user && !isPublicPath) {
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/signup')) {
      router.push('/dashboard');
    }
  }, [user, isReady, pathname, router, isPublicPath]);
  
  // For public pages, show content immediately (don't wait for auth)
  if (isPublicPath) {
    return <>{children}</>;
  }
  
  // For protected pages, show loading while checking auth
  if (!isReady) {
    return (
      <div className="min-h-screen bg-discipline-darker flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center mx-auto mb-4"
          >
            <Flame className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-discipline-muted">Loading...</p>
        </motion.div>
      </div>
    );
  }
  
  return <>{children}</>;
}
