"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Upload, Search, Filter, Calendar, User, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

import AddDocumentUrlDialog from '@/components/add-document-url-dialog';
import DocumentDetailsDialog from '@/components/document-details-dialog';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';

export default function EmployeeDocumentsPage() {
  const documentStats = [
    {
      title: 'Total Documents',
      value: '47',
      change: '+5',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Shared with Me',
      value: '23',
      change: '+3',
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Recent Uploads',
      value: '12',
      change: '+4',
      icon: Upload,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Storage Used',
      value: '2.4 GB',
      change: '+0.8 GB',
      icon: Paperclip,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const [recentDocuments, setRecentDocuments] = useState([
    {
      id: 1,
      name: 'Employee Handbook 2024.pdf',
      url: 'https://example.com/employee-handbook-2024.pdf',
      type: 'HR Document',
      size: '2.4 MB',
      uploadedBy: 'HR Department',
      uploadedDate: '2024-12-01',
      shared: true,
      category: 'Policies',
    },
    {
      id: 2,
      name: 'Q4 Performance Review.pdf',
      url: 'https://example.com/q4-performance-review.pdf',
      type: 'Performance',
      size: '1.2 MB',
      uploadedBy: 'Manager',
      uploadedDate: '2024-11-28',
      shared: true,
      category: 'Reviews',
    },
    {
      id: 3,
      name: 'Project Proposal - Mobile App.docx',
      url: 'https://example.com/project-proposal-mobile.docx',
      type: 'Project Document',
      size: '856 KB',
      uploadedBy: 'Project Lead',
      uploadedDate: '2024-11-25',
      shared: false,
      category: 'Projects',
    },
    {
      id: 4,
      name: 'Training Certificate - Leadership.pdf',
      url: 'https://example.com/training-certificate.pdf',
      type: 'Certificate',
      size: '1.8 MB',
      uploadedBy: 'Training Department',
      uploadedDate: '2024-11-20',
      shared: true,
      category: 'Training',
    },
  ]);

  const [documentCategories, setDocumentCategories] = useState([
    {
      name: 'HR Documents',
      count: 15,
      icon: User,
      color: 'bg-blue-500',
      description: 'Policies, handbooks, and HR forms',
    },
    {
      name: 'Project Files',
      count: 12,
      icon: FileText,
      color: 'bg-green-500',
      description: 'Project documentation and deliverables',
    },
    {
      name: 'Training Materials',
      count: 8,
      icon: Paperclip,
      color: 'bg-purple-500',
      description: 'Certificates, courses, and training docs',
    },
    {
      name: 'Personal Files',
      count: 6,
      icon: Upload,
      color: 'bg-yellow-500',
      description: 'Your personal documents and uploads',
    },
  ]);

  const [sharedDocuments, setSharedDocuments] = useState([
    {
      id: 1,
      name: 'Company Benefits Guide.pdf',
      url: 'https://example.com/company-benefits.pdf',
      sharedBy: 'HR Department',
      sharedDate: '2024-11-15',
      access: 'View Only',
      expires: '2025-11-15',
    },
    {
      id: 2,
      name: 'IT Security Policy.pdf',
      url: 'https://example.com/it-security.pdf',
      sharedBy: 'IT Department',
      sharedDate: '2024-11-10',
      access: 'View Only',
      expires: '2025-11-10',
    },
    {
      id: 3,
      name: 'Team Meeting Notes.docx',
      url: 'https://example.com/team-meeting-notes.docx',
      sharedBy: 'Project Manager',
      sharedDate: '2024-11-08',
      access: 'Edit',
      expires: 'Never',
    },
  ]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'HR Document':
        return <Badge className="bg-blue-100 text-blue-800">HR</Badge>;
      case 'Performance':
        return <Badge className="bg-green-100 text-green-800">Performance</Badge>;
      case 'Project Document':
        return <Badge className="bg-purple-100 text-purple-800">Project</Badge>;
      case 'Certificate':
        return <Badge className="bg-yellow-100 text-yellow-800">Certificate</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getAccessBadge = (access: string) => {
    switch (access) {
      case 'View Only':
        return <Badge className="bg-gray-100 text-gray-800">View Only</Badge>;
      case 'Edit':
        return <Badge className="bg-green-100 text-green-800">Edit</Badge>;
      case 'Full Access':
        return <Badge className="bg-blue-100 text-blue-800">Full Access</Badge>;
      default:
        return <Badge variant="secondary">{access}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">My Documents</h1>
        <p className="text-red-100 mt-1 text-lg">Access and manage your documents, files, and shared resources</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {documentStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm mt-1">
                  <span
                    className={
                      stat.change.startsWith('+') && !stat.change.includes('-')
                        ? 'text-green-600 font-semibold'
                        : stat.change.startsWith('-')
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-600 font-semibold'
                    }
                  >
                    {stat.change}
                  </span>{' '}
                  <span className="text-gray-500">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900">Recent Documents</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Your latest document uploads and access
                </CardDescription>
              </div>
              <AddDocumentUrlDialog categories={documentCategories.map(c => c.name)} onAdd={(d) => setRecentDocuments(prev => [d, ...prev])}>
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Document by URL
                </Button>
              </AddDocumentUrlDialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doc.uploadedBy} • {doc.size} • {doc.category}
                        </p>
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getTypeBadge(doc.type)}
                    {doc.shared && <Badge className="bg-green-100 text-green-800">Shared</Badge>}
                    <DocumentDetailsDialog doc={doc}>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DocumentDetailsDialog>
                    <Button onClick={() => window.open(doc.url, '_blank')} variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      <Download className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                    <DeleteConfirmationDialog onConfirm={() => {
                      setRecentDocuments(prev => prev.filter(d => d.id !== doc.id));
                      toast.success('Document removed');
                    }}>
                      <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                        Delete
                      </Button>
                    </DeleteConfirmationDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Categories */}
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-xl text-gray-900">Document Categories</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Browse documents by category
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documentCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {category.count} documents
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Documents */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Shared with Me</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Documents shared by colleagues and departments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {sharedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <User className="h-5 w-5 text-red-600" />
                      </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Shared by {doc.sharedBy} • Expires: {doc.expires}
                      </p>
                      <p className="text-xs text-gray-400">
                        Shared: {new Date(doc.sharedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getAccessBadge(doc.access)}
                  <DocumentDetailsDialog doc={{ id: doc.id, name: doc.name, url: doc.url, type: 'Shared', uploadedBy: doc.sharedBy, uploadedDate: doc.sharedDate, size: '-', shared: true, category: 'Shared' }}>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      <Eye className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </DocumentDetailsDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Document Actions</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Common document management tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AddDocumentUrlDialog categories={documentCategories.map(c => c.name)} onAdd={(d) => setRecentDocuments(prev => [d, ...prev])}>
            <Button className="p-5 border-2 border-red-200 rounded-xl hover:bg-linear-to-br hover:from-red-50 hover:to-pink-50 hover:border-red-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <Upload className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Upload Document</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Add new files to your document library
              </p>
            </Button>
            </AddDocumentUrlDialog>
            <Button className="p-5 border-2 border-green-200 rounded-xl hover:bg-linear-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Search Documents</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Find documents by name, type, or content
              </p>
            </Button>
            <Button className="p-5 border-2 border-blue-200 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 text-left transition-all duration-200 group shadow-md hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Organize Files</h3>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Create folders and organize your documents
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}