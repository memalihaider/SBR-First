'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Building,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Send,
  FileText,
  Activity
} from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatAmount } = useCurrencyStore();
  const leadId = params.id as string;

  const [editDialog, setEditDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [activityDialog, setActivityDialog] = useState(false);
  const [convertDialog, setConvertDialog] = useState(false);

  // Mock lead data - in real app, fetch by ID
  const lead = {
    id: leadId,
    name: 'Sarah Johnson',
    company: 'TechStart Solutions',
    email: 'sarah.j@techstart.com',
    phone: '+1 (555) 123-4567',
    status: 'hot',
    value: 45000,
    source: 'Website',
    priority: 'high',
    notes: 'Very interested in our enterprise package. CEO of growing tech startup.',
    createdAt: '2024-01-15T10:30:00Z',
    lastContact: '2 hours ago',
    nextAction: 'Demo scheduled for tomorrow',
    probability: 75,
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    companyInfo: {
      industry: 'Technology',
      size: '51-200 employees',
      website: 'https://techstart.com',
      description: 'Leading provider of cloud-based business solutions'
    }
  };

  // Mock activities
  const activities = [
    {
      id: '1',
      type: 'call',
      title: 'Phone call with Sarah',
      description: 'Discussed enterprise package requirements',
      date: '2024-01-20T14:30:00Z',
      duration: '30 minutes',
      outcome: 'positive'
    },
    {
      id: '2',
      type: 'email',
      title: 'Sent proposal',
      description: 'Enterprise package proposal sent via email',
      date: '2024-01-18T10:15:00Z',
      outcome: 'neutral'
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Demo session',
      description: 'Product demo scheduled for next week',
      date: '2024-01-16T09:00:00Z',
      outcome: 'positive'
    }
  ];

  // Mock notes
  const notes = [
    {
      id: '1',
      content: 'Sarah is very interested in our enterprise package. She mentioned they are looking to scale their operations significantly in the next 6 months.',
      author: 'Mike Davis',
      date: '2024-01-20T14:45:00Z'
    },
    {
      id: '2',
      content: 'Followed up on the proposal. Sarah has some questions about the pricing structure and implementation timeline.',
      author: 'Mike Davis',
      date: '2024-01-18T11:30:00Z'
    }
  ];

  // Form states
  const [editForm, setEditForm] = useState({
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    value: lead.value.toString(),
    source: lead.source,
    status: lead.status,
    priority: lead.priority,
    notes: lead.notes,
  });

  const [noteForm, setNoteForm] = useState({
    content: '',
  });

  const [activityForm, setActivityForm] = useState({
    type: 'call',
    title: '',
    description: '',
    date: '',
    duration: '',
  });

  const getStatusColor = (status: string) => {
    const colors = {
      hot: { bg: 'bg-red-100', text: 'text-red-700', badge: 'destructive' as const },
      warm: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'secondary' as const },
      cold: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'outline' as const },
      new: { bg: 'bg-green-100', text: 'text-green-700', badge: 'default' as const },
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Calendar;
      default: return Activity;
    }
  };

  const handleEditLead = () => {
    if (!editForm.name.trim() || !editForm.company.trim() || !editForm.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Update lead logic here
    toast.success('Lead updated successfully');
    setEditDialog(false);
  };

  const handleAddNote = () => {
    if (!noteForm.content.trim()) {
      toast.error('Please enter a note');
      return;
    }

    // Add note logic here
    toast.success('Note added successfully');
    setNoteForm({ content: '' });
    setNoteDialog(false);
  };

  const handleAddActivity = () => {
    if (!activityForm.title.trim() || !activityForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Add activity logic here
    toast.success('Activity logged successfully');
    setActivityForm({
      type: 'call',
      title: '',
      description: '',
      date: '',
      duration: '',
    });
    setActivityDialog(false);
  };

  const handleConvertLead = () => {
    // Convert lead to customer logic here
    toast.success('Lead converted to customer successfully');
    setConvertDialog(false);
    router.push('/sales/customers');
  };

  const handleWhatsApp = () => {
    const phoneDigits = lead.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      toast.error('No valid phone number available');
      return;
    }
    const url = `https://wa.me/${phoneDigits}`;
    window.open(url, '_blank');
    toast.success(`Opening WhatsApp chat with ${lead.name}`);
  };

  const handleEmail = () => {
    if (!lead.email) {
      toast.error('No email address available');
      return;
    }
    window.location.href = `mailto:${lead.email}`;
    toast.info(`Composing email to ${lead.name}`);
  };

  const handleSendProposal = () => {
    toast.success('Proposal sent successfully');
  };

  const handleScheduleMeeting = () => {
    toast.success('Meeting scheduled successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-gray-600">{lead.company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={getStatusColor(lead.status).badge} className="text-sm">
            {lead.status.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {lead.priority.toUpperCase()} PRIORITY
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Value</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(lead.value)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Probability</p>
                <p className="text-2xl font-bold text-blue-600">{lead.probability}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Contact</p>
                <p className="text-lg font-semibold">{lead.lastContact}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Action</p>
                <p className="text-lg font-semibold">{lead.nextAction}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={handleWhatsApp} className="h-16 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center space-y-1">
              <Phone className="h-5 w-5" />
              <span className="text-sm">WhatsApp</span>
            </Button>

            <Button onClick={handleEmail} variant="outline" className="h-16 border-blue-200 hover:bg-blue-50 flex flex-col items-center justify-center space-y-1">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm">Email</span>
            </Button>

            <Button onClick={handleSendProposal} variant="outline" className="h-16 border-purple-200 hover:bg-purple-50 flex flex-col items-center justify-center space-y-1">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-sm">Send Proposal</span>
            </Button>

            <Button onClick={handleScheduleMeeting} variant="outline" className="h-16 border-orange-200 hover:bg-orange-50 flex flex-col items-center justify-center space-y-1">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-sm">Schedule Meeting</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lead Information</CardTitle>
                <CardDescription>Contact and company details</CardDescription>
              </div>
              <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-2 border-gray-200 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Lead</DialogTitle>
                    <DialogDescription>Update lead information</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Name *</Label>
                        <Input
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-company">Company *</Label>
                        <Input
                          id="edit-company"
                          value={editForm.company}
                          onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email *</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                          id="edit-phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-value">Value</Label>
                        <Input
                          id="edit-value"
                          value={editForm.value}
                          onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-source">Source</Label>
                        <Select value={editForm.source} onValueChange={(value) => setEditForm(prev => ({ ...prev, source: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Cold Call">Cold Call</SelectItem>
                            <SelectItem value="Trade Show">Trade Show</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="hot">Hot</SelectItem>
                            <SelectItem value="warm">Warm</SelectItem>
                            <SelectItem value="cold">Cold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-priority">Priority</Label>
                        <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-notes">Notes</Label>
                      <Textarea
                        id="edit-notes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditLead}>
                      Update Lead
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-semibold">{lead.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold">{lead.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold">{lead.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-semibold">{lead.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Deal Value</p>
                      <p className="font-semibold">{formatAmount(lead.value)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Lead Source</p>
                      <p className="font-semibold">{lead.source}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{lead.notes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Activities and Notes Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Activities & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="activities" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="activities" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Recent Activities</h4>
                    <Dialog open={activityDialog} onOpenChange={setActivityDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Activity</DialogTitle>
                          <DialogDescription>Log a new activity for this lead</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="activity-type">Type</Label>
                              <Select value={activityForm.type} onValueChange={(value) => setActivityForm(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="call">Call</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="meeting">Meeting</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="activity-date">Date</Label>
                              <Input
                                id="activity-date"
                                type="datetime-local"
                                value={activityForm.date}
                                onChange={(e) => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="activity-title">Title</Label>
                            <Input
                              id="activity-title"
                              value={activityForm.title}
                              onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Activity title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="activity-description">Description</Label>
                            <Textarea
                              id="activity-description"
                              value={activityForm.description}
                              onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Activity details"
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="activity-duration">Duration (optional)</Label>
                            <Input
                              id="activity-duration"
                              value={activityForm.duration}
                              onChange={(e) => setActivityForm(prev => ({ ...prev, duration: e.target.value }))}
                              placeholder="30 minutes"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setActivityDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddActivity}>
                            Add Activity
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3">
                    {activities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium">{activity.title}</h5>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{new Date(activity.date).toLocaleDateString()}</span>
                              {activity.duration && <span>{activity.duration}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Notes</h4>
                    <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Note</DialogTitle>
                          <DialogDescription>Add a note about this lead</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="note-content">Note</Label>
                            <Textarea
                              id="note-content"
                              value={noteForm.content}
                              onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Enter your note here..."
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setNoteDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddNote}>
                            Add Note
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 border border-gray-200 rounded-lg">
                        <p className="text-gray-700 mb-2">{note.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>By {note.author}</span>
                          <span>{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conversion Probability */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{lead.probability}%</div>
                <Progress value={lead.probability} className="h-3 mb-2" />
                <p className="text-sm text-gray-600">Based on activity and engagement</p>
              </div>
            </CardContent>
          </Card>

          {/* Convert to Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Convert?</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Convert to Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convert Lead to Customer</DialogTitle>
                    <DialogDescription>
                      This will create a new customer record and move this lead to closed status.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Lead Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {lead.name}</p>
                        <p><strong>Company:</strong> {lead.company}</p>
                        <p><strong>Value:</strong> {formatAmount(lead.value)}</p>
                        <p><strong>Probability:</strong> {lead.probability}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setConvertDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConvertLead} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Convert to Customer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium">{lead.companyInfo.industry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Company Size</p>
                <p className="font-medium">{lead.companyInfo.size}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a href={lead.companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {lead.companyInfo.website}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{lead.companyInfo.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}