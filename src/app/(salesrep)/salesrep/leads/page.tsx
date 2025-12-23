'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import mockData from '@/lib/mock-data';

export default function MyLeadsPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating'>('all');

  // Get only my assigned leads
  const myLeads = mockData.getLeadsByAssignee(user?.id || '');
  
  const getFilteredLeads = () => {
    let filtered = myLeads;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const leads = getFilteredLeads();
  const activeLeads = myLeads.filter(l => !['closed_won', 'closed_lost'].includes(l.status)).length;
  const qualifiedLeads = myLeads.filter(l => l.status === 'qualified').length;
  const pipelineValue = myLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const avgDealSize = myLeads.length > 0 ? pipelineValue / myLeads.length : 0;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      new: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      qualified: 'bg-cyan-100 text-cyan-800',
      proposal_sent: 'bg-yellow-100 text-yellow-800',
      negotiating: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600 mt-1">Manage your assigned opportunities</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{myLeads.length}</div>
            <p className="text-sm text-gray-500 mt-1">Assigned to me</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeLeads}</div>
            <p className="text-sm text-gray-500 mt-1">In pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${pipelineValue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Total potential</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">${Math.round(avgDealSize).toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Per opportunity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search leads by company, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'new' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('new')}
              >
                New
              </Button>
              <Button
                variant={filterStatus === 'contacted' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('contacted')}
              >
                Contacted
              </Button>
              <Button
                variant={filterStatus === 'qualified' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('qualified')}
              >
                Qualified
              </Button>
              <Button
                variant={filterStatus === 'proposal_sent' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('proposal_sent')}
              >
                Proposal Sent
              </Button>
              <Button
                variant={filterStatus === 'negotiating' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('negotiating')}
              >
                Negotiating
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead List ({leads.length} leads)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Value</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Probability</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expected Close</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{lead.companyName}</div>
                      <div className="text-sm text-gray-500">{lead.source}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{lead.contactPerson}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{lead.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{lead.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusBadge(lead.status)}>
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-green-600">${lead.estimatedValue.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium text-gray-900">{lead.probability}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(lead.expectedCloseDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leads.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
