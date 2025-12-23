'use client';

import { create } from 'zustand';

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  projectName: string;
  size: string;
  uploadedBy: string;
  uploadedDate: Date;
  lastModified: Date;
  fileType: 'pdf' | 'doc' | 'xls' | 'img' | 'zip' | 'other';
  description?: string;
  url?: string; // For URL-based documents
  shared?: boolean;
}

interface DocumentsStore {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'uploadedDate' | 'lastModified'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocumentById: (id: string) => Document | undefined;
}

// Generate initial mock data
const generateMockDocuments = (): Document[] => {
  const categories = ['Contracts', 'Proposals', 'Reports', 'Deliverables', 'Technical Docs', 'Invoices'];
  const fileTypes: ('pdf' | 'doc' | 'xls' | 'img' | 'zip')[] = ['pdf', 'doc', 'xls', 'img', 'zip'];
  const projectNames = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'];

  return Array.from({ length: 20 }, (_, i) => {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const projectName = projectNames[Math.floor(Math.random() * projectNames.length)];

    return {
      id: `DOC-${i + 1}`,
      name: `${category} Document ${i + 1}`,
      type: fileType.toUpperCase(),
      category,
      projectName,
      size: `${Math.floor(Math.random() * 5000) + 100} KB`,
      uploadedBy: 'Project Team',
      uploadedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      fileType,
      description: `Important ${category.toLowerCase()} document for ${projectName}`,
      shared: Math.random() > 0.5,
    };
  });
};

const useDocumentsStore = create<DocumentsStore>((set, get) => ({
  documents: generateMockDocuments(),

  addDocument: (document) => {
    const newDocument: Document = {
      ...document,
      id: `DOC-${Date.now()}`,
      uploadedDate: new Date(),
      lastModified: new Date(),
    };
    set((state) => ({
      documents: [...state.documents, newDocument],
    }));
  },

  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id
          ? { ...doc, ...updates, lastModified: new Date() }
          : doc
      ),
    }));
  },

  deleteDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },

  getDocumentById: (id) => {
    return get().documents.find((doc) => doc.id === id);
  },
}));

export default useDocumentsStore;