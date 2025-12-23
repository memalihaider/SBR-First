'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Phone, Mail, DollarSign, Filter, Download, Calendar, MapPin, Building, FileText, MessageSquare, Clock, Eye, Send, Target, User, CalendarDays, BarChart3, Wallet, Clock4, Users2, CheckCircle2, AlertCircle, PlayCircle, PauseCircle, ExternalLink, Link, Copy, Edit, Trash2, Save, X } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { subscribeToCustomers } from '@/lib/customer';
import { subscribeToProjectsByCustomer } from '@/lib/project';
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Safe currency formatter
const useSafeCurrency = () => {
  const { formatAmount } = useCurrency();
  
  const safeFormatAmount = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) {
      return formatAmount(0);
    }
    return formatAmount(amount);
  };
  
  return { formatAmount: safeFormatAmount };
};

// Function to fetch projects from Firebase projects collection
const fetchProjectsFromFirebase = async (customerId: string) => {
  try {
    const q = query(
      collection(db, 'projects'),
      where('customerId', '==', customerId)
    );
    const querySnapshot = await getDocs(q);
    const projects: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const projectData = doc.data();
      projects.push({
        id: doc.id,
        ...projectData
      });
    });
    
    return projects;
  } catch (error) {
    console.error('Error fetching projects from Firebase:', error);
    return [];
  }
};

// Function to fetch all projects for calculating total budget
const fetchAllProjectsForCustomer = async (customerId: string, customerName: string) => {
  try {
    // Try to fetch by customerId first
    const q1 = query(
      collection(db, 'projects'),
      where('customerId', '==', customerId)
    );
    
    // Also try to fetch by customerName as backup
    const q2 = query(
      collection(db, 'projects'),
      where('customerName', '==', customerName)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);

    const projects = new Map(); // Use Map to avoid duplicates

    // Add projects from customerId query
    snapshot1.forEach((doc) => {
      const projectData = doc.data();
      projects.set(doc.id, {
        id: doc.id,
        ...projectData
      });
    });

    // Add projects from customerName query
    snapshot2.forEach((doc) => {
      const projectData = doc.data();
      projects.set(doc.id, {
        id: doc.id,
        ...projectData
      });
    });

    return Array.from(projects.values());
  } catch (error) {
    console.error('Error fetching all projects for customer:', error);
    return [];
  }
};

// Function to fetch reminders from Firebase (without orderBy to avoid index error)
const fetchRemindersFromFirebase = async (customerId: string) => {
  try {
    const q = query(
      collection(db, 'reminders'),
      where('customerId', '==', customerId)
      // Removed orderBy to avoid index error temporarily
    );
    const querySnapshot = await getDocs(q);
    const reminders: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const reminderData = doc.data();
      reminders.push({
        id: doc.id,
        ...reminderData
      });
    });
    
    // Sort manually by createdAt date (newest first)
    return reminders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
};

// NEW FUNCTION: Fetch quotations from Firebase where customerName matches
const fetchQuotationsFromFirebase = async (customerName: string) => {
  try {
    const q = query(
      collection(db, 'quotations'),
      where('customerName', '==', customerName)
    );
    const querySnapshot = await getDocs(q);
    const quotations: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const quotationData = doc.data();
      quotations.push({
        id: doc.id,
        ...quotationData
      });
    });
    
    // Sort by creation date (newest first)
    return quotations.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return [];
  }
};

