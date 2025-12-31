// Firebase Authentication Service
// Handles all auth operations with proper error handling

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile, getUserProfile } from './database';
import { UserProfile } from '@/types';

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  try {
    console.log('Starting signup for:', email);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created in Firebase Auth:', credential.user.uid);
    
    // Update display name
    await updateProfile(credential.user, { displayName });
    console.log('Display name updated');
    
    // Create user profile in Firestore
    try {
      await createUserProfile(credential.user.uid, {
        email,
        displayName,
        createdAt: new Date(),
        settings: {
          fajrTime: '05:00',
          sleepTarget: '22:30',
          dailyCalorieTarget: 2000,
          dailyWaterTarget: 8,
          dailyStepsTarget: 10000,
          screenTimeLimit: 180, // minutes
          notificationsEnabled: true,
        },
        streak: {
          current: 0,
          longest: 0,
          lastSafeDate: null,
        },
        couplesCircle: null,
      });
      console.log('User profile created in Firestore');
    } catch (firestoreError: any) {
      console.error('Firestore error (non-fatal):', firestoreError);
      // Don't throw - user is created, Firestore profile can be created later
    }
    
    return credential;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, if not create it
    const profile = await getUserProfile(credential.user.uid);
    if (!profile) {
      await createUserProfile(credential.user.uid, {
        email: credential.user.email!,
        displayName: credential.user.displayName || 'User',
        createdAt: new Date(),
        settings: {
          fajrTime: '05:00',
          sleepTarget: '22:30',
          dailyCalorieTarget: 2000,
          dailyWaterTarget: 8,
          dailyStepsTarget: 10000,
          screenTimeLimit: 180,
          notificationsEnabled: true,
        },
        streak: {
          current: 0,
          longest: 0,
          lastSafeDate: null,
        },
        couplesCircle: null,
      });
    }
    
    return credential;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error('Failed to sign out. Please try again.');
  }
}

// Alias for signOut
export const signOutUser = signOut;

// Password reset
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

// Subscribe to auth state changes
export function subscribeToAuthChanges(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  console.error('Firebase Auth Error Code:', errorCode);
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please enable in Firebase Console.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-api-key':
      return 'Invalid API key. Please check Firebase configuration.';
    case 'auth/app-deleted':
      return 'Firebase app was deleted.';
    default:
      return `Authentication error: ${errorCode || 'Unknown error'}`;
  }
}
