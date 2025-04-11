import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // ✅ Realtime DB
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAn3ELCy3TbrL3YnUNy9C-uIiQjZglzXaU",
  authDomain: "studybuddy-3a68b.firebaseapp.com",
  databaseURL: "https://studybuddy-3a68b-default-rtdb.firebaseio.com",
  projectId: "studybuddy-3a68b",
  storageBucket: "studybuddy-3a68b.firebasestorage.app",
  messagingSenderId: "706764807092",
  appId: "1:706764807092:web:b7082643fcea614ff5b0e1",
  measurementId: "G-VX7EXZFR36"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // ✅ Now it's realtime DB
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
