// lib/pdf-generator.ts
import jsPDF from 'jspdf';
import { SalaryRecord, Employee, Allowance, Deduction } from './salary';

interface CustomInvoiceData {
  // Company Information
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  
  // Payment Information
  bankName: string;
  accountNumber: string;
  paymentMethod: string;
  
  // Salary Breakdown
  allowances: Allowance[];
  deductions: Deduction[];
  
  // Additional Content
  additionalNotes: string;
  contactText: string;
  footerText: string;
  
  // Styling
  headerColor: string;
}

export async function generateCustomInvoicePDF(
  payroll: SalaryRecord, 
  employee: Employee,
  customData: CustomInvoiceData
): Promise<Blob> {
  const doc = new jsPDF();
  
  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 220, g: 53, b: 69 };
  };

  const headerColor = hexToRgb(customData.headerColor);

  // Company Header
  doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(customData.companyName, 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(customData.companySubtitle, 105, 22, { align: 'center' });
  doc.setFontSize(9);
  doc.text(customData.companyAddress, 105, 28, { align: 'center' });

  // Invoice Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  let yPosition = 50;

  // Invoice Number and Date
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE #:', 20, yPosition);
  doc.text('DATE:', 120, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(customData.invoiceNumber, 45, yPosition);
  doc.text(customData.invoiceDate, 140, yPosition);
  yPosition += 15;

  // Employee Information
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE INFORMATION:', 20, yPosition);
  yPosition += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Full Name: ${employee.name}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Employee ID: ${employee.id}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Position: ${employee.position}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Department: ${employee.department}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Email: ${employee.email}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Phone: ${employee.phone}`, 25, yPosition);
  yPosition += 10;

  // Payment Information
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION:', 20, yPosition);
  yPosition += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank: ${customData.bankName}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Account Number: ${customData.accountNumber}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Payment Method: ${customData.paymentMethod}`, 25, yPosition);
  yPosition += 5;
  doc.text(`Status: ${payroll.status.toUpperCase()}`, 25, yPosition);
  yPosition += 10;

  // Salary Breakdown Table
  const tableTop = yPosition + 5;
  
  // Table Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(20, tableTop, 170, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, tableTop + 6);
  doc.text('Amount (USD)', 160, tableTop + 6, { align: 'right' });

  let currentY = tableTop + 8;

  // Earnings
  doc.setFont('helvetica', 'bold');
  doc.text('EARNINGS', 25, currentY + 6);
  currentY += 8;
  
  doc.setFont('helvetica', 'normal');
  customData.allowances.forEach((allowance) => {
    doc.text(allowance.type, 30, currentY + 6);
    doc.text(`$${allowance.amount.toLocaleString()}`, 160, currentY + 6, { align: 'right' });
    currentY += 6;
  });

  // Total Earnings
  const totalEarnings = customData.allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Earnings', 25, currentY + 8);
  doc.text(`$${totalEarnings.toLocaleString()}`, 160, currentY + 8, { align: 'right' });
  currentY += 12;

  // Deductions
  doc.setFont('helvetica', 'bold');
  doc.text('DEDUCTIONS', 25, currentY + 6);
  currentY += 8;
  
  doc.setFont('helvetica', 'normal');
  customData.deductions.forEach((deduction) => {
    doc.text(deduction.type, 30, currentY + 6);
    doc.text(`-$${deduction.amount.toLocaleString()}`, 160, currentY + 6, { align: 'right' });
    currentY += 6;
  });

  // Total Deductions
  const totalDeductions = customData.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Deductions', 25, currentY + 8);
  doc.text(`-$${totalDeductions.toLocaleString()}`, 160, currentY + 8, { align: 'right' });
  currentY += 15;

  // Net Pay
  doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
  doc.rect(20, currentY, 170, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAYABLE AMOUNT', 25, currentY + 8);
  doc.text(`$${(totalEarnings - totalDeductions).toLocaleString()}`, 160, currentY + 8, { align: 'right' });
  currentY += 20;

  // Additional Notes
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  const splitNotes = doc.splitTextToSize(customData.additionalNotes, 170);
  doc.text(splitNotes, 105, currentY, { align: 'center' });
  currentY += splitNotes.length * 5 + 5;

  // Contact Information
  doc.setFont('helvetica', 'normal');
  doc.text(`${customData.contactText}: ${customData.companyPhone} | ${customData.companyEmail}`, 105, currentY, { align: 'center' });
  currentY += 10;

  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(customData.footerText, 105, 280, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });

  // Return as Blob
  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}