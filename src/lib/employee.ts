// lib/employee.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase'; // must export `db` (getFirestore(app))

/**
 * Employee type used by UI. id is string (Firestore doc id) but components
 * may accept numbers in older code — caller should convert as needed.
 */
export type Employee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  position?: string;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  joinDate: string; // ISO date string
  salary: number;
  address?: string;
  manager?: string;
  skills: string[];
  emergencyContact: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  createdAt?: any;
};

/**
 * Subscribe to employeeList collection in real-time.
 * onChange receives Employee[] whenever data changes.
 * Returns unsubscribe function.
 */
export function subscribeEmployees(
  onChange: (employees: Employee[]) => void,
  onError?: (err: any) => void
) {
  try {
    const col = collection(db, 'employeeList');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Employee[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            department: data.department ?? '',
            position: data.position ?? '',
            status: (data.status as Employee['status']) ?? 'active',
            joinDate: data.joinDate ?? new Date().toISOString().split('T')[0],
            salary: Number(data.salary ?? 0),
            address: data.address ?? '',
            manager: data.manager ?? '',
            skills: Array.isArray(data.skills) ? data.skills : [],
            emergencyContact: {
              name: data.emergencyContact?.name ?? '',
              relationship: data.emergencyContact?.relationship ?? '',
              phone: data.emergencyContact?.phone ?? '',
            },
            createdAt: data.createdAt ?? null,
          };
        });
        onChange(list);
      },
      (err) => {
        if (onError) onError(err);
        console.error('subscribeEmployees error', err);
      }
    );
    return unsub;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}

/**
 * Add a new employee to employeeList.
 * Returns new doc id.
 */
export async function addEmployee(payload: Omit<Employee, 'id' | 'createdAt' | 'joinDate'> & { joinDate?: string }) {
  const col = collection(db, 'employeeList');
  const docRef = await addDoc(col, {
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? '',
    department: payload.department ?? '',
    position: payload.position ?? '',
    status: payload.status ?? 'active',
    joinDate: payload.joinDate ?? new Date().toISOString().split('T')[0],
    salary: Number(payload.salary ?? 0),
    address: payload.address ?? '',
    manager: payload.manager ?? '',
    skills: payload.skills ?? [],
    emergencyContact: payload.emergencyContact ?? { name: '', relationship: '', phone: '' },
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing employee by doc id.
 */
export async function updateEmployee(id: string, payload: Partial<Omit<Employee, 'id' | 'createdAt'>>) {
  const docRef = doc(db, 'employeeList', id);
  const patch: any = {};
  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.email !== undefined) patch.email = payload.email;
  if (payload.phone !== undefined) patch.phone = payload.phone;
  if (payload.department !== undefined) patch.department = payload.department;
  if (payload.position !== undefined) patch.position = payload.position;
  if (payload.status !== undefined) patch.status = payload.status;
  if (payload.joinDate !== undefined) patch.joinDate = payload.joinDate;
  if (payload.salary !== undefined) patch.salary = Number(payload.salary);
  if (payload.address !== undefined) patch.address = payload.address;
  if (payload.manager !== undefined) patch.manager = payload.manager;
  if (payload.skills !== undefined) patch.skills = payload.skills;
  if (payload.emergencyContact !== undefined) patch.emergencyContact = payload.emergencyContact;
  await updateDoc(docRef, patch);
}

/**
 * Delete employee by id
 */
export async function deleteEmployee(id: string) {
  const docRef = doc(db, 'employeeList', id);
  await deleteDoc(docRef);
}

/**
 * Optional one-time read helper
 */
export async function getEmployee(id: string) {
  const docRef = doc(db, 'employeeList', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    id: snap.id,
    ...data,
  } as Employee;
}

/**
 * Subscribe to departments collection and return names in real-time.
 * onChange receives array of { id, name } objects.
 */
export function subscribeDepartmentNames(
  onChange: (departments: { id: string; name: string }[]) => void,
  onError?: (err: any) => void
) {
  try {
    const col = collection(db, 'departments');
    const q = query(col, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: (data.name ?? '').toString(),
          };
        });
        onChange(list);
      },
      (err) => {
        if (onError) onError(err);
        console.error('subscribeDepartmentNames error', err);
      }
    );
    return unsub;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}

