'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/stores/inventory';

interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  totalOrders: number;
  totalValue: number;
  status: 'active' | 'inactive';
  since: Date;
}

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierAdd?: (supplier: Supplier) => void;
}

export function AddSupplierModal({ isOpen, onClose, onSupplierAdd }: AddSupplierModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    category: '',
  });
  const { addSupplier } = useInventoryStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.company || !formData.email || !formData.category) return;

    const newSupplier: Supplier = {
      id: `SUP-${Date.now()}`,
      ...formData,
      rating: 0,
      totalOrders: 0,
      totalValue: 0,
      status: 'active',
      since: new Date(),
    };

    // Add to inventory store for basic supplier info
    addSupplier(formData.company, formData.email, formData.phone, formData.address);

    onSupplierAdd?.(newSupplier);

    // Reset form
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      category: '',
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Contact Person</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter contact person name"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Hardware">Hardware</SelectItem>
                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.company || !formData.email || !formData.category}>
              Add Supplier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SupplierDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
}

export function SupplierDetailsModal({ isOpen, onClose, supplier }: SupplierDetailsModalProps) {
  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Supplier Details - {supplier.company}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contact Person</Label>
                  <p className="text-sm font-medium">{supplier.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Company</Label>
                  <p className="text-sm font-medium">{supplier.company}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{supplier.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{supplier.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{supplier.address}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Category</Label>
                  <div className="mt-1">
                    <Badge className="bg-blue-100 text-blue-800">{supplier.category}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {supplier.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Rating</Label>
                  <p className="text-sm font-medium">⭐ {supplier.rating}/5.0</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Supplier Since</Label>
                  <p className="text-sm">{supplier.since.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Statistics</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{supplier.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${(supplier.totalValue / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{supplier.rating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New order placed</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ContactSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
}

export function ContactSupplierModal({ isOpen, onClose, supplier }: ContactSupplierModalProps) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'message'>('email');
  const [message, setMessage] = useState('');

  if (!supplier) return null;

  const handleSendMessage = () => {
    // In a real app, this would send the message
    alert(`Message sent to ${supplier.company} via ${contactMethod}`);
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact {supplier.company}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-sm">{supplier.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="text-sm">{supplier.phone}</p>
            </div>
          </div>

          <div>
            <Label>Contact Method</Label>
            <Select value={contactMethod} onValueChange={(value: any) => setContactMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Send Email</SelectItem>
                <SelectItem value="phone">Call Phone</SelectItem>
                <SelectItem value="message">Send Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contactMethod === 'message' && (
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
          )}

          <div className="flex gap-2">
            {contactMethod === 'email' && (
              <Button
                className="flex-1"
                onClick={() => window.open(`mailto:${supplier.email}`)}
              >
                Open Email Client
              </Button>
            )}
            {contactMethod === 'phone' && (
              <Button
                className="flex-1"
                onClick={() => window.open(`tel:${supplier.phone}`)}
              >
                Call {supplier.phone}
              </Button>
            )}
            {contactMethod === 'message' && (
              <Button
                className="flex-1"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Send Message
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}