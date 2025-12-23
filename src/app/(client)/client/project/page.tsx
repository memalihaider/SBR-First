'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  DocumentData,
  getDoc,
  getDocs
} from 'firebase/firestore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Users, Clock, CheckCircle, AlertCircle, DollarSign, FileText, Link, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

// -------------------- Firebase Initialization --------------------
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

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

// Firestore collection ref
const projectsCollection = collection(db, 'projects');
const customersCollection = collection(db, 'customers');
const employeesCollection = collection(db, 'employeeList');
const departmentsCollection = collection(db, 'departments');

// -------------------- Utilities --------------------
function convertDateStringToTimestamp(dateStr: string | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Timestamp.fromDate(d);
}

function firestoreToClientProject(docData: DocumentData, id: string) {
  // Convert Firestore timestamps to JS Dates for UI compatibility
  const out: any = { id, ...docData };
  if (docData.startDate && typeof docData.startDate.toDate === 'function') out.startDate = docData.startDate.toDate();
  if (docData.endDate && typeof docData.endDate.toDate === 'function') out.endDate = docData.endDate.toDate();
  if (docData.actualStartDate && typeof docData.actualStartDate.toDate === 'function') out.actualStartDate = docData.actualStartDate.toDate();
  if (docData.actualEndDate && typeof docData.actualEndDate.toDate === 'function') out.actualEndDate = docData.actualEndDate.toDate();
  if (docData.createdAt && typeof docData.createdAt.toDate === 'function') out.createdAt = docData.createdAt.toDate();
  if (docData.updatedAt && typeof docData.updatedAt.toDate === 'function') out.updatedAt = docData.updatedAt.toDate();
  return out;
}

// -------------------- Firestore helpers --------------------
async function addProjectToFirestore(projectData: any) {
  const toSave: any = { ...projectData };
  // Convert date strings -> Timestamps
  if (typeof toSave.startDate === 'string') toSave.startDate = convertDateStringToTimestamp(toSave.startDate);
  if (typeof toSave.endDate === 'string') toSave.endDate = convertDateStringToTimestamp(toSave.endDate);
  if (toSave.actualStartDate && typeof toSave.actualStartDate === 'string') toSave.actualStartDate = convertDateStringToTimestamp(toSave.actualStartDate);
  if (toSave.actualEndDate && typeof toSave.actualEndDate === 'string') toSave.actualEndDate = convertDateStringToTimestamp(toSave.actualEndDate);

  toSave.budgetAmount = Number(toSave.budgetAmount) || 0;
  toSave.actualCost = Number(toSave.actualCost) || 0;
  toSave.completionPercentage = Number(toSave.completionPercentage) || 0;
  toSave.milestones = toSave.milestones || [];
  toSave.teamMembers = toSave.teamMembers || [];
  toSave.documents = toSave.documents || []; // NEW: Initialize documents array
  toSave.status = toSave.status || 'planning';
  toSave.createdAt = Timestamp.now();
  toSave.updatedAt = Timestamp.now();

  const docRef = await addDoc(projectsCollection, toSave);
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...(snap.data() || {}) };
}

async function updateProjectInFirestore(projectId: string, updateData: any) {
  const docRef = doc(db, 'projects', projectId);
  const toSave: any = { ...updateData };

  if (typeof toSave.startDate === 'string') toSave.startDate = convertDateStringToTimestamp(toSave.startDate);
  if (typeof toSave.endDate === 'string') toSave.endDate = convertDateStringToTimestamp(toSave.endDate);
  if (toSave.actualStartDate && typeof toSave.actualStartDate === 'string') toSave.actualStartDate = convertDateStringToTimestamp(toSave.actualStartDate);
  if (toSave.actualEndDate && typeof toSave.actualEndDate === 'string') toSave.actualEndDate = convertDateStringToTimestamp(toSave.actualEndDate);

  toSave.updatedAt = Timestamp.now();
  await updateDoc(docRef, toSave);
  const snap = await getDoc(docRef);
  return { id: snap.id, ...(snap.data() || {}) };
}

