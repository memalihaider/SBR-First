'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Lock, Database, Mail, Globe, Palette, Shield, Building, FileText, CreditCard } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import { CompanySettings } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(mockData.companySettings);
  const [originalCompanySettings, setOriginalCompanySettings] = useState<CompanySettings>(mockData.companySettings);
  const [modulesConfig, setModulesConfig] = useState([
    { name: 'Sales Module', enabled: true, users: 72, color: 'green' },
    { name: 'Inventory Module', enabled: true, users: 45, color: 'blue' },
    { name: 'Project Module', enabled: true, users: 38, color: 'purple' },
    { name: 'Finance Module', enabled: true, users: 28, color: 'yellow' },
    { name: 'HR Module', enabled: false, users: 0, color: 'gray' },
    { name: 'CRM Module', enabled: true, users: 56, color: 'indigo' },
  ]);

  // Settings state for each group
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'Largify 360ERP',
    timezone: 'UTC-05:00 (EST)',
    dateFormat: 'MM/DD/YYYY',
    currency: 'AED (د.إ)',
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: '90',
    sessionTimeout: '30',
    ipWhitelisting: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.largify.com',
    smtpPort: '587',
    fromEmail: 'noreply@largify.com',
    emailNotifications: true,
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    autoBackup: 'Daily at 2:00 AM',
    backupRetention: '30',
    databaseSize: '2.4 GB',
    lastBackup: '2 hours ago',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    alertThreshold: 'High Priority Only',
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    apiAccess: true,
    apiRateLimit: '1000',
    webhookUrl: 'https://api.largify.com/webhook',
    thirdPartyApps: '5 connected',
  });

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditGroup, setCurrentEditGroup] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; action: () => void } | null>(null);

  // Handlers
  const handleModuleToggle = (moduleName: string) => {
    setModulesConfig(prev => prev.map(module => 
      module.name === moduleName 
        ? { ...module, enabled: !module.enabled, users: !module.enabled ? Math.floor(Math.random() * 50) + 10 : 0 }
        : module
    ));
    toast.success(`${moduleName} ${modulesConfig.find(m => m.name === moduleName)?.enabled ? 'disabled' : 'enabled'} successfully`);
  };

  const handleCompanySettingsSave = () => {
    setOriginalCompanySettings(companySettings);
    toast.success('Company settings saved successfully');
  };

  const handleCompanySettingsReset = () => {
    setCompanySettings(originalCompanySettings);
    toast.success('Company settings reset to previous state');
  };

  const handleSettingToggle = (groupTitle: string, settingKey: string) => {
    const group = settingsGroups.find(g => g.title === groupTitle);
    if (group) {
      const currentValue = (group.state as any)[settingKey];
      const newValue = !currentValue;
      (group.setState as any)({ ...group.state, [settingKey]: newValue });
      toast.success(`${settingKey.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newValue ? 'enabled' : 'disabled'}`);
    }
  };

  const handleSettingEdit = (groupTitle: string, settingKey: string, newValue: string | number | boolean) => {
    const group = settingsGroups.find(g => g.title === groupTitle);
    if (group) {
      (group.setState as any)({ ...group.state, [settingKey]: newValue });
      toast.success(`${settingKey.replace(/([A-Z])/g, ' $1').toLowerCase()} updated successfully`);
    }
  };

  const handleGroupSave = (groupTitle: string) => {
    toast.success(`${groupTitle} settings saved successfully`);
  };

  const handleAdvancedAction = (action: string) => {
    switch (action) {
      case 'clearCache':
        setConfirmAction({
          title: 'Clear System Cache',
          description: 'This will clear all cached data and may temporarily slow down the system. Continue?',
          action: () => {
            toast.success('System cache cleared successfully');
            setConfirmDialogOpen(false);
          }
        });
        setConfirmDialogOpen(true);
        break;
      case 'rebuildIndexes':
        setConfirmAction({
          title: 'Rebuild Database Indexes',
          description: 'This will rebuild all database indexes and may take several minutes. Continue?',
          action: () => {
            toast.success('Database indexes rebuilt successfully');
            setConfirmDialogOpen(false);
          }
        });
        setConfirmDialogOpen(true);
        break;
      case 'exportLogs':
        toast.success('System logs exported successfully');
        break;
      case 'factoryReset':
        setConfirmAction({
          title: 'Reset to Factory Settings',
          description: 'This will reset all settings to factory defaults and cannot be undone. Continue?',
          action: () => {
            // Reset all settings to defaults
            setSystemSettings({
              companyName: 'Largify 360ERP',
              timezone: 'UTC-05:00 (EST)',
              dateFormat: 'MM/DD/YYYY',
              currency: 'AED (د.إ)',
            });
            setSecuritySettings({
              twoFactorAuth: true,
              passwordExpiry: '90',
              sessionTimeout: '30',
              ipWhitelisting: false,
            });
            setEmailSettings({
              smtpServer: 'smtp.largify.com',
              smtpPort: '587',
              fromEmail: 'noreply@largify.com',
              emailNotifications: true,
            });
            setDatabaseSettings({
              autoBackup: 'Daily at 2:00 AM',
              backupRetention: '30',
              databaseSize: '2.4 GB',
              lastBackup: '2 hours ago',
            });
            setNotificationSettings({
              emailAlerts: true,
              smsAlerts: false,
              pushNotifications: true,
              alertThreshold: 'High Priority Only',
            });
            setIntegrationSettings({
              apiAccess: true,
              apiRateLimit: '1000',
              webhookUrl: 'https://api.largify.com/webhook',
              thirdPartyApps: '5 connected',
            });
            setCompanySettings(mockData.companySettings);
            setOriginalCompanySettings(mockData.companySettings);
            toast.success('All settings reset to factory defaults');
            setConfirmDialogOpen(false);
          }
        });
        setConfirmDialogOpen(true);
        break;
    }
  };
  const settingsGroups = [
    {
      title: 'System Configuration',
      icon: Settings,
      color: 'blue',
      settings: [
        { name: 'Company Name', value: systemSettings.companyName, type: 'text', key: 'companyName' },
        { name: 'System Timezone', value: systemSettings.timezone, type: 'select', key: 'timezone' },
        { name: 'Date Format', value: systemSettings.dateFormat, type: 'select', key: 'dateFormat' },
        { name: 'Currency', value: systemSettings.currency, type: 'select', key: 'currency' },
      ],
      state: systemSettings,
      setState: setSystemSettings,
    },
    {
      title: 'Security Settings',
      icon: Lock,
      color: 'red',
      settings: [
        { name: 'Two-Factor Authentication', value: securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled', type: 'toggle', key: 'twoFactorAuth', enabled: securitySettings.twoFactorAuth },
        { name: 'Password Expiry', value: `${securitySettings.passwordExpiry} days`, type: 'number', key: 'passwordExpiry' },
        { name: 'Session Timeout', value: `${securitySettings.sessionTimeout} minutes`, type: 'number', key: 'sessionTimeout' },
        { name: 'IP Whitelisting', value: securitySettings.ipWhitelisting ? 'Enabled' : 'Disabled', type: 'toggle', key: 'ipWhitelisting', enabled: securitySettings.ipWhitelisting },
      ],
      state: securitySettings,
      setState: setSecuritySettings,
    },
    {
      title: 'Email Configuration',
      icon: Mail,
      color: 'green',
      settings: [
        { name: 'SMTP Server', value: emailSettings.smtpServer, type: 'text', key: 'smtpServer' },
        { name: 'SMTP Port', value: emailSettings.smtpPort, type: 'number', key: 'smtpPort' },
        { name: 'From Email', value: emailSettings.fromEmail, type: 'email', key: 'fromEmail' },
        { name: 'Email Notifications', value: emailSettings.emailNotifications ? 'Enabled' : 'Disabled', type: 'toggle', key: 'emailNotifications', enabled: emailSettings.emailNotifications },
      ],
      state: emailSettings,
      setState: setEmailSettings,
    },
    {
      title: 'Database & Backup',
      icon: Database,
      color: 'purple',
      settings: [
        { name: 'Auto Backup', value: databaseSettings.autoBackup, type: 'text', key: 'autoBackup' },
        { name: 'Backup Retention', value: `${databaseSettings.backupRetention} days`, type: 'number', key: 'backupRetention' },
        { name: 'Database Size', value: databaseSettings.databaseSize, type: 'readonly' },
        { name: 'Last Backup', value: databaseSettings.lastBackup, type: 'readonly' },
      ],
      state: databaseSettings,
      setState: setDatabaseSettings,
    },
    {
      title: 'Notifications',
      icon: Bell,
      color: 'yellow',
      settings: [
        { name: 'Email Alerts', value: notificationSettings.emailAlerts ? 'Enabled' : 'Disabled', type: 'toggle', key: 'emailAlerts', enabled: notificationSettings.emailAlerts },
        { name: 'SMS Alerts', value: notificationSettings.smsAlerts ? 'Enabled' : 'Disabled', type: 'toggle', key: 'smsAlerts', enabled: notificationSettings.smsAlerts },
        { name: 'Push Notifications', value: notificationSettings.pushNotifications ? 'Enabled' : 'Disabled', type: 'toggle', key: 'pushNotifications', enabled: notificationSettings.pushNotifications },
        { name: 'Alert Threshold', value: notificationSettings.alertThreshold, type: 'select', key: 'alertThreshold' },
      ],
      state: notificationSettings,
      setState: setNotificationSettings,
    },
    {
      title: 'Integration Settings',
      icon: Globe,
      color: 'indigo',
      settings: [
        { name: 'API Access', value: integrationSettings.apiAccess ? 'Enabled' : 'Disabled', type: 'toggle', key: 'apiAccess', enabled: integrationSettings.apiAccess },
        { name: 'API Rate Limit', value: `${integrationSettings.apiRateLimit} requests/hour`, type: 'number', key: 'apiRateLimit' },
        { name: 'Webhook URL', value: integrationSettings.webhookUrl, type: 'text', key: 'webhookUrl' },
        { name: 'Third-party Apps', value: integrationSettings.thirdPartyApps, type: 'readonly' },
      ],
      state: integrationSettings,
      setState: setIntegrationSettings,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            <p className="text-red-100 mt-1 text-lg">Configure and manage system-wide settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2 inline" />
              All changes are logged
            </Badge>
          </div>
        </div>
      </div>

      {/* Module Configuration */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Module Management</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Enable or disable system modules
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulesConfig.map((module, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${module.enabled ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{module.name}</h4>
                  <Badge variant={module.enabled ? 'default' : 'secondary'}>
                    {module.enabled ? 'ACTIVE' : 'DISABLED'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{module.users} active users</p>
                <Button
                  size="sm"
                  variant={module.enabled ? 'outline' : 'default'}
                  className="w-full"
                  onClick={() => handleModuleToggle(module.name)}
                >
                  {module.enabled ? 'Disable' : 'Enable'} Module
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Settings */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Company Information</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Configure company details used in invoices, quotations, and reports
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100">
              <TabsTrigger value="general" className="data-[state=active]:bg-white">General</TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-white">Contact</TabsTrigger>
              <TabsTrigger value="address" className="data-[state=active]:bg-white">Address</TabsTrigger>
              <TabsTrigger value="invoice" className="data-[state=active]:bg-white">Invoice</TabsTrigger>
              <TabsTrigger value="banking" className="data-[state=active]:bg-white">Banking</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, companyName: e.target.value }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL *</Label>
                  <Input
                    id="logoUrl"
                    value={companySettings.logoUrl}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (Optional)</Label>
                <Input
                  id="tagline"
                  value={companySettings.tagline || ''}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Your company tagline"
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID *</Label>
                  <Input
                    id="taxId"
                    value={companySettings.taxInfo.taxId}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      taxInfo: { ...prev.taxInfo, taxId: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={companySettings.taxInfo.registrationNumber || ''}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      taxInfo: { ...prev.taxInfo, registrationNumber: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={companySettings.contact.phone}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.contact.email}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={companySettings.contact.website || ''}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, website: e.target.value }
                  }))}
                  placeholder="https://yourwebsite.com"
                  className="bg-white border-gray-300"
                />
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={companySettings.address.street}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={companySettings.address.city}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={companySettings.address.state}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={companySettings.address.country}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    value={companySettings.address.zipCode}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invoice" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">Terms and Conditions *</Label>
                <Textarea
                  id="termsAndConditions"
                  value={companySettings.invoiceSettings.termsAndConditions}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    invoiceSettings: { ...prev.invoiceSettings, termsAndConditions: e.target.value }
                  }))}
                  rows={6}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms *</Label>
                <Textarea
                  id="paymentTerms"
                  value={companySettings.invoiceSettings.paymentTerms}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    invoiceSettings: { ...prev.invoiceSettings, paymentTerms: e.target.value }
                  }))}
                  rows={3}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultDueDays">Default Due Days *</Label>
                  <Input
                    id="defaultDueDays"
                    type="number"
                    value={companySettings.invoiceSettings.defaultDueDays}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      invoiceSettings: { ...prev.invoiceSettings, defaultDueDays: parseInt(e.target.value) || 30 }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFeePolicy">Late Fee Policy</Label>
                  <Input
                    id="lateFeePolicy"
                    value={companySettings.invoiceSettings.lateFeePolicy || ''}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      invoiceSettings: { ...prev.invoiceSettings, lateFeePolicy: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  value={companySettings.invoiceSettings.footerText || ''}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    invoiceSettings: { ...prev.invoiceSettings, footerText: e.target.value }
                  }))}
                  placeholder="Thank you for your business!"
                  className="bg-white border-gray-300"
                />
              </div>
            </TabsContent>

            <TabsContent value="banking" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={companySettings.banking.bankName}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    banking: { ...prev.banking, bankName: e.target.value }
                  }))}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={companySettings.banking.accountNumber}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      banking: { ...prev.banking, accountNumber: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number *</Label>
                  <Input
                    id="routingNumber"
                    value={companySettings.banking.routingNumber}
                    onChange={(e) => setCompanySettings(prev => ({
                      ...prev,
                      banking: { ...prev.banking, routingNumber: e.target.value }
                    }))}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  value={companySettings.banking.swiftCode || ''}
                  onChange={(e) => setCompanySettings(prev => ({
                    ...prev,
                    banking: { ...prev.banking, swiftCode: e.target.value }
                  }))}
                  className="bg-white border-gray-300"
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" className="bg-white border-gray-300" onClick={handleCompanySettingsReset}>
              Reset Changes
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCompanySettingsSave}>
              Save Company Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsGroups.map((group, groupIndex) => {
          const IconComponent = group.icon;
          return (
            <Card key={groupIndex} className="shadow-lg">
              <CardHeader className={`bg-${group.color}-50 rounded-t-lg`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${group.color}-100 rounded-lg`}>
                    <IconComponent className={`h-5 w-5 text-${group.color}-600`} />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{group.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {group.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{setting.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{setting.type}</p>
                      </div>
                      {setting.type === 'toggle' ? (
                        <div className="flex items-center space-x-2">
                          <Badge variant={(setting as any).enabled ? 'default' : 'secondary'}>
                            {setting.value}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => handleSettingToggle(group.title, (setting as any).key)}>
                            Toggle
                          </Button>
                        </div>
                      ) : setting.type === 'readonly' ? (
                        <Badge variant="outline">{setting.value}</Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => {
                          setCurrentEditGroup(group.title);
                          setEditDialogOpen(true);
                        }}>
                          Edit
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700" onClick={() => handleGroupSave(group.title)}>
                  Save {group.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Settings */}
      <Card className="shadow-lg border-2 border-red-200">
        <CardHeader className="bg-linear-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-900">Advanced Settings</CardTitle>
          <CardDescription className="text-red-600 font-semibold">
            ⚠️ Caution: Changes here can affect system stability
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-between" onClick={() => handleAdvancedAction('clearCache')}>
              <span>Clear System Cache</span>
              <Badge variant="secondary">2.1 GB</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => handleAdvancedAction('rebuildIndexes')}>
              <span>Rebuild Database Indexes</span>
              <Badge variant="secondary">Last: 5 days ago</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => handleAdvancedAction('exportLogs')}>
              <span>Export System Logs</span>
              <Badge variant="secondary">128 MB</Badge>
            </Button>
            <Button variant="destructive" className="w-full" onClick={() => handleAdvancedAction('factoryReset')}>
              Reset to Factory Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Settings Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle>Edit {currentEditGroup} Settings</DialogTitle>
            <DialogDescription>
              Make changes to your {currentEditGroup.toLowerCase()} settings here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentEditGroup && settingsGroups.find(g => g.title === currentEditGroup)?.settings
              .filter(setting => setting.type !== 'readonly' && setting.type !== 'toggle')
              .map((setting, index) => {
                const currentGroupState = settingsGroups.find(g => g.title === currentEditGroup)?.state as any;
                return (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`edit-${setting.key}`}>{setting.name}</Label>
                  {setting.type === 'text' || setting.type === 'email' ? (
                    <Input
                      id={`edit-${setting.key}`}
                      type={setting.type}
                      defaultValue={currentGroupState?.[setting.key!] || ''}
                      onChange={(e) => currentEditGroup && setting.key && handleSettingEdit(currentEditGroup, setting.key, e.target.value)}
                      className="bg-white border-gray-300"
                    />
                  ) : setting.type === 'number' ? (
                    <Input
                      id={`edit-${setting.key}`}
                      type="number"
                      defaultValue={currentGroupState?.[setting.key!] || ''}
                      onChange={(e) => currentEditGroup && setting.key && handleSettingEdit(currentEditGroup, setting.key, parseInt(e.target.value) || 0)}
                      className="bg-white border-gray-300"
                    />
                  ) : setting.type === 'select' ? (
                    <Select
                      defaultValue={currentGroupState?.[setting.key!] || ''}
                      onValueChange={(value) => currentEditGroup && setting.key && handleSettingEdit(currentEditGroup, setting.key, value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {setting.key === 'timezone' && (
                          <>
                            <SelectItem value="UTC-05:00 (EST)">UTC-05:00 (EST)</SelectItem>
                            <SelectItem value="UTC-06:00 (CST)">UTC-06:00 (CST)</SelectItem>
                            <SelectItem value="UTC-07:00 (MST)">UTC-07:00 (MST)</SelectItem>
                            <SelectItem value="UTC-08:00 (PST)">UTC-08:00 (PST)</SelectItem>
                          </>
                        )}
                        {setting.key === 'dateFormat' && (
                          <>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </>
                        )}
                        {setting.key === 'currency' && (
                          <>
                            <SelectItem value="AED (د.إ)">AED (د.إ)</SelectItem>
                            <SelectItem value="USD ($)">USD ($)</SelectItem>
                            <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                            <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                            <SelectItem value="CAD (C$)">CAD (C$)</SelectItem>
                          </>
                        )}
                        {setting.key === 'alertThreshold' && (
                          <>
                            <SelectItem value="High Priority Only">High Priority Only</SelectItem>
                            <SelectItem value="Medium and High">Medium and High</SelectItem>
                            <SelectItem value="All Alerts">All Alerts</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
                );
              })}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={() => {
              handleGroupSave(currentEditGroup);
              setEditDialogOpen(false);
            }} className="bg-red-600 hover:bg-red-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>
              {confirmAction?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="bg-white border-gray-300">
              Cancel
            </Button>
            <Button onClick={confirmAction?.action} className="bg-red-600 hover:bg-red-700">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
