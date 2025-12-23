'use client';

import { useState } from 'react';
import { FileText, DollarSign, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCurrencyStore } from '@/stores/currency';
import { toast } from 'sonner';

interface ViewPayslipDialogProps {
  children: React.ReactNode;
}

export function ViewPayslipDialog({ children }: ViewPayslipDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('december-2024');
  const { formatCurrency } = useCurrencyStore();

  // Mock payslip data
  const payslipData = {
    'december-2024': {
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      department: 'Engineering',
      period: 'December 1-31, 2024',
      basicSalary: 5000,
      hra: 1000,
      conveyance: 200,
      medical: 300,
      lta: 500,
      specialAllowance: 800,
      totalEarnings: 7800,
      providentFund: 600,
      professionalTax: 50,
      incomeTax: 400,
      totalDeductions: 1050,
      netSalary: 6750,
      status: 'paid'
    },
    'november-2024': {
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      department: 'Engineering',
      period: 'November 1-30, 2024',
      basicSalary: 5000,
      hra: 1000,
      conveyance: 200,
      medical: 300,
      lta: 500,
      specialAllowance: 800,
      totalEarnings: 7800,
      providentFund: 600,
      professionalTax: 50,
      incomeTax: 400,
      totalDeductions: 1050,
      netSalary: 6750,
      status: 'paid'
    }
  };

  const currentPayslip = payslipData[selectedMonth as keyof typeof payslipData];

  const handleDownload = () => {
    toast.success('Payslip downloaded successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Payslip</span>
          </DialogTitle>
          <DialogDescription>
            View and download your salary details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month Selector */}
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Select Month:</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="december-2024">December 2024</SelectItem>
                <SelectItem value="november-2024">November 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payslip Content */}
          <div className="border rounded-lg p-6 bg-gray-50">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">SBR Solutions</h3>
              <p className="text-sm text-gray-600">Salary Slip</p>
              <Badge
                variant={currentPayslip.status === 'paid' ? 'default' : 'secondary'}
                className="mt-2"
              >
                {currentPayslip.status.toUpperCase()}
              </Badge>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Employee Name</p>
                <p className="font-medium">{currentPayslip.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employee ID</p>
                <p className="font-medium">{currentPayslip.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{currentPayslip.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pay Period</p>
                <p className="font-medium">{currentPayslip.period}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Earnings */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Earnings
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">HRA</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conveyance</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.conveyance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Medical</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.medical)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">LTA</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.lta)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Special Allowance</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.specialAllowance)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Earnings</span>
                  <span>{formatCurrency(currentPayslip.totalEarnings)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Deductions */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Deductions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Provident Fund</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.providentFund)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Professional Tax</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.professionalTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Income Tax</span>
                  <span className="font-medium">{formatCurrency(currentPayslip.incomeTax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(currentPayslip.totalDeductions)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Net Salary */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentPayslip.netSalary)}
              </div>
              <p className="text-sm text-gray-600">Net Salary</p>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-end">
            <Button onClick={handleDownload} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Payslip</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}