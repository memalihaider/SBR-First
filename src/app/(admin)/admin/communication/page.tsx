'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Megaphone,
  Send,
  Users,
  User,
  Globe,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Reply,
  Paperclip,
  Search
} from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import { PortalType, Message, Announcement, UserRole } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AdminCommunicationPage() {
  // Mock data for messages and announcements
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      senderId: 'user-1',
      senderName: 'John Admin',
      senderRole: 'super_admin',
      senderPortal: 'admin',
      recipientType: 'portal',
      recipientPortals: ['sales', 'inventory'],
      recipientRoles: ['sales_manager', 'inventory_manager'],
      type: 'portal_broadcast',
      subject: 'System Maintenance Notice',
      content: 'Scheduled maintenance will occur this weekend from 2 AM to 4 AM EST. Please plan accordingly.',
      priority: 'high',
      status: 'sent',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      readBy: [
        { userId: 'user-2', readAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
        { userId: 'user-3', readAt: new Date(Date.now() - 30 * 60 * 1000) }
      ],
      isAnnouncement: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'msg-2',
      senderId: 'user-4',
      senderName: 'Sarah Sales',
      senderRole: 'sales_manager',
      senderPortal: 'sales',
      recipientType: 'user',
      recipientIds: ['user-1'],
      type: 'direct',
      subject: 'Q4 Sales Target Update',
      content: 'Great progress on Q4 targets! We\'re currently at 87% of our quarterly goal.',
      priority: 'normal',
      status: 'read',
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      readBy: [{ userId: 'user-1', readAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }],
      isAnnouncement: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ann-1',
      title: 'New Feature Release: Advanced Analytics Dashboard',
      content: 'We\'re excited to announce the release of our new Advanced Analytics Dashboard! This powerful tool provides deeper insights into your business metrics with real-time data visualization, custom reporting, and predictive analytics. Access it from your dashboard today.',
      priority: 'high',
      targetType: 'global',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: 'user-1',
      createdByName: 'John Admin',
      createdByRole: 'super_admin',
      views: 245,
      acknowledgments: [
        { userId: 'user-2', acknowledgedAt: new Date(Date.now() - 20 * 60 * 60 * 1000) },
        { userId: 'user-3', acknowledgedAt: new Date(Date.now() - 18 * 60 * 60 * 1000) }
      ],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'ann-2',
      title: 'Holiday Schedule Update',
      content: 'Please note that our offices will be closed for the upcoming holidays. Christmas: Dec 25, New Year: Jan 1. All support tickets will be handled on Jan 2.',
      priority: 'normal',
      targetType: 'portal',
      targetPortals: ['admin', 'finance', 'hr'],
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: 'user-1',
      createdByName: 'John Admin',
      createdByRole: 'super_admin',
      views: 89,
      acknowledgments: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Dialog states
  const [newMessageDialog, setNewMessageDialog] = useState(false);
  const [newAnnouncementDialog, setNewAnnouncementDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);
  const [editAnnouncementDialog, setEditAnnouncementDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'message' | 'announcement'; id: string } | null>(null);

  // Form states
  const [messageForm, setMessageForm] = useState({
    recipientType: 'portal' as 'user' | 'portal' | 'global',
    selectedPortals: [] as PortalType[],
    selectedUsers: [] as string[],
    selectedRoles: [] as UserRole[],
    subject: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    isAnnouncement: false
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    targetType: 'global' as 'global' | 'portal' | 'role' | 'specific_users',
    selectedPortals: [] as PortalType[],
    selectedRoles: [] as UserRole[],
    selectedUsers: [] as string[],
    expiresAt: ''
  });

  const [replyForm, setReplyForm] = useState({
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });

  // Available options
  const portalOptions: { value: PortalType; label: string; icon: string }[] = [
    { value: 'admin', label: 'Admin Portal', icon: '🏢' },
    { value: 'client', label: 'Client Portal', icon: '👥' },
    { value: 'finance', label: 'Finance Portal', icon: '💰' },
    { value: 'inventory', label: 'Inventory Portal', icon: '📦' },
    { value: 'project', label: 'Project Portal', icon: '📋' },
    { value: 'sales', label: 'Sales Portal', icon: '📈' },
    { value: 'salesrep', label: 'Sales Rep Portal', icon: '👔' },
    { value: 'vendor', label: 'Vendor Portal', icon: '🚚' },
    { value: 'hr', label: 'HR Portal', icon: '👨‍💼' },
    { value: 'employee', label: 'Employee Portal', icon: '🧑‍💻' }
  ];

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'sales_rep', label: 'Sales Representative' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'hr_manager', label: 'HR Manager' },
    { value: 'employee', label: 'Employee' },
    { value: 'client', label: 'Client' },
    { value: 'vendor', label: 'Vendor' }
  ];

  const userOptions = mockData.employees?.map(emp => ({
    value: emp.userId,
    label: `${emp.firstName} ${emp.lastName}`,
    role: emp.userId === 'user-1' ? 'super_admin' : 'employee',
    portal: 'admin' as PortalType
  })) || [];

  // Handlers
  const handleSendMessage = () => {
    if (!messageForm.subject.trim() || !messageForm.content.trim()) {
      toast.error('Please fill in both subject and message content');
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1', // Current admin user
      senderName: 'John Admin',
      senderRole: 'super_admin',
      senderPortal: 'admin',
      recipientType: messageForm.recipientType,
      recipientPortals: messageForm.recipientType === 'portal' ? messageForm.selectedPortals : undefined,
      recipientIds: messageForm.recipientType === 'user' ? messageForm.selectedUsers : undefined,
      recipientRoles: messageForm.recipientType === 'portal' ? messageForm.selectedRoles : undefined,
      type: messageForm.recipientType === 'user' ? 'direct' : 'portal_broadcast',
      subject: messageForm.subject,
      content: messageForm.content,
      priority: messageForm.priority,
      status: 'sent',
      sentAt: new Date(),
      deliveredAt: new Date(),
      readBy: [],
      isAnnouncement: messageForm.isAnnouncement,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessageForm({
      recipientType: 'portal',
      selectedPortals: [],
      selectedUsers: [],
      selectedRoles: [],
      subject: '',
      content: '',
      priority: 'normal',
      isAnnouncement: false
    });
    setNewMessageDialog(false);
    toast.success('Message sent successfully!');
  };

  const handleCreateAnnouncement = () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      targetType: announcementForm.targetType,
      targetPortals: announcementForm.targetType === 'portal' ? announcementForm.selectedPortals : undefined,
      targetRoles: announcementForm.targetType === 'role' ? announcementForm.selectedRoles : undefined,
      targetUserIds: announcementForm.targetType === 'specific_users' ? announcementForm.selectedUsers : undefined,
      publishedAt: new Date(),
      expiresAt: announcementForm.expiresAt ? new Date(announcementForm.expiresAt) : undefined,
      isActive: true,
      createdBy: 'user-1',
      createdByName: 'John Admin',
      createdByRole: 'super_admin',
      views: 0,
      acknowledgments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setAnnouncementForm({
      title: '',
      content: '',
      priority: 'normal',
      targetType: 'global',
      selectedPortals: [],
      selectedRoles: [],
      selectedUsers: [],
      expiresAt: ''
    });
    setNewAnnouncementDialog(false);
    toast.success('Announcement created successfully!');
  };

  const handleReplyMessage = (message: Message) => {
    setSelectedMessage(message);
    setReplyForm({
      content: '',
      priority: 'normal'
    });
    setReplyDialog(true);
  };

  const handleSendReply = () => {
    if (!replyForm.content.trim() || !selectedMessage) {
      toast.error('Please enter a reply message');
      return;
    }

    const replyMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1',
      senderName: 'John Admin',
      senderRole: 'super_admin',
      senderPortal: 'admin',
      recipientType: 'user',
      recipientIds: [selectedMessage.senderId],
      type: 'direct',
      subject: `Re: ${selectedMessage.subject}`,
      content: replyForm.content,
      priority: replyForm.priority,
      status: 'sent',
      sentAt: new Date(),
      deliveredAt: new Date(),
      readBy: [],
      isAnnouncement: false,
      threadId: selectedMessage.threadId || selectedMessage.id,
      parentMessageId: selectedMessage.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMessages(prev => [replyMessage, ...prev]);
    setReplyDialog(false);
    setSelectedMessage(null);
    toast.success('Reply sent successfully!');
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeleteItem({ type: 'message', id: messageId });
    setDeleteConfirmDialog(true);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setDeleteItem({ type: 'announcement', id: announcementId });
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteItem) return;

    if (deleteItem.type === 'message') {
      setMessages(prev => prev.filter(msg => msg.id !== deleteItem.id));
      toast.success('Message deleted successfully!');
    } else if (deleteItem.type === 'announcement') {
      setAnnouncements(prev => prev.filter(ann => ann.id !== deleteItem.id));
      toast.success('Announcement deleted successfully!');
    }

    setDeleteConfirmDialog(false);
    setDeleteItem(null);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetType: announcement.targetType,
      selectedPortals: announcement.targetPortals || [],
      selectedRoles: announcement.targetRoles || [],
      selectedUsers: announcement.targetUserIds || [],
      expiresAt: announcement.expiresAt ? announcement.expiresAt.toISOString().slice(0, 16) : ''
    });
    setEditAnnouncementDialog(true);
  };

  const handleUpdateAnnouncement = () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim() || !selectedAnnouncement) {
      toast.error('Please fill in both title and content');
      return;
    }

    const updatedAnnouncement: Announcement = {
      ...selectedAnnouncement,
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      targetType: announcementForm.targetType,
      targetPortals: announcementForm.targetType === 'portal' ? announcementForm.selectedPortals : undefined,
      targetRoles: announcementForm.targetType === 'role' ? announcementForm.selectedRoles : undefined,
      targetUserIds: announcementForm.targetType === 'specific_users' ? announcementForm.selectedUsers : undefined,
      expiresAt: announcementForm.expiresAt ? new Date(announcementForm.expiresAt) : undefined,
      updatedAt: new Date()
    };

    setAnnouncements(prev => prev.map(ann =>
      ann.id === selectedAnnouncement.id ? updatedAnnouncement : ann
    ));

    setEditAnnouncementDialog(false);
    setSelectedAnnouncement(null);
    toast.success('Announcement updated successfully!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Communication Center</h1>
            <p className="text-red-100 mt-1 text-lg">Manage messages, announcements, and inter-portal communication</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
              <MessageSquare className="h-4 w-4 mr-2 inline" />
              {messages.length} Messages
            </Badge>
            <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
              <Megaphone className="h-4 w-4 mr-2 inline" />
              {announcements.length} Announcements
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog open={newMessageDialog} onOpenChange={setNewMessageDialog}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-red-200 hover:border-red-300">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Send New Message</h3>
                  <p className="text-gray-600">Communicate with specific users or portal groups</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
        </Dialog>

        <Dialog open={newAnnouncementDialog} onOpenChange={setNewAnnouncementDialog}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-red-200 hover:border-red-300">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Megaphone className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Announcement</h3>
                  <p className="text-gray-600">Broadcast important updates to all users</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="messages" className="data-[state=active]:bg-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="announcements" className="data-[state=active]:bg-white">
            <Megaphone className="h-4 w-4 mr-2" />
            Announcements ({announcements.length})
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {messages.map((message) => (
              <Card key={message.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{message.senderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                        <p className="text-sm text-gray-600">
                          From {message.senderName} ({message.senderPortal}) • {message.sentAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{message.content}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {message.recipientType === 'portal' && message.recipientPortals && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>To: {message.recipientPortals.join(', ')}</span>
                        </div>
                      )}
                      {message.recipientType === 'user' && message.recipientIds && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>To: {message.recipientIds.length} user(s)</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{message.readBy.length} read</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="h-8" onClick={() => handleReplyMessage(message)}>
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700" onClick={() => handleDeleteMessage(message.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Megaphone className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        By {announcement.createdByName} • {announcement.publishedAt.toLocaleString()}
                        {announcement.expiresAt && ` • Expires: ${announcement.expiresAt.toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                        {announcement.isActive ? 'Active' : 'Expired'}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{announcement.content}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {announcement.targetType === 'global' && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-4 w-4" />
                          <span>Global</span>
                        </div>
                      )}
                      {announcement.targetType === 'portal' && announcement.targetPortals && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>To: {announcement.targetPortals.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{announcement.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{announcement.acknowledgments.length} acknowledged</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="h-8" onClick={() => handleEditAnnouncement(announcement)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Message Dialog */}
      <Dialog open={newMessageDialog} onOpenChange={setNewMessageDialog}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Send New Message</span>
            </DialogTitle>
            <DialogDescription>
              Compose and send a message to users or portal groups
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Recipient Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Recipient Type</Label>
              <Select
                value={messageForm.recipientType}
                onValueChange={(value: 'user' | 'portal' | 'global') =>
                  setMessageForm(prev => ({ ...prev, recipientType: value }))
                }
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="portal">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Portal Groups</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Specific Users</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="global">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>All Users (Global)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Portal Selection */}
            {messageForm.recipientType === 'portal' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Portals</Label>
                <div className="grid grid-cols-2 gap-3">
                  {portalOptions.map((portal) => (
                    <div key={portal.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`portal-${portal.value}`}
                        checked={messageForm.selectedPortals.includes(portal.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMessageForm(prev => ({
                              ...prev,
                              selectedPortals: [...prev.selectedPortals, portal.value]
                            }));
                          } else {
                            setMessageForm(prev => ({
                              ...prev,
                              selectedPortals: prev.selectedPortals.filter(p => p !== portal.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`portal-${portal.value}`} className="flex items-center space-x-2 cursor-pointer">
                        <span>{portal.icon}</span>
                        <span>{portal.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Selection */}
            {messageForm.recipientType === 'user' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Users</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  {userOptions.map((user) => (
                    <div key={user.value} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`user-${user.value}`}
                        checked={messageForm.selectedUsers.includes(user.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMessageForm(prev => ({
                              ...prev,
                              selectedUsers: [...prev.selectedUsers, user.value]
                            }));
                          } else {
                            setMessageForm(prev => ({
                              ...prev,
                              selectedUsers: prev.selectedUsers.filter(u => u !== user.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`user-${user.value}`} className="flex items-center space-x-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user.label.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.label}</span>
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={messageForm.priority}
                  onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') =>
                    setMessageForm(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                id="content"
                value={messageForm.content}
                onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message..."
                rows={6}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAnnouncement"
                checked={messageForm.isAnnouncement}
                onCheckedChange={(checked) =>
                  setMessageForm(prev => ({ ...prev, isAnnouncement: !!checked }))
                }
              />
              <Label htmlFor="isAnnouncement" className="text-sm">
                Mark as announcement (will appear in announcements section)
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setNewMessageDialog(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleSendMessage} className="bg-red-600 hover:bg-red-700">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Announcement Dialog */}
      <Dialog open={newAnnouncementDialog} onOpenChange={setNewAnnouncementDialog}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5" />
              <span>Create New Announcement</span>
            </DialogTitle>
            <DialogDescription>
              Create and publish an announcement for users across portals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Target Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Target Audience</Label>
              <Select
                value={announcementForm.targetType}
                onValueChange={(value: 'global' | 'portal' | 'role' | 'specific_users') =>
                  setAnnouncementForm(prev => ({ ...prev, targetType: value }))
                }
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="global">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>All Users (Global)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="portal">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Specific Portals</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="role">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Specific Roles</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="specific_users">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Specific Users</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Portal Selection for Announcements */}
            {announcementForm.targetType === 'portal' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Portals</Label>
                <div className="grid grid-cols-2 gap-3">
                  {portalOptions.map((portal) => (
                    <div key={portal.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ann-portal-${portal.value}`}
                        checked={announcementForm.selectedPortals.includes(portal.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedPortals: [...prev.selectedPortals, portal.value]
                            }));
                          } else {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedPortals: prev.selectedPortals.filter(p => p !== portal.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`ann-portal-${portal.value}`} className="flex items-center space-x-2 cursor-pointer">
                        <span>{portal.icon}</span>
                        <span>{portal.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role Selection for Announcements */}
            {announcementForm.targetType === 'role' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Roles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ann-role-${role.value}`}
                        checked={announcementForm.selectedRoles.includes(role.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedRoles: [...prev.selectedRoles, role.value]
                            }));
                          } else {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedRoles: prev.selectedRoles.filter(r => r !== role.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`ann-role-${role.value}`} className="cursor-pointer">
                        {role.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Selection for Announcements */}
            {announcementForm.targetType === 'specific_users' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Users</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  {userOptions.map((user) => (
                    <div key={user.value} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`ann-user-${user.value}`}
                        checked={announcementForm.selectedUsers.includes(user.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedUsers: [...prev.selectedUsers, user.value]
                            }));
                          } else {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedUsers: prev.selectedUsers.filter(u => u !== user.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`ann-user-${user.value}`} className="flex items-center space-x-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user.label.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.label}</span>
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcement Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ann-title">Title *</Label>
                <Input
                  id="ann-title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ann-priority">Priority</Label>
                <Select
                  value={announcementForm.priority}
                  onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') =>
                    setAnnouncementForm(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ann-content">Content *</Label>
              <Textarea
                id="ann-content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content..."
                rows={8}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={announcementForm.expiresAt}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setNewAnnouncementDialog(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} className="bg-red-600 hover:bg-red-700">
              <Megaphone className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onOpenChange={setReplyDialog}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Reply className="h-5 w-5" />
              <span>Reply to Message</span>
            </DialogTitle>
            <DialogDescription>
              Send a reply to {selectedMessage?.senderName}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {selectedMessage.senderName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{selectedMessage.senderName}</p>
                  <p className="text-xs text-gray-600">{selectedMessage.sentAt.toLocaleString()}</p>
                  <p className="text-sm mt-2">{selectedMessage.content}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reply-priority">Priority</Label>
              <Select
                value={replyForm.priority}
                onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') =>
                  setReplyForm(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply-content">Your Reply *</Label>
              <Textarea
                id="reply-content"
                value={replyForm.content}
                onChange={(e) => setReplyForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your reply..."
                rows={6}
                className="bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setReplyDialog(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleSendReply} className="bg-red-600 hover:bg-red-700">
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={editAnnouncementDialog} onOpenChange={setEditAnnouncementDialog}>
        <DialogContent className="bg-white border-2 border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5" />
              <span>Edit Announcement</span>
            </DialogTitle>
            <DialogDescription>
              Update the announcement details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Target Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Target Audience</Label>
              <Select
                value={announcementForm.targetType}
                onValueChange={(value: 'global' | 'portal' | 'role' | 'specific_users') =>
                  setAnnouncementForm(prev => ({ ...prev, targetType: value }))
                }
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="global">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>All Users (Global)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="portal">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Specific Portals</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="role">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Specific Roles</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="specific_users">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Specific Users</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Portal Selection for Edit */}
            {announcementForm.targetType === 'portal' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Portals</Label>
                <div className="grid grid-cols-2 gap-3">
                  {portalOptions.map((portal) => (
                    <div key={portal.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-portal-${portal.value}`}
                        checked={announcementForm.selectedPortals.includes(portal.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedPortals: [...prev.selectedPortals, portal.value]
                            }));
                          } else {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedPortals: prev.selectedPortals.filter(p => p !== portal.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`edit-portal-${portal.value}`} className="flex items-center space-x-2 cursor-pointer">
                        <span>{portal.icon}</span>
                        <span>{portal.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role Selection for Edit */}
            {announcementForm.targetType === 'role' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Roles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-role-${role.value}`}
                        checked={announcementForm.selectedRoles.includes(role.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedRoles: [...prev.selectedRoles, role.value]
                            }));
                          } else {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedRoles: prev.selectedRoles.filter(r => r !== role.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`edit-role-${role.value}`} className="cursor-pointer">
                        {role.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Selection for Edit */}
            {announcementForm.targetType === 'specific_users' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Users</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  {userOptions.map((user) => (
                    <div key={user.value} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`edit-user-${user.value}`}
                        checked={announcementForm.selectedUsers.includes(user.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedUsers: [...prev.selectedUsers, user.value]
                            }));
                          } else {
                            setAnnouncementForm(prev => ({
                              ...prev,
                              selectedUsers: prev.selectedUsers.filter(u => u !== user.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`edit-user-${user.value}`} className="flex items-center space-x-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user.label.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.label}</span>
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcement Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ann-title">Title *</Label>
                <Input
                  id="edit-ann-title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ann-priority">Priority</Label>
                <Select
                  value={announcementForm.priority}
                  onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') =>
                    setAnnouncementForm(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ann-content">Content *</Label>
              <Textarea
                id="edit-ann-content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content..."
                rows={8}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expires-at">Expiration Date (Optional)</Label>
              <Input
                id="edit-expires-at"
                type="datetime-local"
                value={announcementForm.expiresAt}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditAnnouncementDialog(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleUpdateAnnouncement} className="bg-red-600 hover:bg-red-700">
              <Megaphone className="h-4 w-4 mr-2" />
              Update Announcement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <DialogContent className="bg-white border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Confirm Deletion</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteItem?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteConfirmDialog(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {deleteItem?.type === 'message' ? 'Message' : 'Announcement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}