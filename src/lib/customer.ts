// src/lib/customer.ts
import { db, convertDatesToTimestamps, convertTimestampsToDates } from './firebase';
import { collection, addDoc, setDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc } from 'firebase/firestore';
import { Timestamp, DocumentData } from 'firebase/firestore';

const customersCollection = collection(db, 'customers');

export async function addCustomerToFirestore(customerData: Partial<any>) {
  const toSave = convertDatesToTimestamps(customerData);
  const docRef = await addDoc(customersCollection, {
    ...toSave,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...docSnap.data() } as any;
}

export async function updateCustomerInFirestore(customerId: string, customerData: Partial<any>) {
  const docRef = doc(db, 'customers', customerId);
  const toSave = convertDatesToTimestamps(customerData);
  await setDoc(docRef, {
    ...toSave,
    updatedAt: Timestamp.now()
  }, { merge: true });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as any;
}

export async function deleteCustomerFromFirestore(customerId: string) {
  await deleteDoc(doc(db, 'customers', customerId));
}

export function subscribeToCustomers(onChange: (items: any[]) => void) {
  const q = query(customersCollection, orderBy('createdAt', 'asc'));
  const unsub = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      return { id: doc.id, ...convertTimestampsToDates(data) };
    });
    onChange(items);
  });
  return unsub;
}
