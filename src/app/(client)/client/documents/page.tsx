'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FileText, Download, ExternalLink, Search, Filter, Calendar, User, Building, Link, Globe, File, AlertCircle } from 'lucide-react';

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

// Firestore collections
const projectsCollection = collection(db, 'projects');
const customersCollection = collection(db, 'customers');

// -------------------- Types --------------------
interface Document {
  id?: string;
  name: string;
  type: string;
  link: string;
  addedAt?: any;
}

interface Project {
  id: string;
  name: string;
  description: string;
  customerId: string;
  customerName: string;
  documentationLink: string;
  documents: Document[];
  status: string;
  createdAt: any;
  projectManager?: string;
}

interface Customer {
  id: string;
  companyName: string;
}

// -------------------- Page Component --------------------
export default function ClientDocumentsPage() {
  // States
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("all");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("all");

  // Fetch projects and customers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch projects with ordering
        const projectsQuery = query(projectsCollection, orderBy('createdAt', 'desc'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData: Project[] = [];
        
        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`Project ${doc.id}:`, {
            name: data.name,
            documentationLink: data.documentationLink,
            documentsCount: data.documents?.length || 0,
            documents: data.documents
          });
          
          projectsData.push({
            id: doc.id,
            name: data.name || 'Unnamed Project',
            description: data.description || '',
            customerId: data.customerId || '',
            customerName: data.customerName || 'Unknown Customer',
            documentationLink: data.documentationLink || '',
            documents: data.documents || [],
            status: data.status || 'planning',
            createdAt: data.createdAt || new Date(),
            projectManager: data.projectManager || 'Not Assigned'
          });
        });
        
        setProjects(projectsData);
        console.log('Total projects loaded:', projectsData.length);

        // Fetch customers
        const customersSnapshot = await getDocs(customersCollection);
        const customersData: Customer[] = [];
        
        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          customersData.push({
            id: doc.id,
            companyName: data.companyName || 'Unknown Company'
          });
        });
        
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all documents from all projects (ALL 3 TYPES OF LINKS INCLUDED)
  const getAllDocuments = (): Array<{
    id: string;
    name: string;
    type: string;
    link: string;
    addedAt: any;
    projectId: string;
    projectName: string;
    customerId: string;
    customerName: string;
    isMainDocumentation: boolean;
    projectManager?: string;
    description?: string;
    originalIndex?: number;
  }> => {
    const allDocuments: Array<{
      id: string;
      name: string;
      type: string;
      link: string;
      addedAt: any;
      projectId: string;
      projectName: string;
      customerId: string;
      customerName: string;
      isMainDocumentation: boolean;
      projectManager?: string;
      description?: string;
      originalIndex?: number;
    }> = [];

    projects.forEach((project) => {
      console.log(`Processing project "${project.name}":`, {
        mainLink: project.documentationLink,
        additionalLinks: project.documents?.length || 0
      });

      // ✅ 1. ADD MAIN DOCUMENTATION LINK (documentationLink field)
      if (project.documentationLink && project.documentationLink.trim() !== '') {
        allDocuments.push({
          id: `main-${project.id}`,
          name: `📋 ${project.name} - Main Documentation`,
          type: 'Main Documentation',
          link: project.documentationLink,
          addedAt: project.createdAt,
          projectId: project.id,
          projectName: project.name,
          customerId: project.customerId,
          customerName: project.customerName,
          isMainDocumentation: true,
          projectManager: project.projectManager,
          description: project.description
        });
        console.log(`Added main documentation: ${project.documentationLink}`);
      }

      // ✅ 2. ADD ADDITIONAL DOCUMENTS FROM DOCUMENTS ARRAY
      if (project.documents && Array.isArray(project.documents)) {
        console.log(`Project "${project.name}" has ${project.documents.length} additional documents:`, project.documents);
        
        project.documents.forEach((doc, index) => {
          // Check if doc has link property
          if (doc && typeof doc === 'object' && 'link' in doc) {
            const docLink = doc.link || '';
            const docName = doc.name || `Document ${index + 1}`;
            const docType = doc.type || 'Additional Document';
            
            if (docLink.trim() !== '') {
              allDocuments.push({
                id: `${project.id}-add-${index}`,
                name: `📄 ${docName}`,
                type: docType,
                link: docLink,
                addedAt: doc.addedAt || project.createdAt,
                projectId: project.id,
                projectName: project.name,
                customerId: project.customerId,
                customerName: project.customerName,
                isMainDocumentation: false,
                projectManager: project.projectManager,
                description: project.description,
                originalIndex: index
              });
              console.log(`Added additional document ${index + 1}: ${docLink}`);
            } else {
              console.log(`Skipped document ${index + 1}: Empty link`);
            }
          }
        });
      } else {
        console.log(`Project "${project.name}" has no documents array or it's empty`);
      }
    });

    console.log(`Total documents collected: ${allDocuments.length}`);
    return allDocuments;
  };

  // Get filtered documents
  const getFilteredDocuments = () => {
    let allDocuments = getAllDocuments();

    // Apply customer filter
    if (selectedCustomerFilter !== "all") {
      allDocuments = allDocuments.filter(doc => doc.customerId === selectedCustomerFilter);
    }

    // Apply project filter
    if (selectedProjectFilter !== "all") {
      allDocuments = allDocuments.filter(doc => doc.projectId === selectedProjectFilter);
    }

    // Apply document type filter
    if (selectedDocumentType !== "all") {
      allDocuments = allDocuments.filter(doc => 
        selectedDocumentType === "main" 
          ? doc.isMainDocumentation 
          : (!doc.isMainDocumentation && doc.type.toLowerCase().includes(selectedDocumentType.toLowerCase()))
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allDocuments = allDocuments.filter(doc =>
        doc.name.toLowerCase().includes(term) ||
        doc.projectName.toLowerCase().includes(term) ||
        doc.customerName.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term) ||
        (doc.description && doc.description.toLowerCase().includes(term)) ||
        doc.link.toLowerCase().includes(term)
      );
    }

    console.log(`Filtered documents: ${allDocuments.length}`);
    return allDocuments;
  };

  const filteredDocuments = getFilteredDocuments();
  
  // Get unique projects for the project filter dropdown (based on selected customer)
  const getFilteredProjects = () => {
    let filteredProjects = projects;
    
    if (selectedCustomerFilter !== "all") {
      filteredProjects = filteredProjects.filter(project => project.customerId === selectedCustomerFilter);
    }
    
    return filteredProjects;
  };

  const availableProjects = getFilteredProjects();

  // Get unique document types for filter
  const getDocumentTypes = () => {
    const allDocs = getAllDocuments();
    const types = new Set<string>();
    
    allDocs.forEach(doc => {
      if (doc.isMainDocumentation) {
        types.add('Main Documentation');
      } else {
        types.add(doc.type || 'Additional Document');
      }
    });
    
    return Array.from(types);
  };

  const documentTypes = getDocumentTypes();

  // Stats calculation
  const totalDocuments = getAllDocuments().length;
  const totalProjects = projects.length;
  const totalCustomers = customers.length;
  const mainDocumentationCount = getAllDocuments().filter(doc => doc.isMainDocumentation).length;
  const additionalDocumentsCount = getAllDocuments().filter(doc => !doc.isMainDocumentation).length;

  // Log detailed stats
  useEffect(() => {
    if (!loading && projects.length > 0) {
      console.log('📊 DOCUMENTS STATISTICS:');
      console.log(`Total Projects: ${totalProjects}`);
      console.log(`Total Documents: ${totalDocuments}`);
      console.log(`Main Documentation Links: ${mainDocumentationCount}`);
      console.log(`Additional Documents: ${additionalDocumentsCount}`);
      
      // Log all documents with details
      const allDocs = getAllDocuments();
      allDocs.forEach((doc, index) => {
        console.log(`Document ${index + 1}:`, {
          name: doc.name,
          type: doc.type,
          link: doc.link,
          project: doc.projectName,
          isMain: doc.isMainDocumentation
        });
      });
    }
  }, [loading, projects]);

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

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else if (date instanceof Date) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      // Add https:// if missing for validation
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch (error) {
      return false;
    }
  };

  const formatUrlForDisplay = (url: string) => {
    if (!url) return 'No link provided';
    if (url.length > 40) {
      return url.substring(0, 37) + '...';
    }
    return url;
  };

  const formatUrlForLink = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleOpenDocument = (link: string) => {
    if (isValidUrl(link)) {
      const formattedLink = formatUrlForLink(link);
      window.open(formattedLink, '_blank', 'noopener,noreferrer');
    } else {
      alert(`This URL appears to be invalid:\n\n${link}\n\nPlease check the document link.`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">All Project Documents</h1>
            <p className="text-red-100 mt-1 text-lg">
              Showing ALL document links including main documentation and additional documents
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Customer Filter Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="customer-filter" className="text-sm font-medium">Filter by Customer</Label>
              <Select
                value={selectedCustomerFilter}
                onValueChange={(value) => {
                  setSelectedCustomerFilter(value);
                  setSelectedProjectFilter("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
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

            {/* Project Filter Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="project-filter" className="text-sm font-medium">Filter by Project</Label>
              <Select
                value={selectedProjectFilter}
                onValueChange={setSelectedProjectFilter}
                disabled={availableProjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    availableProjects.length === 0 ? "No projects" : "Select project"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="document-type" className="text-sm font-medium">Document Type</Label>
              <Select
                value={selectedDocumentType}
                onValueChange={setSelectedDocumentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Document Types</SelectItem>
                  <SelectItem value="main">Main Documentation Only</SelectItem>
                  {documentTypes.filter(type => type !== 'Main Documentation').map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Box */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="search" className="text-sm font-medium">Search Documents</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, project, customer, type, or link..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCustomerFilter !== "all" || selectedProjectFilter !== "all" || selectedDocumentType !== "all" || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCustomerFilter !== "all" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Building className="h-3 w-3 mr-1" />
                  Customer: {customers.find(c => c.id === selectedCustomerFilter)?.companyName}
                </Badge>
              )}
              {selectedProjectFilter !== "all" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <FileText className="h-3 w-3 mr-1" />
                  Project: {projects.find(p => p.id === selectedProjectFilter)?.name}
                </Badge>
              )}
              {selectedDocumentType !== "all" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <File className="h-3 w-3 mr-1" />
                  Type: {selectedDocumentType === "main" ? "Main Documentation" : selectedDocumentType}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <Search className="h-3 w-3 mr-1" />
                  Search: "{searchTerm}"
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCustomerFilter("all");
                  setSelectedProjectFilter("all");
                  setSelectedDocumentType("all");
                  setSearchTerm("");
                }}
                className="ml-auto"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards - SHOWING ALL 3 TYPES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalDocuments}</div>
            <div className="text-sm text-gray-500 mt-1 space-y-1">
              <div className="flex justify-between">
                <span>Main:</span>
                <span className="font-semibold text-green-600">{mainDocumentationCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Additional:</span>
                <span className="font-semibold text-blue-600">{additionalDocumentsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalProjects}</div>
            <p className="text-sm text-gray-500 mt-1">With document links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalCustomers}</div>
            <p className="text-sm text-gray-500 mt-1">Document owners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Filtered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{filteredDocuments.length}</div>
            <p className="text-sm text-gray-500 mt-1">Currently showing</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List - SHOWING ALL LINKS */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">All Document Links</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {filteredDocuments.length} document links found ({totalDocuments} total)
                <span className="ml-2 text-sm">
                  ({mainDocumentationCount} main + {additionalDocumentsCount} additional)
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading all document links...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No document links found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCustomerFilter !== "all" || selectedProjectFilter !== "all"
                  ? "Try adjusting your filters or search term"
                  : "No document links have been added to projects yet"}
              </p>
              {(searchTerm || selectedCustomerFilter !== "all" || selectedProjectFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCustomerFilter("all");
                    setSelectedProjectFilter("all");
                    setSelectedDocumentType("all");
                    setSearchTerm("");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDocuments.map((document) => {
                const project = projects.find(p => p.id === document.projectId);
                const statusBadge = project ? getStatusBadge(project.status) : { variant: 'secondary', label: 'UNKNOWN' };
                const isValid = isValidUrl(document.link);

                return (
                  <div
                    key={document.id}
                    className="p-6 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Document Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${document.isMainDocumentation 
                          ? 'bg-gradient-to-br from-green-500 to-teal-600' 
                          : 'bg-gradient-to-br from-purple-500 to-blue-600'
                        } text-white`}>
                          {document.isMainDocumentation ? (
                            <Globe className="h-6 w-6" />
                          ) : (
                            <FileText className="h-6 w-6" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          {/* Document Header */}
                          <div className="flex items-center flex-wrap gap-2 mb-3">
                            <h4 className="font-bold text-gray-900 text-lg">{document.name}</h4>
                            {document.isMainDocumentation ? (
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                <Globe className="h-3 w-3 mr-1" />
                                Main Documentation
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="capitalize border-blue-200">
                                <File className="h-3 w-3 mr-1" />
                                {document.type}
                              </Badge>
                            )}
                            {project && (
                              <Badge variant={statusBadge.variant as any}>
                                {statusBadge.label}
                              </Badge>
                            )}
                            {!isValid && (
                              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Invalid URL
                              </Badge>
                            )}
                          </div>
                          
                          {/* Project and Customer Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <Building className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-semibold text-gray-700">Customer:</span>
                                <span className="ml-2 text-gray-600">{document.customerName}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-semibold text-gray-700">Project:</span>
                                <span className="ml-2 text-gray-600">{document.projectName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Project Description */}
                          {document.description && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {document.description}
                              </p>
                            </div>
                          )}

                          {/* ✅ DOCUMENT LINK SECTION - ALL LINKS SHOWN HERE */}
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Link className={`h-4 w-4 ${isValid ? 'text-blue-600' : 'text-red-600'}`} />
                              <span className="text-sm font-semibold text-gray-700">
                                {document.isMainDocumentation ? 'Main Documentation Link' : 'Document Link'}:
                              </span>
                            </div>
                            <div className={`flex items-center justify-between p-3 rounded-lg border ${isValid ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                              <div className="flex-1">
                                <a 
                                  href={formatUrlForLink(document.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-sm ${isValid ? 'text-blue-600 hover:text-blue-800 hover:underline' : 'text-red-600'}`}
                                  onClick={(e) => {
                                    if (!isValid) {
                                      e.preventDefault();
                                      alert(`This URL appears to be invalid:\n\n${document.link}\n\nPlease check the document link.`);
                                    }
                                  }}
                                >
                                  {formatUrlForDisplay(document.link)}
                                </a>
                                {!isValid && (
                                  <p className="text-xs text-red-500 mt-1">
                                    ⚠️ This link may be invalid or improperly formatted
                                  </p>
                                )}
                                {isValid && document.originalIndex !== undefined && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Additional document #{document.originalIndex + 1} from documents array
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(document.link)}
                                  className="h-8 px-2"
                                  title="Copy link to clipboard"
                                >
                                  <span className="text-xs">Copy</span>
                                </Button>
                              </div>
                            </div>
                            {document.isMainDocumentation && (
                              <p className="text-xs text-gray-500 mt-1">
                                🔗 This is the main documentation link from the project
                              </p>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Added: {formatDate(document.addedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>Manager: {document.projectManager || 'Not Assigned'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>ID: {document.id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="ml-4 flex flex-col items-end space-y-2">
                        <Button
                          size="sm"
                          className={`${document.isMainDocumentation 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                          } ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleOpenDocument(document.link)}
                          disabled={!isValid}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {document.isMainDocumentation ? 'Open Docs' : 'Open Link'}
                        </Button>
                        {!isValid && (
                          <p className="text-xs text-red-500 text-right max-w-[120px]">
                            Cannot open - invalid URL format
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Section */}
      {!loading && filteredDocuments.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📊 Documents by Type</h4>
                <div className="space-y-2">
                  {documentTypes.map((type) => {
                    const count = filteredDocuments.filter(d => 
                      type === 'Main Documentation' ? d.isMainDocumentation : d.type === type
                    ).length;
                    if (count === 0) return null;
                    
                    return (
                      <div key={type} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {type === 'Main Documentation' ? (
                            <Globe className="h-4 w-4 text-green-600" />
                          ) : (
                            <File className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-gray-700">{type}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📋 Documents by Project</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.from(new Set(filteredDocuments.map(d => d.projectName))).map((projectName) => {
                    const count = filteredDocuments.filter(d => d.projectName === projectName).length;
                    const project = projects.find(p => p.name === projectName);
                    
                    return (
                      <div key={projectName} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700 truncate">{projectName}</span>
                          {project && (
                            <Badge variant={getStatusBadge(project.status).variant as any} className="text-xs">
                              {getStatusBadge(project.status).label}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🏢 Documents by Customer</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.from(new Set(filteredDocuments.map(d => d.customerName))).map((customerName) => {
                    const count = filteredDocuments.filter(d => d.customerName === customerName).length;
                    
                    return (
                      <div key={customerName} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700 truncate">{customerName}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}