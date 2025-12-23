import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, onSnapshot, getDocs, query } from 'firebase/firestore';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string; // ISO string
  status: 'pending' | 'in progress' | 'completed';
  estimatedHours?: number;
  actualHours?: number;
  completedPercentage: number;
  tags?: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// --- Subscribe to all tasks in real-time ---
export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const q = collection(db, 'tasks');
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Task),
    }));
    callback(tasks);
  });
};

// --- Fetch projects from Firebase ---
export const fetchProjects = async () => {
  const q = collection(db, 'projects');
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
  }));
};

// --- Create a new task ---
export const createTask = async (task: Task) => {
  const timestamp = new Date().toISOString();
  await addDoc(collection(db, 'tasks'), {
    ...task,
    status: task.status || 'pending',
    completedPercentage: task.completedPercentage || 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

// --- Update a task ---
export const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...updatedData,
    updatedAt: new Date().toISOString(),
  });
};
