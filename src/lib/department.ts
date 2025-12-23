// // lib/department.ts
// import {
//   collection,
//   doc,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   onSnapshot,
//   orderBy,
//   query,
//   getDoc,
//   serverTimestamp,
//   Firestore
// } from 'firebase/firestore';
// import { db } from './firebase'; // <-- your firebase config file (must export "db")

// /**
//  * Department type used in the UI. Keep id as string|number to remain compatible
//  * with the UI code that expects an "id" value for keys.
//  */
// export type Department = {
//   id: string | number;
//   name: string;
//   head: string;
//   employees: number;
//   budget: string;
//   growth: string; // keep the UI field (e.g. '+5%')
//   description: string;
//   createdAt?: any;
// };

// /**
//  * Subscribe to departments collection in real-time.
//  * onChange will be called with an array of Department objects every time data changes.
//  * Returns an unsubscribe function.
//  */
// export function subscribeDepartments(
//   onChange: (departments: Department[]) => void,
//   onError?: (err: any) => void
// ) {
//   try {
//     const col = collection(db, 'departments');
//     const q = query(col, orderBy('createdAt', 'asc'));
//     const unsub = onSnapshot(
//       q,
//       (snapshot) => {
//         const deps: Department[] = snapshot.docs.map((d) => {
//           const data = d.data() as any;
//           return {
//             id: d.id,
//             name: data.name ?? '',
//             head: data.head ?? '',
//             employees: Number(data.employees ?? 0),
//             budget: data.budget ?? '$0',
//             growth: data.growth ?? '+0%',
//             description: data.description ?? '',
//             createdAt: data.createdAt ?? null,
//           };
//         });
//         onChange(deps);
//       },
//       (error) => {
//         if (onError) onError(error);
//         console.error('subscribeDepartments error', error);
//       }
//     );
//     return unsub;
//   } catch (err) {
//     if (onError) onError(err);
//     throw err;
//   }
// }

// /**
//  * Add a new department document
//  */
// export async function addDepartment(payload: Omit<Department, 'id' | 'createdAt' | 'growth'> & { growth?: string }) {
//   const col = collection(db, 'departments');
//   const docRef = await addDoc(col, {
//     name: payload.name,
//     head: payload.head,
//     employees: Number(payload.employees ?? 0),
//     budget: payload.budget ?? '$0',
//     growth: payload.growth ?? '+0%',
//     description: payload.description ?? '',
//     createdAt: serverTimestamp(),
//   });
//   return docRef.id;
// }

// /**
//  * Update an existing department by id
//  */
// export async function updateDepartment(id: string, payload: Partial<Omit<Department, 'id'>>) {
//   const docRef = doc(db, 'departments', id);
//   await updateDoc(docRef, {
//     ...(payload.name !== undefined ? { name: payload.name } : {}),
//     ...(payload.head !== undefined ? { head: payload.head } : {}),
//     ...(payload.employees !== undefined ? { employees: Number(payload.employees) } : {}),
//     ...(payload.budget !== undefined ? { budget: payload.budget } : {}),
//     ...(payload.growth !== undefined ? { growth: payload.growth } : {}),
//     ...(payload.description !== undefined ? { description: payload.description } : {}),
//   });
// }

// /**
//  * Delete a department by id
//  */
// export async function deleteDepartment(id: string) {
//   const docRef = doc(db, 'departments', id);
//   await deleteDoc(docRef);
// }

// /**
//  * Optional: get single department (one-time)
//  */
// export async function getDepartment(id: string) {
//   const docRef = doc(db, 'departments', id);
//   const snap = await getDoc(docRef);
//   if (!snap.exists()) return null;
//   const data = snap.data() as any;
//   return {
//     id: snap.id,
//     name: data.name,
//     head: data.head,
//     employees: Number(data.employees ?? 0),
//     budget: data.budget ?? '$0',
//     growth: data.growth ?? '+0%',
//     description: data.description ?? '',
//     createdAt: data.createdAt ?? null,
//   } as Department;
// }



// new code
// lib/department.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  getDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { db } from './firebase'; // <-- your firebase config file (must export "db")

/**
 * Department type used in the UI. Keep id as string|number to remain compatible
 * with the UI code that expects an "id" value for keys.
 */
export type Department = {
  id: string | number;
  name: string;
  head: string;
  email?: string;
  phone?: string;
  employees: number;
  budget: string;
  growth: string; // keep the UI field (e.g. '+5%')
  description: string;
  createdAt?: any;
};

/**
 * Subscribe to departments collection in real-time.
 * onChange will be called with an array of Department objects every time data changes.
 * Returns an unsubscribe function.
 */
export function subscribeDepartments(
  onChange: (departments: Department[]) => void,
  onError?: (err: any) => void
) {
  try {
    const col = collection(db, 'departments');
    const q = query(col, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const deps: Department[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name ?? '',
            head: data.head ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            employees: Number(data.employees ?? 0),
            budget: data.budget ?? '$0',
            growth: data.growth ?? '+0%',
            description: data.description ?? '',
            createdAt: data.createdAt ?? null,
          };
        });
        onChange(deps);
      },
      (error) => {
        if (onError) onError(error);
        console.error('subscribeDepartments error', error);
      }
    );
    return unsub;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}

/**
 * Add a new department document
 */
export async function addDepartment(payload: Omit<Department, 'id' | 'createdAt' | 'growth'> & { growth?: string }) {
  const col = collection(db, 'departments');
  const docRef = await addDoc(col, {
    name: payload.name,
    head: payload.head,
    email: payload.email || '',
    phone: payload.phone || '',
    employees: Number(payload.employees ?? 0),
    budget: payload.budget ?? '$0',
    growth: payload.growth ?? '+0%',
    description: payload.description ?? '',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing department by id
 */
export async function updateDepartment(id: string, payload: Partial<Omit<Department, 'id'>>) {
  const docRef = doc(db, 'departments', id);
  await updateDoc(docRef, {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.head !== undefined ? { head: payload.head } : {}),
    ...(payload.email !== undefined ? { email: payload.email } : {}),
    ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
    ...(payload.employees !== undefined ? { employees: Number(payload.employees) } : {}),
    ...(payload.budget !== undefined ? { budget: payload.budget } : {}),
    ...(payload.growth !== undefined ? { growth: payload.growth } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
  });
}

/**
 * Delete a department by id
 */
export async function deleteDepartment(id: string) {
  const docRef = doc(db, 'departments', id);
  await deleteDoc(docRef);
}

/**
 * Optional: get single department (one-time)
 */
export async function getDepartment(id: string) {
  const docRef = doc(db, 'departments', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    id: snap.id,
    name: data.name,
    head: data.head,
    email: data.email || '',
    phone: data.phone || '',
    employees: Number(data.employees ?? 0),
    budget: data.budget ?? '$0',
    growth: data.growth ?? '+0%',
    description: data.description ?? '',
    createdAt: data.createdAt ?? null,
  } as Department;
}