// src/lib/project.ts
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
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ---------------- Firestore Collection Reference ---------------- */
const projectsCollection = collection(getFirestore(), "projects");

/* ---------------- Add Project ---------------- */
export async function addProjectToFirestore(projectData: Partial<any>) {
  const toSave = convertDatesToTimestamps(projectData);
  const docRef = await addDoc(projectsCollection, {
    ...toSave,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() } as any;
}

/* ---------------- Update Project ---------------- */
export async function updateProjectInFirestore(
  projectId: string,
  projectData: Partial<any>
) {
  const docRef = doc(db, "projects", projectId);
  const toSave = convertDatesToTimestamps(projectData);
  await setDoc(
    docRef,
    {
      ...toSave,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as any;
}

/* ---------------- Delete Project ---------------- */
export async function deleteProjectFromFirestore(projectId: string) {
  await deleteDoc(doc(db, "projects", projectId));
}

/* ---------------- Subscribe to Real-time Updates ---------------- */
export function subscribeToProjects(onChange: (items: any[]) => void) {
  const q = query(projectsCollection, orderBy("createdAt", "asc"));
  const unsub = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        ...convertTimestampsToDates(data),
      };
    });
    onChange(items);
  });
  return unsub;
}

/* ---------------- NEW: Get Projects by Customer ID ---------------- */
export function subscribeToProjectsByCustomer(customerId: string, onChange: (items: any[]) => void) {
  if (!customerId) {
    onChange([]);
    return () => {};
  }

  // Simple query without composite index - Client-side filtering
  const q = query(projectsCollection, orderBy("createdAt", "desc"));
  
  const unsub = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          ...convertTimestampsToDates(data),
        };
      })
      .filter(item => item.customerId === customerId); // Client-side filtering
    
    onChange(items);
  });
  return unsub;
}

/* ---------------- NEW: Get All Projects with Real-time Updates ---------------- */
export function subscribeToAllProjects(onChange: (items: any[]) => void) {
  const q = query(projectsCollection, orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        ...convertTimestampsToDates(data),
      };
    });
    onChange(items);
  });
  return unsub;
}

/* ---------------- NEW: Get Single Project ---------------- */
export async function getProjectFromFirestore(projectId: string) {
  const docRef = doc(db, "projects", projectId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data() as DocumentData;
    return {
      id: snap.id,
      ...convertTimestampsToDates(data),
    };
  }
  return null;
}

/* ---------------- Utility: Date ↔ Timestamp ---------------- */
function convertDatesToTimestamps(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val instanceof Date) out[key] = Timestamp.fromDate(val);
    else if (typeof val === "object" && val !== null)
      out[key] = convertDatesToTimestamps(val);
    else out[key] = val;
  }
  return out;
}

function convertTimestampsToDates(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val.toDate === "function") out[key] = val.toDate();
    else if (typeof val === "object" && val !== null)
      out[key] = convertTimestampsToDates(val);
    else out[key] = val;
  }
  return out;
}