async function deleteProjectFromFirestore(projectId: string) {
  await deleteDoc(doc(db, 'projects', projectId));
}

function subscribeToProjects(onChange: (items: any[]) => void) {
  const q = query(projectsCollection, orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => firestoreToClientProject(d.data(), d.id));
    onChange(items);
  }, (err) => {
    console.error('projects onSnapshot error', err);
  });
  return unsub;
}

// -------------------- Page Component --------------------
export default function AdminProjectsPage() {
  // Projects state (real-time)
  const [projects, setProjects] = useState<any[]>([]);
  // Customers state for dropdown
  const [customers, setCustomers] = useState<any[]>([]);
  // Employees state for dropdown
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([]);
  // Managers state for dropdown
  const [managers, setManagers] = useState<{id: string, name: string}[]>([]);

  // dialogs & selection
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // form states for add project
  const [newProject, setNewProject] = useState<any>({
    name: '',
    description: '',
    type: 'installation',
    customerId: '',
    customerName: '',
    startDate: '',
    endDate: '',
    budgetAmount: '',
    projectManager: '',
    teamMembers: [] as string[],
    documentationLink: '', // NEW: Documentation link field
    actualCost: 0,
    completionPercentage: 0,
    milestones: [],
    documents: [] // NEW: Documents array
  });
  const [newTeamMember, setNewTeamMember] = useState('');

  // manage project states
  const [manageAction, setManageAction] = useState<'update_status' | 'add_milestone' | 'update_progress' | 'add_member' | 'add_document'>('update_status');
  const [statusUpdate, setStatusUpdate] = useState('planning');
  const [progressUpdate, setProgressUpdate] = useState('');
  const [milestoneData, setMilestoneData] = useState({
    name: '',
    description: '',
    dueDate: '',
    isCompleted: false
  });
  const [documentData, setDocumentData] = useState({ // NEW: Document data state
    name: '',
    link: '',
    type: 'documentation'
  });

  // edit project state
  const [editProject, setEditProject] = useState<any>(null);

  // NEW: Customer filter state
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("all");

  // Subscribe to projects collection on mount
  useEffect(() => {
    const unsub = subscribeToProjects((items) => {
      setProjects(items);
    });
    return () => unsub();
  }, []);

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersSnapshot = await getDocs(customersCollection);
        const customersData = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          companyName: doc.data().companyName,
          ...doc.data()
        }));
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch employees from employeeList collection
  const fetchEmployees = async () => {
    try {
      const employeesSnapshot = await getDocs(employeesCollection);
      const employeesData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch managers from departments collection (head field)
  const fetchManagers = async () => {
    try {
      const departmentsSnapshot = await getDocs(departmentsCollection);
      const managersData = departmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.head
        };
      }).filter(manager => manager.name);
      setManagers(managersData);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  // Add Employee Dialog open hone par employees aur managers fetch karo
  useEffect(() => {
    if (isAddDialogOpen || isManageDialogOpen || isEditDialogOpen) {
      fetchEmployees();
      fetchManagers();
    }
  }, [isAddDialogOpen, isManageDialogOpen, isEditDialogOpen]);

  // Derived stats
  const projectStats = [
    { title: 'Total Projects', value: projects.length.toString(), change: '+' + Math.floor(projects.length * 0.08), icon: Briefcase, color: 'blue' },
    { title: 'Active Projects', value: projects.filter(p => p.status === 'active').length.toString(), change: '+5', icon: Clock, color: 'green' },
    { title: 'Completed', value: projects.filter(p => p.status === 'completed').length.toString(), change: '+12', icon: CheckCircle, color: 'purple' },
   
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string }> = {
      planning: { variant: 'secondary', label: 'PLANNING' },
      active: { variant: 'default', label: 'ACTIVE' },
      on_hold: { variant: 'destructive', label: 'ON HOLD' },
      completed: { variant: 'default', label: 'COMPLETED' },
      cancelled: { variant: 'outline', label: 'CANCELLED' },
    };
    return statusMap[status] || statusMap.planning;
  };

  const getProjectTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      installation: 'Installation',
      maintenance: 'Maintenance',
      consulting: 'Consulting',
      supply_only: 'Supply Only',
      turnkey: 'Turnkey'
    };
    return typeMap[type] || type;
  };

  // Get customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.companyName : 'Unknown Customer';
  };

  // Filter projects based on selected customer filter
  const getFilteredProjects = () => {
    if (selectedCustomerFilter === "all") {
      return projects;
    }
    return projects.filter(project => project.customerId === selectedCustomerFilter);
  };

  const filteredProjects = getFilteredProjects();

  // -------------------- Handlers (Firestore-backed) --------------------
  const handleAddProject = async () => {
    try {
      // Validate minimal required fields
      if (!newProject.name || !newProject.customerId || !newProject.startDate || !newProject.endDate || !newProject.budgetAmount) {
        alert('Please fill required fields: Project Name, Customer ID, Start Date, End Date, Budget Amount.');
        return;
      }

      // Get customer name from selected customer ID
      const selectedCustomer = customers.find(c => c.id === newProject.customerId);
      const customerName = selectedCustomer ? selectedCustomer.companyName : 'Unknown Customer';

      const toCreate = {
        name: newProject.name,
        description: newProject.description || '',
        type: newProject.type || 'installation',
        customerId: newProject.customerId,
        customerName: customerName,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        budgetAmount: Number(newProject.budgetAmount) || 0,
        projectManager: newProject.projectManager || '',
        teamMembers: newProject.teamMembers || [],
        documentationLink: newProject.documentationLink || '', // NEW: Save documentation link
        status: 'planning',
        completionPercentage: 0,
        actualCost: Number(newProject.actualCost) || 0,
        profitMargin: Number(newProject.profitMargin) || 0,
        milestones: newProject.milestones || [],
        documents: newProject.documents || [], // NEW: Save documents array
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addProjectToFirestore(toCreate);

      // reset form & close dialog
      setIsAddDialogOpen(false);
      setNewProject({
        name: '',
        description: '',
        type: 'installation',
        customerId: '',
        customerName: '',
        startDate: '',
        endDate: '',
        budgetAmount: '',
        projectManager: '',
        teamMembers: [],
        documentationLink: '', // NEW: Reset documentation link
        actualCost: 0,
        completionPercentage: 0,
        milestones: [],
        documents: []
      });
      setNewTeamMember('');
    } catch (err) {
      console.error('Failed to add project', err);
      alert('Failed to add project. Check console for details.');
    }
  };

  const handleManageProject = async (project: any) => {
    if (!project?.id) return;
    try {
      // apply based on manageAction
      if (manageAction === 'update_status') {
        await updateProjectInFirestore(project.id, { status: statusUpdate });
      } else if (manageAction === 'update_progress') {
        const pct = Number(progressUpdate);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          alert('Enter a valid progress percentage (0-100).');
          return;
        }
        await updateProjectInFirestore(project.id, { completionPercentage: pct });
      } else if (manageAction === 'add_milestone') {
        const milestone = {
          name: milestoneData.name,
          description: milestoneData.description,
          dueDate: milestoneData.dueDate ? convertDateStringToTimestamp(milestoneData.dueDate) : null,
          isCompleted: !!milestoneData.isCompleted
        };
        // fetch current milestones then push new
        const pDoc = doc(db, 'projects', project.id);
        const snap = await getDoc(pDoc);
        const data = snap.exists() ? snap.data() : null;
        const currentMilestones = data?.milestones || [];
        await updateProjectInFirestore(project.id, { milestones: [...currentMilestones, milestone] });
      } else if (manageAction === 'add_member') {
        if (!newTeamMember || !newTeamMember.trim()) {
          alert('Enter a valid team member ID to add.');
          return;
        }
        const pDoc = doc(db, 'projects', project.id);
        const snap = await getDoc(pDoc);
        const data = snap.exists() ? snap.data() : null;
        const currentTeam = data?.teamMembers || [];
        await updateProjectInFirestore(project.id, { teamMembers: [...currentTeam, newTeamMember.trim()] });
      } else if (manageAction === 'add_document') { // NEW: Add document handler
        if (!documentData.name || !documentData.link) {
          alert('Please enter both document name and link.');
          return;
        }
        const document = {
          name: documentData.name,
          link: documentData.link,
          type: documentData.type,
          addedAt: Timestamp.now()
        };
        const pDoc = doc(db, 'projects', project.id);
        const snap = await getDoc(pDoc);
        const data = snap.exists() ? snap.data() : null;
        const currentDocuments = data?.documents || [];
        await updateProjectInFirestore(project.id, { documents: [...currentDocuments, document] });
      }

      // reset manage modal state
      setIsManageDialogOpen(false);
      setManageAction('update_status');
      setStatusUpdate('planning');
      setProgressUpdate('');
      setMilestoneData({ name: '', description: '', dueDate: '', isCompleted: false });
      setDocumentData({ name: '', link: '', type: 'documentation' }); // NEW: Reset document data
      setNewTeamMember('');
      setSelectedProject(null);
    } catch (err) {
      console.error('Manage project error', err);
      alert('Failed to apply changes. Check console for details.');
    }
  };

  const handleEditProject = async () => {
    if (!editProject?.id) return;
    try {
      await updateProjectInFirestore(editProject.id, editProject);
      setIsEditDialogOpen(false);
      setEditProject(null);
    } catch (err) {
      console.error('Edit project error', err);
      alert('Failed to update project. Check console for details.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await deleteProjectFromFirestore(projectId);
    } catch (err) {
      console.error('Delete project error', err);
      alert('Failed to delete project. Check console for details.');
    }
  };

  const handleDeleteDocument = async (projectId: string, docIndex: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const pDoc = doc(db, 'projects', projectId);
      const snap = await getDoc(pDoc);
      const data = snap.exists() ? snap.data() : null;
      const currentDocuments = data?.documents || [];
      const updatedDocuments = currentDocuments.filter((_: any, index: number) => index !== docIndex);
      await updateProjectInFirestore(projectId, { documents: updatedDocuments });
    } catch (err) {
      console.error('Delete document error', err);
      alert('Failed to delete document. Check console for details.');
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-purple-700 to-purple-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Projects</h1>
            <p className="text-red-100 mt-1 text-lg">Complete project portfolio management</p>
          </div>

          {/* New Project Dialog - UPDATED with Documentation Link */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
           

            <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto">
             
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline & Budget</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectName">Project Name *</Label>
                        <Input
                          id="projectName"
                          placeholder="Enter project name"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectType">Project Type *</Label>
                        <Select value={newProject.type} onValueChange={(value) => setNewProject({ ...newProject, type: value })}>
                          <SelectTrigger className="bg-white border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200">
                            <SelectItem value="installation">Installation</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="supply_only">Supply Only</SelectItem>
                            <SelectItem value="turnkey">Turnkey</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customerId">Customer Company Name *</Label>
                      <Select
                        value={newProject.customerId}
                        onValueChange={(value) => setNewProject({ ...newProject, customerId: value })}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter project description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="bg-white border-gray-300"
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newProject.startDate}
                          onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newProject.endDate}
                          onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                          className="bg-white border-gray-300"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="budgetAmount">Budget Amount *</Label>
                      <Input
                        id="budgetAmount"
                        type="number"
                        placeholder="Enter budget amount"
                        value={newProject.budgetAmount}
                        onChange={(e) => setNewProject({ ...newProject, budgetAmount: e.target.value })}
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="team" className="space-y-4">
                    <div>
                      <Label htmlFor="projectManager">Project Manager *</Label>
                      <Select 
                        value={newProject.projectManager} 
                        onValueChange={(value) => setNewProject({ ...newProject, projectManager: value })}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Select project manager" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.name}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Team Members</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={newTeamMember} 
                          onValueChange={(value) => setNewTeamMember(value)}
                        >
                          <SelectTrigger className="bg-white border-gray-300">
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200">
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.name}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (newTeamMember.trim()) {
                              setNewProject({
                                ...newProject,
                                teamMembers: [...(newProject.teamMembers || []), newTeamMember.trim()]
                              });
                              setNewTeamMember('');
                            }
                          }}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          Add
                        </Button>
                      </div>
                      {newProject.teamMembers && newProject.teamMembers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newProject.teamMembers.map((member: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {member}
                              <button
                                onClick={() => setNewProject({
                                  ...newProject,
                                  teamMembers: newProject.teamMembers.filter((_: any, i: number) => i !== index)
                                })}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* NEW: Documents Tab */}
                  <TabsContent value="documents" className="space-y-4">
                    <div>
                      <Label htmlFor="documentationLink">Project Documentation Link</Label>
                      <Input
                        id="documentationLink"
                        type="url"
                        placeholder="https://docs.google.com/document/..."
                        value={newProject.documentationLink}
                        onChange={(e) => setNewProject({ ...newProject, documentationLink: e.target.value })}
                        className="bg-white border-gray-300"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Add a link to project documentation, specifications, or requirements
                      </p>
                    </div>
                    {newProject.documentationLink && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Documentation Link Added</span>
                        </div>
                        <a 
                          href={newProject.documentationLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {newProject.documentationLink}
                        </a>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="bg-white border-gray-300 hover:bg-gray-50">
                    Cancel
                  </Button>
                  <Button onClick={handleAddProject} className="bg-red-600 hover:bg-red-700 text-white">
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* NEW: Customer Filter Dropdown - Added after header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <Label htmlFor="customer-filter" className="text-sm font-medium mb-2 block">
                Filter Projects by Customer
              </Label>
              <Select
                value={selectedCustomerFilter}
                onValueChange={setSelectedCustomerFilter}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomerFilter("all")}
                disabled={selectedCustomerFilter === "all"}
              >
                Clear Filter
              </Button>
             
            </div>
          </div>
          
          {selectedCustomerFilter !== "all" && (
            <div className="mt-3 text-sm text-gray-600">
              Showing projects for customer: <span className="font-semibold">
                {customers.find(c => c.id === selectedCustomerFilter)?.companyName}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                  <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{stat.change}</span>
                  <span className="text-gray-500"> this quarter</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Projects List - Use filteredProjects */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Project Portfolio</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            {filteredProjects.length} projects across all departments
            {selectedCustomerFilter !== "all" && ` (Filtered)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {filteredProjects.slice(0, 15).map((project: any) => {
              const statusBadge = getStatusBadge(project.status);
              return (
                <div
                  key={project.id}
                  className="p-5 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-all duration-200 hover:shadow-md bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{project.name}</h4>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        {project.completionPercentage >= 75 && (
                          <Badge variant="default" className="bg-red-600">On Track</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                      
                      {/* NEW: Documentation Link Display */}
                      {project.documentationLink && (
                        <div className="mb-3">
                          <a 
                            href={project.documentationLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Link className="h-3 w-3" />
                            <span>Project Documentation</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {project.customerName || getCustomerName(project.customerId) || project.customerId}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Project Manager</p>
                          <p className="text-sm font-semibold text-gray-700">{project.projectManager}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-sm font-semibold text-gray-700">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-sm font-semibold text-gray-700">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-gray-900">{project.completionPercentage}%</span>
                        </div>
                        <Progress value={project.completionPercentage} className="h-2" />
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      <p className="text-2xl font-bold text-red-600">${((Number(project.budgetAmount) || 0) / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500 mt-1">Budget</p>
                      <div className="flex items-center space-x-2 mt-3">
                        {/* View Dialog */}
                        <Dialog open={isViewDialogOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                          setIsViewDialogOpen(open);
                          if (!open) setSelectedProject(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsViewDialogOpen(true);
                              }}
                              className="bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-gray-900">Project Details - {project.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                  <TabsTrigger value="overview">Overview</TabsTrigger>
                                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                  <TabsTrigger value="team">Team</TabsTrigger>
                               
                                  <TabsTrigger value="documents">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Project Name</Label>
                                      <p className="text-sm text-gray-900">{project.name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Project Type</Label>
                                      <p className="text-sm text-gray-900">{getProjectTypeLabel(project.type)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Customer</Label>
                                      <p className="text-sm text-gray-900">
                                        {project.customerName || getCustomerName(project.customerId) || project.customerId}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                                    <p className="text-sm text-gray-900">{project.description}</p>
                                  </div>
                                  
                                  {/* NEW: Documentation Link in Overview */}
                                  {project.documentationLink && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Documentation</Label>
                                      <a 
                                        href={project.documentationLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                                      >
                                        <Link className="h-4 w-4" />
                                        <span>View Project Documentation</span>
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-3 gap-4">
                                    <Card className="bg-white border border-gray-200">
                                      <CardContent className="pt-4">
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-red-600">${((Number(project.budgetAmount) || 0) / 1000).toFixed(0)}K</div>
                                          <div className="text-sm text-gray-500">Budget</div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                   
                                  </div>
                                </TabsContent>

                                <TabsContent value="timeline" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                                      <p className="text-sm text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">End Date</Label>
                                      <p className="text-sm text-gray-900">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}</p>
                                    </div>
                                    
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Progress</Label>
                                    <div className="mt-2">
                                      <Progress value={project.completionPercentage} className="h-3" />
                                      <p className="text-sm text-gray-600 mt-1">{project.completionPercentage}% Complete</p>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="team" className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Project Manager</Label>
                                    <p className="text-sm text-gray-900">{project.projectManager}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Team Members</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {(project.teamMembers || []).map((member: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                          {member}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>

                                

                                {/* NEW: Documents Tab in View Dialog */}
                                <TabsContent value="documents" className="space-y-4">
                                  <div className="space-y-3">
                                    {/* Main Documentation Link */}
                                    {project.documentationLink && (
                                      <Card className="bg-white border border-blue-200">
                                        <CardContent className="pt-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                              <FileText className="h-5 w-5 text-blue-600" />
                                              <div>
                                                <h4 className="font-semibold text-gray-900">Project Documentation</h4>
                                                <p className="text-sm text-gray-600">Main project documentation and specifications</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <a 
                                                href={project.documentationLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                              >
                                                <span>Open</span>
                                                <ExternalLink className="h-3 w-3" />
                                              </a>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Additional Documents */}
                                    {(project.documents || []).map((doc: any, index: number) => (
                                      <Card key={index} className="bg-white border border-gray-200">
                                        <CardContent className="pt-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                              <FileText className="h-5 w-5 text-gray-600" />
                                              <div>
                                                <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                                                <p className="text-sm text-gray-600">{doc.type}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                  Added: {doc.addedAt ? new Date(doc.addedAt.toDate ? doc.addedAt.toDate() : doc.addedAt).toLocaleDateString() : '—'}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <a 
                                                href={doc.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                              >
                                                <span>Open</span>
                                                <ExternalLink className="h-3 w-3" />
                                              </a>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}

                                    {(project.documents || []).length === 0 && !project.documentationLink && (
                                      <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium">No documents found</p>
                                        <p className="text-sm">Add documents using the Manage button</p>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Edit Dialog */}
                        <Dialog open={isEditDialogOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setSelectedProject(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProject(project);
                                setEditProject({...project});
                                setIsEditDialogOpen(true);
                              }}
                              className="bg-white border-gray-300 hover:bg-green-50 hover:border-green-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Project - {project.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                  <TabsTrigger value="timeline">Timeline & Budget</TabsTrigger>
                                  <TabsTrigger value="team">Team</TabsTrigger>
                                  <TabsTrigger value="documents">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="editProjectName">Project Name *</Label>
                                      <Input
                                        id="editProjectName"
                                        value={editProject?.name || ''}
                                        onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                                        className="bg-white border-gray-300"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editProjectType">Project Type *</Label>
                                      <Select value={editProject?.type || 'installation'} onValueChange={(value) => setEditProject({ ...editProject, type: value })}>
                                        <SelectTrigger className="bg-white border-gray-300">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-gray-200">
                                          <SelectItem value="installation">Installation</SelectItem>
                                          <SelectItem value="maintenance">Maintenance</SelectItem>
                                          <SelectItem value="consulting">Consulting</SelectItem>
                                          <SelectItem value="supply_only">Supply Only</SelectItem>
                                          <SelectItem value="turnkey">Turnkey</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="editCustomerId">Customer Company Name *</Label>
                                    <Select
                                      value={editProject?.customerId || ''}
                                      onValueChange={(value) => setEditProject({ ...editProject, customerId: value })}
                                    >
                                      <SelectTrigger className="bg-white border-gray-300">
                                        <SelectValue placeholder="Select customer" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200">
                                        {customers.map((customer) => (
                                          <SelectItem key={customer.id} value={customer.id}>
                                            {customer.companyName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="editDescription">Description</Label>
                                    <Textarea
                                      id="editDescription"
                                      value={editProject?.description || ''}
                                      onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                                      className="bg-white border-gray-300"
                                      rows={3}
                                    />
                                  </div>
                                </TabsContent>

                                <TabsContent value="timeline" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="editStartDate">Start Date *</Label>
                                      <Input
                                        id="editStartDate"
                                        type="date"
                                        value={editProject?.startDate ? new Date(editProject.startDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setEditProject({ ...editProject, startDate: e.target.value })}
                                        className="bg-white border-gray-300"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editEndDate">End Date *</Label>
                                      <Input
                                        id="editEndDate"
                                        type="date"
                                        value={editProject?.endDate ? new Date(editProject.endDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setEditProject({ ...editProject, endDate: e.target.value })}
                                        className="bg-white border-gray-300"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="editBudgetAmount">Budget Amount *</Label>
                                    <Input
                                      id="editBudgetAmount"
                                      type="number"
                                      value={editProject?.budgetAmount || ''}
                                      onChange={(e) => setEditProject({ ...editProject, budgetAmount: e.target.value })}
                                      className="bg-white border-gray-300"
                                    />
                                  </div>
                                </TabsContent>

                                <TabsContent value="team" className="space-y-4">
                                  <div>
                                    <Label htmlFor="editProjectManager">Project Manager *</Label>
                                    <Select 
                                      value={editProject?.projectManager || ''} 
                                      onValueChange={(value) => setEditProject({ ...editProject, projectManager: value })}
                                    >
                                      <SelectTrigger className="bg-white border-gray-300">
                                        <SelectValue placeholder="Select project manager" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200">
                                        {managers.map((manager) => (
                                          <SelectItem key={manager.id} value={manager.name}>
                                            {manager.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Team Members</Label>
                                    <div className="flex gap-2">
                                      <Select 
                                        value={newTeamMember} 
                                        onValueChange={(value) => setNewTeamMember(value)}
                                      >
                                        <SelectTrigger className="bg-white border-gray-300">
                                          <SelectValue placeholder="Select team member" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-gray-200">
                                          {employees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.name}>
                                              {employee.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          if (newTeamMember.trim()) {
                                            setEditProject({
                                              ...editProject,
                                              teamMembers: [...(editProject.teamMembers || []), newTeamMember.trim()]
                                            });
                                            setNewTeamMember('');
                                          }
                                        }}
                                        className="bg-white border-gray-300 hover:bg-gray-50"
                                      >
                                        Add
                                      </Button>
                                    </div>
                                    {editProject?.teamMembers && editProject.teamMembers.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {editProject.teamMembers.map((member: string, index: number) => (
                                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                            {member}
                                            <button
                                              onClick={() => setEditProject({
                                                ...editProject,
                                                teamMembers: editProject.teamMembers.filter((_: any, i: number) => i !== index)
                                              })}
                                              className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                              ×
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-4">
                                  <div>
                                    <Label htmlFor="editDocumentationLink">Project Documentation Link</Label>
                                    <Input
                                      id="editDocumentationLink"
                                      type="url"
                                      placeholder="https://docs.google.com/document/..."
                                      value={editProject?.documentationLink || ''}
                                      onChange={(e) => setEditProject({ ...editProject, documentationLink: e.target.value })}
                                      className="bg-white border-gray-300"
                                    />
                                  </div>
                                  {editProject?.documentationLink && (
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="flex items-center space-x-2">
                                        <Link className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Documentation Link</span>
                                      </div>
                                      <a 
                                        href={editProject.documentationLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                                      >
                                        {editProject.documentationLink}
                                      </a>
                                    </div>
                                  )}
                                </TabsContent>
                              </Tabs>

                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-white border-gray-300 hover:bg-gray-50">
                                  Cancel
                                </Button>
                                <Button onClick={handleEditProject} className="bg-green-600 hover:bg-green-700 text-white">
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Manage Dialog - UPDATED with Documents Tab */}
                        <Dialog open={isManageDialogOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                          setIsManageDialogOpen(open);
                          if (!open) setSelectedProject(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsManageDialogOpen(true);
                              }}
                            >
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold text-gray-900">Manage Project - {project.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Tabs value={manageAction} onValueChange={(value) => setManageAction(value as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                  <TabsTrigger value="update_status">Status</TabsTrigger>
                                  <TabsTrigger value="update_progress">Progress</TabsTrigger>
                                 
                                  <TabsTrigger value="add_member">Team</TabsTrigger>
                                  <TabsTrigger value="add_document">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="update_status" className="space-y-4">
                                  <div>
                                    <Label htmlFor="status-select">Update Project Status</Label>
                                    <Select value={statusUpdate} onValueChange={(value) => setStatusUpdate(value)}>
                                      <SelectTrigger className="bg-white border-gray-300">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200">
                                        <SelectItem value="planning">Planning</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TabsContent>

                                <TabsContent value="update_progress" className="space-y-4">
                                  <div>
                                    <Label htmlFor="progress-input">Update Progress (%)</Label>
                                    <Input
                                      id="progress-input"
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="Enter progress percentage"
                                      value={progressUpdate}
                                      onChange={(e) => setProgressUpdate(e.target.value)}
                                      className="bg-white border-gray-300"
                                    />
                                  </div>
                                </TabsContent>

                                

                                <TabsContent value="add_member" className="space-y-4">
                                  <div>
                                    <Label htmlFor="team-member">Add Team Member</Label>
                                    <Select 
                                      value={newTeamMember} 
                                      onValueChange={(value) => setNewTeamMember(value)}
                                    >
                                      <SelectTrigger className="bg-white border-gray-300">
                                        <SelectValue placeholder="Select team member" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200">
                                        {employees.map((employee) => (
                                          <SelectItem key={employee.id} value={employee.name}>
                                            {employee.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TabsContent>

                                {/* NEW: Add Document Tab in Manage Dialog */}
                                <TabsContent value="add_document" className="space-y-4">
                                  <div>
                                    <Label htmlFor="document-name">Document Name</Label>
                                    <Input
                                      id="document-name"
                                      placeholder="Enter document name"
                                      value={documentData.name}
                                      onChange={(e) => setDocumentData({ ...documentData, name: e.target.value })}
                                      className="bg-white border-gray-300"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="document-link">Document Link</Label>
                                    <Input
                                      id="document-link"
                                      type="url"
                                      placeholder="https://docs.google.com/document/..."
                                      value={documentData.link}
                                      onChange={(e) => setDocumentData({ ...documentData, link: e.target.value })}
                                      className="bg-white border-gray-300"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="document-type">Document Type</Label>
                                    <Select 
                                      value={documentData.type} 
                                      onValueChange={(value) => setDocumentData({ ...documentData, type: value })}
                                    >
                                      <SelectTrigger className="bg-white border-gray-300">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200">
                                        <SelectItem value="documentation">Documentation</SelectItem>
                                        <SelectItem value="specification">Specification</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="report">Report</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => setIsManageDialogOpen(false)}
                                  className="bg-white border-gray-300 hover:bg-gray-50"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleManageProject(project)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Apply Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Delete button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          className="bg-white border-gray-300 hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}