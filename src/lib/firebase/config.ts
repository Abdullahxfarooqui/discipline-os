// Firebase Configuration
// Discipline OS - Personal Operating System for Daily Compliance

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB7Bk-2xWEnXu8Euv61_rprxaKDxN0jmu4",
  authDomain: "habit-tracker-d4566.firebaseapp.com",
  databaseURL: "https://habit-tracker-d4566-default-rtdb.firebaseio.com",
  projectId: "habit-tracker-d4566",
  storageBucket: "habit-tracker-d4566.firebasestorage.app",
  messagingSenderId: "180964824804",
  appId: "1:180964824804:web:cb2a8bf00c69b58fcc7ef1",
  measurementId: "G-1JGRCP8VHS"
};

// Initialize Firebase (singleton pattern for SSR compatibility)
let app: FirebaseApp;
let auth: Auth;
let rtdb: Database;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
rtdb = getDatabase(app);

export { app, auth, rtdb };
export default app;
