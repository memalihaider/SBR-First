import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// ------------------ FIREBASE CONFIG ------------------
const firebaseConfig = {
  apiKey: "AIzaSyADtSpXwelVdMZaflDBv52pScOukROrXhQ",
  authDomain: "sbr360-a7562.firebaseapp.com",
  databaseURL: "https://sbr360-a7562-default-rtdb.firebaseio.com",
  projectId: "sbr360-a7562",
  storageBucket: "sbr360-a7562.firebasestorage.app",
  messagingSenderId: "494384072035",
  appId: "1:494384072035:web:346e4d1848476eedd43f56",
  measurementId: "G-L76N9BFDEM"
};

// Initialize Firebase
if (!getApps().length) initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore();

// Utilities to handle Firestore Timestamps <-> JS Dates
export function convertDatesToTimestamps(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val instanceof Date) out[key] = Timestamp.fromDate(val);
    else if (typeof val === 'object' && val !== null) out[key] = convertDatesToTimestamps(val);
    else out[key] = val;
  }
  return out;
}

export function convertTimestampsToDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val.toDate === 'function') out[key] = val.toDate();
    else if (typeof val === 'object' && val !== null) out[key] = convertTimestampsToDates(val);
    else out[key] = val;
  }
  return out;
}