// Individual Reminder Item Component with Edit/Delete
function ReminderItem({ reminder, onUpdate, onDelete }: { reminder: any; onUpdate: (id: string, updates: any) => void; onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(reminder.message);
  const [editedPriority, setEditedPriority] = useState(reminder.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!editedMessage.trim()) {
      alert('Message cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(reminder.id, {
        message: editedMessage,
        priority: editedPriority,
        updatedAt: serverTimestamp()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Error updating reminder');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(reminder.id);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Error deleting reminder');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditedMessage(reminder.message);
    setEditedPriority(reminder.priority);
    setIsEditing(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className={`h-5 w-5 ${getPriorityColor(reminder.priority)}`} />
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">Reminder Message</h4>
                  {!isEditing && (
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityVariant(reminder.priority)}>
                        {reminder.priority}
                      </Badge>
                      <Badge variant={reminder.status === 'pending' ? 'outline' : 'default'}>
                        {reminder.status}
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(reminder.createdAt)} • 
                  Company: {reminder.companyName}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3 mt-3">
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter reminder message..."
                />
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Priority:</label>
                  <select 
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-2">
                  {reminder.message}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Customer: {reminder.customerName}</span>
                  <span>Email: {reminder.email}</span>
                  <span>Phone: {reminder.phone}</span>
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="flex flex-col items-end space-y-2 ml-4">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                  title="Edit reminder"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete reminder"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge variant={getPriorityVariant(reminder.priority)}>
                  {reminder.priority}
                </Badge>
                <Badge variant={reminder.status === 'pending' ? 'outline' : 'default'}>
                  {reminder.status}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerProfileDialog({ lead, isOpen, onClose }: { lead: any; isOpen: boolean; onClose: () => void }) {
  const { formatAmount } = useSafeCurrency();
  const [customerProjects, setCustomerProjects] = useState<any[]>([]);
  const [firebaseProjects, setFirebaseProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [savingReminder, setSavingReminder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [firebaseReminders, setFirebaseReminders] = useState<any[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  // NEW STATE: For quotations
  const [firebaseQuotations, setFirebaseQuotations] = useState<any[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  
  // NEW STATE: For project filter in projects tab
  const [selectedProject, setSelectedProject] = useState<string>('all');
  // NEW STATE: For project filter in documents tab
  const [selectedDocumentProject, setSelectedDocumentProject] = useState<string>('all');

  useEffect(() => {
    if (lead?.id && isOpen) {
      // Fetch from existing project subscription
      const unsubscribe = subscribeToProjectsByCustomer(lead.id, (projects) => {
        setCustomerProjects(projects);
      });

      // Fetch from Firebase projects collection
      const fetchFirebaseProjects = async () => {
        setLoading(true);
        try {
          const projects = await fetchProjectsFromFirebase(lead.id);
          setFirebaseProjects(projects);
        } catch (error) {
          console.error('Error loading firebase projects:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchFirebaseProjects();

      // Fetch reminders from Firebase
      const fetchReminders = async () => {
        setLoadingReminders(true);
        try {
          const reminders = await fetchRemindersFromFirebase(lead.id);
          setFirebaseReminders(reminders);
        } catch (error) {
          console.error('Error fetching reminders:', error);
        } finally {
          setLoadingReminders(false);
        }
      };

      fetchReminders();

      // NEW: Fetch quotations from Firebase where customerName matches
      const fetchQuotations = async () => {
        setLoadingQuotations(true);
        try {
          const customerName = lead.primaryContact?.name;
          if (customerName) {
            const quotations = await fetchQuotationsFromFirebase(customerName);
            setFirebaseQuotations(quotations);
          }
        } catch (error) {
          console.error('Error fetching quotations:', error);
        } finally {
          setLoadingQuotations(false);
        }
      };

      fetchQuotations();

      // Set up real-time listener for new reminders (without orderBy to avoid index error)
      const remindersRef = collection(db, 'reminders');
      const unsubscribeReminders = onSnapshot(remindersRef, (snapshot) => {
        const updatedReminders: any[] = [];
        snapshot.forEach((doc) => {
          const reminderData = doc.data();
          if (reminderData.customerId === lead.id) {
            updatedReminders.push({
              id: doc.id,
              ...reminderData
            });
          }
        });
        
        // Sort manually
        const sortedReminders = updatedReminders.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setFirebaseReminders(sortedReminders);
      });

      // NEW: Set up real-time listener for quotations
      const quotationsRef = collection(db, 'quotations');
      const unsubscribeQuotations = onSnapshot(quotationsRef, (snapshot) => {
        const updatedQuotations: any[] = [];
        const customerName = lead.primaryContact?.name;
        
        snapshot.forEach((doc) => {
          const quotationData = doc.data();
          if (quotationData.customerName === customerName) {
            updatedQuotations.push({
              id: doc.id,
              ...quotationData
            });
          }
        });
        
        // Sort by creation date (newest first)
        const sortedQuotations = updatedQuotations.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setFirebaseQuotations(sortedQuotations);
      });

      return () => {
        unsubscribe();
        unsubscribeReminders();
        unsubscribeQuotations();
      };
    }
  }, [lead?.id, lead?.primaryContact?.name, isOpen]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string }> = {
      new: { variant: 'destructive', label: 'NEW' },
      contacted: { variant: 'secondary', label: 'CONTACTED' },
      qualified: { variant: 'default', label: 'QUALIFIED' },
      proposal: { variant: 'default', label: 'PROPOSAL' },
      negotiation: { variant: 'default', label: 'NEGOTIATION' },
      won: { variant: 'default', label: 'WON' },
      lost: { variant: 'outline', label: 'LOST' },
    };
    return statusMap[status] || statusMap.new;
  };

  // Save reminder aur automatically copy to clipboard - NEW FUNCTION
  const saveReminderAndCopy = async () => {
    if (!reminderMessage.trim()) {
      alert('Please enter a reminder message');
      return;
    }

    setSavingReminder(true);
    try {
      // 1. Pehle reminder save karen Firebase mein
      await addDoc(collection(db, 'reminders'), {
        customerId: lead.id,
        customerName: lead.primaryContact?.name,
        companyName: lead.companyName,
        message: reminderMessage,
        email: lead.primaryContact?.email,
        phone: lead.primaryContact?.phone,
        status: 'pending',
        priority: 'medium',
        type: 'manual',
        createdAt: serverTimestamp(),
        createdBy: 'admin'
      });

      // 2. Phir automatically copy karen clipboard par
      await navigator.clipboard.writeText(reminderMessage);
      
      // 3. Success message show karen
      alert('Reminder saved successfully and message copied to clipboard! ✅\n\nAb aap email ya WhatsApp par click kar ke directly message paste kar sakte hain.');
      
      // Message clear nahi karenge taki user dekh sake

    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Error saving reminder. Please try again.');
    } finally {
      setSavingReminder(false);
    }
  };

  // Update reminder function
  const updateReminder = async (reminderId: string, updates: any) => {
    try {
      const reminderRef = doc(db, 'reminders', reminderId);
      await updateDoc(reminderRef, updates);
      alert('Reminder updated successfully!');
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  };

  // Delete reminder function
  const deleteReminder = async (reminderId: string) => {
    try {
      const reminderRef = doc(db, 'reminders', reminderId);
      await deleteDoc(reminderRef);
      alert('Reminder deleted successfully!');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  };

  // Copy reminder message to clipboard (separate function for manual copy)
  const copyToClipboard = async () => {
    if (!reminderMessage.trim()) {
      alert('Please enter a reminder message first');
      return;
    }

    try {
      await navigator.clipboard.writeText(reminderMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      alert('Message copied to clipboard! ✅');
    } catch (error) {
      console.error('Failed to copy text: ', error);
      alert('Failed to copy message to clipboard');
    }
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // NEW: Get status badge for quotation
  const getQuotationStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string }> = {
      draft: { variant: 'outline', label: 'DRAFT' },
      sent: { variant: 'secondary', label: 'SENT' },
      approved: { variant: 'default', label: 'APPROVED' },
      rejected: { variant: 'destructive', label: 'REJECTED' },
    };
    return statusMap[status] || statusMap.draft;
  };

  // NEW: Filter projects based on selected project
  const filteredProjects = selectedProject === 'all' 
    ? customerProjects 
    : customerProjects.filter(project => project.id === selectedProject);

  // NEW: Filter documents based on selected project
  const filteredDocumentProjects = selectedDocumentProject === 'all'
    ? firebaseProjects
    : firebaseProjects.filter(project => project.id === selectedDocumentProject);

  // Other data
  const customerQuotations = lead.quotations || [];
  const customerInvoices = lead.invoices || [];
  const customerMessages = lead.messages || [];
  const customerDocuments = lead.documents || [];
  const customerReminders = lead.reminders || [];

  // Calculate project statistics
  const totalProjectValue = customerProjects.reduce((sum, project) => sum + (project.budgetAmount || 0), 0);
  const activeProjects = customerProjects.filter(project => project.status === 'active').length;
  const completedProjects = customerProjects.filter(project => project.status === 'completed').length;

  // Calculate total documents count from firebase projects - ONLY DOCUMENTS ARRAY COUNT
  const totalFirebaseDocuments = firebaseProjects.reduce((sum, project) => {
    return sum + (project.documents?.length || 0);
  }, 0);

  // Total reminders count (existing + new from Firebase)
  const totalRemindersCount = customerReminders.length + firebaseReminders.length;

  // NEW: Total quotations count (existing + new from Firebase)
  const totalQuotationsCount = customerQuotations.length + firebaseQuotations.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">
                {lead.primaryContact?.name?.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{lead.primaryContact?.name}</h1>
              <p className="text-gray-600">{lead.companyName}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete 360° customer profile with all interactions, projects, and documents
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects ({customerProjects.length})</TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({totalFirebaseDocuments})
              {loading && <span className="ml-1">🔄</span>}
            </TabsTrigger>
            <TabsTrigger value="communications">Communications ({customerMessages.length + firebaseReminders.length})</TabsTrigger>
            <TabsTrigger value="financial">Financial ({totalQuotationsCount + customerInvoices.length})</TabsTrigger>
            <TabsTrigger value="reminders">Reminders ({totalRemindersCount})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{lead.primaryContact?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{lead.primaryContact?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium">{lead.companyName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">
                          {lead.address?.street ? `${lead.address.street}, ${lead.address.city}, ${lead.address.state}, ${lead.address.country}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lead Status</span>
                      <Badge variant={getStatusBadge(lead.status).variant}>
                        {getStatusBadge(lead.status).label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Total Project Value</span>
                      <span className="font-bold text-green-600">{formatAmount(totalProjectValue)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Active Projects</span>
                      <span className="font-medium text-blue-600">{activeProjects}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Project Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{customerProjects.length}</div>
                      <div className="text-sm text-gray-600">Total Projects</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{activeProjects}</div>
                      <div className="text-sm text-gray-600">Active Projects</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{completedProjects}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{formatAmount(totalProjectValue)}</div>
                      <div className="text-sm text-gray-600">Total Value</div>
                    </div>
                  </div>
                  
                  {/* Additional Project Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Project Budget:</span>
                        <span className="font-medium">
                          {formatAmount(customerProjects.length > 0 ? totalProjectValue / customerProjects.length : 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Rate:</span>
                        <span className="font-medium">
                          {customerProjects.length > 0 ? Math.round((completedProjects / customerProjects.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects Summary */}
            {customerProjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Recent Projects</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customerProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {project.completionPercentage || 0}% Complete
                            </span>
                            <span className="text-xs text-gray-500">
                              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatAmount(project.budgetAmount || 0)}</p>
                          <p className="text-xs text-gray-500">Budget</p>
                        </div>
                      </div>
                    ))}
                    {customerProjects.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm" onClick={() => (document.querySelector('[data-value="projects"]') as HTMLElement)?.click()}>
                          View All {customerProjects.length} Projects
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Projects Tab - UPDATED WITH FILTER */}
          <TabsContent value="projects" className="space-y-4">
            {/* Project Filter Dropdown */}
            {customerProjects.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Projects ({filteredProjects.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Projects ({customerProjects.length})</option>
                    {customerProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                          <Badge variant={project.status === 'completed' ? 'default' : project.status === 'active' ? 'secondary' : 'outline'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Manager: {project.projectManager}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{project.completionPercentage || 0}% Complete</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {' '}
                              {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users2 className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{project.teamMembers?.length || 0} Members</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-green-600">{formatAmount(project.budgetAmount || 0)}</p>
                        <p className="text-xs text-gray-500 mb-2">Budget</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${project.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No projects found for this customer</p>
                <p className="text-sm">Projects will appear here when created for this customer</p>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab - UPDATED WITH FILTER */}
          <TabsContent value="documents" className="space-y-6">
            {/* Document Project Filter Dropdown */}
            {firebaseProjects.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Documents ({filteredDocumentProjects.reduce((sum, project) => sum + (project.documents?.length || 0), 0)})
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select 
                    value={selectedDocumentProject}
                    onChange={(e) => setSelectedDocumentProject(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Projects ({firebaseProjects.length})</option>
                    {firebaseProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name || 'Unnamed Project'} ({project.documents?.length || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading documents...</p>
              </div>
            ) : filteredDocumentProjects.length > 0 ? (
              <div className="space-y-6">
                {filteredDocumentProjects.map((project) => (
                  <Card key={project.id} className="border-2 border-gray-200">
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{project.name || 'Unnamed Project'}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {project.type || 'No Type'}
                          </Badge>
                          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                            {project.status || 'No Status'}
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {project.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      {/* Project Documentation Link - MAIN PROJECT LEVEL LINK */}
                      {project.documentationLink && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Link className="h-6 w-6 text-blue-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">Project Documentation</h4>
                                <p className="text-sm text-gray-600 mt-1">Main project documentation link</p>
                                <p className="text-xs text-blue-500 mt-1 break-all">{project.documentationLink}</p>
                              </div>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                              <a href={project.documentationLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open Documentation
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Individual Documents from documents array */}
                      {project.documents && project.documents.length > 0 ? (
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-900 text-lg mb-3 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-green-600" />
                            Project Files ({project.documents.length})
                          </h5>
                          {project.documents.map((doc: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center space-x-4 flex-1">
                                <FileText className="h-8 w-8 text-green-500" />
                                <div className="flex-1">
                                  <h6 className="font-semibold text-gray-900">{doc.name || 'Unnamed Document'}</h6>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center">
                                      <Badge variant="outline" className="text-xs mr-2">
                                        {doc.type || 'Unknown'}
                                      </Badge>
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Added: {doc.addedAt ? new Date(doc.addedAt).toLocaleDateString() : 'Unknown date'}
                                    </span>
                                    {doc.link && (
                                      <span className="flex items-center">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        <span className="text-blue-500 break-all text-xs">{doc.link}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {doc.link && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={doc.link} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      Open
                                    </a>
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        !project.documentationLink && (
                          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="font-medium">No documents available</p>
                            <p className="text-sm">No documentation links or files added to this project yet</p>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">Projects and documents will appear here when created for this customer</p>
              </div>
            )}
          </TabsContent>

          {/* Communications Tab - UPDATED WITH FIREBASE REMINDERS */}
          <TabsContent value="communications" className="space-y-4">
            {loadingReminders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading messages...</p>
              </div>
            ) : customerMessages.length > 0 || firebaseReminders.length > 0 ? (
              <div className="space-y-4">
                {/* Firebase Reminders Messages */}
                {firebaseReminders.map((reminder) => (
                  <Card key={reminder.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            <div>
                              <h4 className="font-medium text-gray-900">Reminder Message</h4>
                              <p className="text-sm text-gray-500">
                                From: {reminder.createdBy} • 
                                {formatDate(reminder.createdAt)} • 
                                Company: {reminder.companyName}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 bg-blue-50 p-3 rounded-lg mt-2">
                            {reminder.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Customer: {reminder.customerName}</span>
                            <span>Email: {reminder.email}</span>
                            <span>Phone: {reminder.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant={reminder.priority === 'high' ? 'destructive' : reminder.priority === 'medium' ? 'secondary' : 'outline'}>
                            {reminder.priority}
                          </Badge>
                          <Badge variant={reminder.status === 'pending' ? 'outline' : 'default'}>
                            {reminder.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Original Customer Messages */}
                {customerMessages.map((message: any) => (
                  <Card key={message.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {message.type === 'email' ? <Mail className="h-5 w-5 text-blue-500" /> : <MessageSquare className="h-5 w-5 text-green-500" />}
                          <div>
                            <h4 className="font-medium text-gray-900">{message.subject}</h4>
                            <p className="text-sm text-gray-500">From: {message.from} • {message.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={message.status === 'unread' ? 'destructive' : 'secondary'} className="text-xs">{message.status}</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No communications found</p>
                <p className="text-sm">Messages will appear here when you communicate with this customer</p>
              </div>
            )}
          </TabsContent>

          {/* Financial Tab - UPDATED WITH QUOTATIONS */}
          <TabsContent value="financial" className="space-y-6">
            {/* NEW: Quotations Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Quotations ({totalQuotationsCount})
                {loadingQuotations && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
              </h3>
              
              {loadingQuotations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading quotations...</p>
                </div>
              ) : totalQuotationsCount > 0 ? (
                <div className="space-y-4">
                  {/* Firebase Quotations */}
                  {firebaseQuotations.map((quotation) => {
                    const statusBadge = getQuotationStatusBadge(quotation.status);
                    return (
                      <Card key={quotation.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <FileText className="h-5 w-5 text-green-500" />
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg">{quotation.quotationNumber}</h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <Badge variant={statusBadge.variant}>
                                      {statusBadge.label}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      Created: {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'Unknown date'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Valid Until: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Customer: {quotation.customerName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Building className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Company: {quotation.customerCompany}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Email: {quotation.customerEmail}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Phone: {quotation.customerPhone}</span>
                                </div>
                              </div>

                              {/* Items Summary */}
                              {quotation.items && quotation.items.length > 0 && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <h5 className="font-medium text-gray-900 mb-2">Items ({quotation.items.length})</h5>
                                  <div className="space-y-1">
                                    {quotation.items.slice(0, 3).map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.productName}</span>
                                        <span className="font-medium">{formatAmount(item.amount)}</span>
                                      </div>
                                    ))}
                                    {quotation.items.length > 3 && (
                                      <div className="text-center text-xs text-gray-500 mt-1">
                                        +{quotation.items.length - 3} more items
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              <p className="text-2xl font-bold text-green-600">{formatAmount(quotation.totalAmount || 0)}</p>
                              <p className="text-xs text-gray-500 mb-2">Total Amount</p>
                              <div className="space-y-2">
                                {/* <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3 mr-1" />
                                  PDF
                                </Button> */}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Original Customer Quotations */}
                  {customerQuotations.map((quote: any) => (
                    <Card key={quote.id}>
                      <CardContent className="p-4 flex justify-between">
                        <div>
                          <h4 className="font-medium">{quote.quotationNumber}</h4>
                          <p className="text-sm text-gray-500">Status: {quote.status}</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">{formatAmount(quote.totalAmount)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No quotations found</p>
                  <p className="text-sm">Quotations will appear here when created for this customer</p>
                </div>
              )}
            </div>

            
          </TabsContent>

          {/* Reminders Tab - UPDATED WITH EDIT/DELETE OPTIONS */}
          <TabsContent value="reminders" className="space-y-6">
            {/* New Reminder Message Box */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <MessageSquare className="h-5 w-5" />
                  <span>Create New Reminder</span>
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Enter your message for the client. This will be saved to reminders collection and automatically copied to clipboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      {lead.primaryContact?.email ? (
                        <a 
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.primaryContact.email}&su=Reminder Message&body=${encodeURIComponent(reminderMessage || 'Your reminder message will appear here after saving')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => {
                            if (!reminderMessage.trim()) {
                              e.preventDefault();
                              alert('⚠️ Pehle "Save Reminder & Copy" button par click karen tak message copy ho jaye aur yahan automatically paste ho jaye.');
                            }
                          }}
                        >
                          {lead.primaryContact.email}
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone / WhatsApp</p>
                      {lead.primaryContact?.phone ? (
                        <a 
                          href={`https://wa.me/${lead.primaryContact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(reminderMessage || 'Your reminder message will appear here after saving')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-green-600 hover:text-green-800 hover:underline"
                          onClick={(e) => {
                            if (!reminderMessage.trim()) {
                              e.preventDefault();
                              alert('⚠️ Pehle "Save Reminder & Copy" button par click karen tak message copy ho jaye aur yahan automatically paste ho jaye.');
                            }
                          }}
                        >
                          {lead.primaryContact.phone} 📱
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Editable Message Box */}
                <div className="space-y-2">
                  <label htmlFor="reminderMessage" className="text-sm font-medium text-gray-700">
                    Enter your message to client:
                  </label>
                  <textarea
                    id="reminderMessage"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Type your reminder message here..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button 
                    onClick={copyToClipboard}
                    disabled={!reminderMessage.trim()}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </Button>

                  <Button 
                    onClick={saveReminderAndCopy}
                    disabled={savingReminder || !reminderMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {savingReminder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Save Reminder & Copy 📋
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Reminders List - COMBINED (ORIGINAL + FIREBASE) */}
            {loadingReminders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading reminders...</p>
              </div>
            ) : totalRemindersCount > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">All Reminders ({totalRemindersCount})</h3>
                
                {/* Firebase Reminders with Edit/Delete */}
                {firebaseReminders.map((reminder) => (
                  <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    onUpdate={updateReminder}
                    onDelete={deleteReminder}
                  />
                ))}

                {/* Original Customer Reminders */}
                {customerReminders.map((reminder: any) => (
                  <Card key={reminder.id}>
                    <CardContent className="p-4 flex justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className={`h-5 w-5 ${reminder.priority === 'high' ? 'text-red-500' : reminder.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                          <p className="text-sm text-gray-500">{reminder.date} • {reminder.type}</p>
                        </div>
                      </div>
                      <Badge variant={reminder.priority === 'high' ? 'destructive' : reminder.priority === 'medium' ? 'secondary' : 'outline'}>
                        {reminder.priority}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No reminders found</p>
                <p className="text-sm">Create your first reminder using the form above</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSalesLeadsPage() {
  const { formatAmount } = useSafeCurrency();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [customerProjects, setCustomerProjects] = useState<Map<string, any[]>>(new Map());

  useEffect(() => {
    const unsubscribe = subscribeToCustomers((items) => setLeads(items));
    return () => unsubscribe();
  }, []);

  // Fetch projects for each lead to calculate total budget
  useEffect(() => {
    const fetchProjectsForLeads = async () => {
      const projectsMap = new Map();
      
      for (const lead of leads) {
        try {
          const projects = await fetchAllProjectsForCustomer(lead.id, lead.primaryContact?.name);
          projectsMap.set(lead.id, projects);
        } catch (error) {
          console.error(`Error fetching projects for lead ${lead.id}:`, error);
          projectsMap.set(lead.id, []);
        }
      }
      
      setCustomerProjects(projectsMap);
    };

    if (leads.length > 0) {
      fetchProjectsForLeads();
    }
  }, [leads]);

  // Calculate total projects value for a lead
  const getTotalProjectsValue = (leadId: string) => {
    const projects = customerProjects.get(leadId) || [];
    return projects.reduce((sum, project) => sum + (project.budgetAmount || 0), 0);
  };

  // Calculate total active projects for a lead
  const getActiveProjectsCount = (leadId: string) => {
    const projects = customerProjects.get(leadId) || [];
    return projects.filter(project => project.status === 'active').length;
  };

  // Calculate total projects count for a lead
  const getTotalProjectsCount = (leadId: string) => {
    const projects = customerProjects.get(leadId) || [];
    return projects.length;
  };

  // Calculate overall stats
  const totalLeads = leads.length;
  const totalProjectsValue = Array.from(customerProjects.values()).reduce((total, projects) => {
    return total + projects.reduce((sum, project) => sum + (project.budgetAmount || 0), 0);
  }, 0);
  const totalActiveProjects = Array.from(customerProjects.values()).reduce((total, projects) => {
    return total + projects.filter(project => project.status === 'active').length;
  }, 0);
  const totalProjectsCount = Array.from(customerProjects.values()).reduce((total, projects) => {
    return total + projects.length;
  }, 0);

  const leadStats = [
    { 
      title: 'Total Leads', 
      value: totalLeads.toString(), 
      change: '+' + Math.floor(totalLeads * 0.08), 
      icon: Users, 
      color: 'blue' 
    },
    { 
      title: 'Active Projects', 
      value: totalActiveProjects.toString(), 
      change: '+' + Math.floor(totalActiveProjects * 0.12), 
      icon: TrendingUp, 
      color: 'green' 
    },
    { 
      title: 'Total Projects', 
      value: totalProjectsCount.toString(), 
      change: '+' + Math.floor(totalProjectsCount * 0.15), 
      icon: DollarSign, 
      color: 'purple' 
    },
    { 
      title: 'Total Revenue', 
      value: formatAmount(totalProjectsValue), 
      change: '+' + Math.floor((totalProjectsValue / Math.max(totalLeads, 1)) * 0.1) + '%', 
      icon: DollarSign, 
      color: 'orange' 
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string }> = {
      new: { variant: 'destructive', label: 'NEW' },
      contacted: { variant: 'secondary', label: 'CONTACTED' },
      qualified: { variant: 'default', label: 'QUALIFIED' },
      proposal: { variant: 'default', label: 'PROPOSAL' },
      negotiation: { variant: 'default', label: 'NEGOTIATION' },
      won: { variant: 'default', label: 'WON' },
      lost: { variant: 'outline', label: 'LOST' },
    };
    return statusMap[status] || statusMap.new;
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Sales Leads</h1>
            <p className="text-red-100 mt-1 text-lg">Complete overview of all leads across sales team</p>
          </div>
          <div className="flex items-center space-x-3">
            
          </div>
        </div>
      </div>

      {/* Stats - UPDATED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {leadStats.map((stat, index) => {
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
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                  <span className="text-gray-500"> this month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leads List - UPDATED WITH PROJECTS BUDGET */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">All Leads ({leads.length})</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Complete list of leads from all sales representatives
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {leads.map((lead: any) => {
              const statusBadge = getStatusBadge(lead.status);
              const totalProjectsValue = getTotalProjectsValue(lead.id);
              const activeProjectsCount = getActiveProjectsCount(lead.id);
              const totalProjectsCount = getTotalProjectsCount(lead.id);
              
              return (
                <div key={lead.id} className="p-5 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-all duration-200 hover:shadow-md bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{lead.primaryContact?.name}</h4>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">{lead.companyName}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{lead.primaryContact?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{lead.primaryContact?.phone}</span>
                        </div>
                      </div>
                      
                      {/* Projects Summary */}
                      {totalProjectsCount > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{totalProjectsCount}</div>
                              <div className="text-gray-500">Total Projects</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{activeProjectsCount}</div>
                              <div className="text-gray-500">Active</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-purple-600">{formatAmount(totalProjectsValue)}</div>
                              <div className="text-gray-500">Total Budget</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-6 text-right">
                      <p className="text-2xl font-bold text-green-600">{formatAmount(totalProjectsValue)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {totalProjectsCount > 0 ? `${totalProjectsCount} Projects` : 'No Projects'}
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsProfileOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Customer Profile Dialog */}
      {selectedLead && (
        <CustomerProfileDialog
          lead={selectedLead}
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
}