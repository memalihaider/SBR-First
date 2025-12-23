// // lib/salary.ts
// import { db } from './firebase';
// import { 
//   collection, 
//   doc, 
//   getDocs, 
//   addDoc, 
//   updateDoc, 
//   query, 
//   where, 
//   Timestamp 
// } from 'firebase/firestore';

// export interface Employee {
//   id: string;
//   name: string;
//   position: string;
//   department: string;
//   salary: number;
//   email: string;
//   phone: string;
//   joinDate: string;
//   manager: string;
//   status: string;
//   address: string;
//   skills: string[];
//   createdAt: Timestamp;
// }

// export interface SalaryRecord {
//   id?: string;
//   employeeId: string;
//   employeeName: string;
//   month: string;
//   year: number;
//   basicSalary: number;
//   allowances: Allowance[];
//   deductions: Deduction[];
//   netPay: number;
//   status: 'paid' | 'pending' | 'processed';
//   paymentDate?: string;
//   paymentMethod: string;
//   createdAt: Timestamp;
// }

// export interface Allowance {
//   type: string;
//   amount: number;
// }

// export interface Deduction {
//   type: string;
//   amount: number;
// }

// export async function fetchEmployees(): Promise<Employee[]> {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'employeeList'));
//     const employees: Employee[] = [];
    
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       employees.push({
//         id: doc.id,
//         name: data.name || '',
//         position: data.position || '',
//         department: data.department || '',
//         salary: data.salary || 0,
//         email: data.email || '',
//         phone: data.phone || '',
//         joinDate: data.joinDate || '',
//         manager: data.manager || '',
//         status: data.status || 'active',
//         address: data.address || '',
//         skills: data.skills || [],
//         createdAt: data.createdAt || Timestamp.now(),
//       });
//     });
    
//     return employees;
//   } catch (error) {
//     console.error('Error fetching employees:', error);
//     throw error;
//   }
// }

// export async function fetchSalaryRecords(month: string): Promise<SalaryRecord[]> {
//   try {
//     const q = query(
//       collection(db, 'salaryManagement'),
//       where('month', '==', month)
//     );
//     const querySnapshot = await getDocs(q);
//     const records: SalaryRecord[] = [];
    
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       records.push({
//         id: doc.id,
//         employeeId: data.employeeId,
//         employeeName: data.employeeName,
//         month: data.month,
//         year: data.year,
//         basicSalary: data.basicSalary,
//         allowances: data.allowances || [],
//         deductions: data.deductions || [],
//         netPay: data.netPay,
//         status: data.status,
//         paymentDate: data.paymentDate,
//         paymentMethod: data.paymentMethod,
//         createdAt: data.createdAt,
//       });
//     });
    
//     return records;
//   } catch (error) {
//     console.error('Error fetching salary records:', error);
//     throw error;
//   }
// }

// export async function saveSalaryRecord(record: Omit<SalaryRecord, 'id'>): Promise<string> {
//   try {
//     const docRef = await addDoc(collection(db, 'salaryManagement'), {
//       ...record,
//       createdAt: Timestamp.now(),
//     });
//     return docRef.id;
//   } catch (error) {
//     console.error('Error saving salary record:', error);
//     throw error;
//   }
// }

// export async function updateSalaryStatus(recordId: string, status: SalaryRecord['status']): Promise<void> {
//   try {
//     const docRef = doc(db, 'salaryManagement', recordId);
//     await updateDoc(docRef, {
//       status,
//       paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
//     });
//   } catch (error) {
//     console.error('Error updating salary status:', error);
//     throw error;
//   }
// }

// export async function generatePayroll(month: string, year: number): Promise<SalaryRecord[]> {
//   try {
//     const employees = await fetchEmployees();
//     const existingRecords = await fetchSalaryRecords(month);
    
//     const newRecords: SalaryRecord[] = [];
    
//     for (const employee of employees) {
//       const existingRecord = existingRecords.find(record => record.employeeId === employee.id);
      
//       if (!existingRecord && employee.status === 'active') {
//         const basicSalary = employee.salary;
//         const allowances: Allowance[] = [
//           { type: 'Basic Salary', amount: basicSalary },
//           { type: 'House Rent', amount: basicSalary * 0.4 },
//           { type: 'Medical', amount: 1500 },
//         ];
        
//         const deductions: Deduction[] = [
//           { type: 'Income Tax', amount: basicSalary * 0.1 },
//           { type: 'Provident Fund', amount: basicSalary * 0.05 },
//         ];
        
//         const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
//         const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
//         const netPay = totalAllowances - totalDeductions;
        
//         const newRecord: Omit<SalaryRecord, 'id'> = {
//           employeeId: employee.id,
//           employeeName: employee.name,
//           month,
//           year,
//           basicSalary,
//           allowances,
//           deductions,
//           netPay,
//           status: 'pending',
//           paymentMethod: 'Bank Transfer',
//           createdAt: Timestamp.now(),
//         };
        
//         const recordId = await saveSalaryRecord(newRecord);
//         newRecords.push({ ...newRecord, id: recordId });
//       }
//     }
    
//     return newRecords;
//   } catch (error) {
//     console.error('Error generating payroll:', error);
//     throw error;
//   }
// }

// export async function getPayrollStats(month: string) {
//   try {
//     const records = await fetchSalaryRecords(month);
//     const employees = await fetchEmployees();
    
//     const totalEmployees = employees.filter(e => e.status === 'active').length;
//     const processedPayrolls = records.filter(r => r.status === 'paid' || r.status === 'processed').length;
//     const pendingPayrolls = records.filter(r => r.status === 'pending').length;
//     const totalPayrollAmount = records.reduce((sum, r) => sum + r.netPay, 0);
    
//     return {
//       totalEmployees,
//       processedPayrolls,
//       pendingPayrolls,
//       totalPayrollAmount,
//       records,
//     };
//   } catch (error) {
//     console.error('Error getting payroll stats:', error);
//     throw error;
//   }
// }




// new code
// lib/salary.ts
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  getDoc
} from 'firebase/firestore';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  email: string;
  phone: string;
  joinDate: string;
  manager: string;
  status: string;
  address: string;
  skills: string[];
  createdAt: Timestamp;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  salary: number;
  department: string;
  departmentName: string;
  position: string;
  isManager: boolean;
  role: string;
  status: string;
  budget: string;
  employeesCount: number;
  growth: string;
}

export interface SalaryRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  netPay: number;
  status: 'paid' | 'pending' | 'processed';
  paymentDate?: string;
  paymentMethod: string;
  createdAt: Timestamp;
  isManager?: boolean;
}

export interface Allowance {
  type: string;
  amount: number;
}

export interface Deduction {
  type: string;
  amount: number;
}

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'employeeList'));
    const employees: Employee[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      employees.push({
        id: doc.id,
        name: data.name || '',
        position: data.position || '',
        department: data.department || '',
        salary: data.salary || 0,
        email: data.email || '',
        phone: data.phone || '',
        joinDate: data.joinDate || '',
        manager: data.manager || '',
        status: data.status || 'active',
        address: data.address || '',
        skills: data.skills || [],
        createdAt: data.createdAt || Timestamp.now(),
      });
    });
    
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

export async function fetchManagers(): Promise<Manager[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'departments'));
    const managers: Manager[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.head) {
        managers.push({
          id: `manager-${doc.id}`,
          name: data.head,
          email: `${data.head.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          phone: '+92 300 0000000',
          salary: 80000, // Default manager salary
          department: data.name || 'Department',
          departmentName: data.name || 'Department',
          position: 'Department Manager',
          isManager: true,
          role: 'Manager',
          status: 'active',
          budget: data.budget || '0',
          employeesCount: data.employees || 0,
          growth: data.growth || '+0%',
        });
      }
    });
    
    return managers;
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
}

export async function fetchSalaryRecords(month: string): Promise<SalaryRecord[]> {
  try {
    const q = query(
      collection(db, 'salaryManagement'),
      where('month', '==', month)
    );
    const querySnapshot = await getDocs(q);
    const records: SalaryRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        month: data.month,
        year: data.year,
        basicSalary: data.basicSalary,
        allowances: data.allowances || [],
        deductions: data.deductions || [],
        netPay: data.netPay,
        status: data.status,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        createdAt: data.createdAt,
        isManager: data.isManager || false,
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error fetching salary records:', error);
    throw error;
  }
}

export async function saveSalaryRecord(record: Omit<SalaryRecord, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'salaryManagement'), {
      ...record,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving salary record:', error);
    throw error;
  }
}

export async function updateSalaryStatus(employeeId: string, month: string, status: SalaryRecord['status']): Promise<void> {
  try {
    // First, find the salary record for this employee and month
    const q = query(
      collection(db, 'salaryManagement'),
      where('employeeId', '==', employeeId),
      where('month', '==', month)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // If no record exists, create one
      
      // Check if it's a manager
      const isManager = employeeId.startsWith('manager-');
      let staffData: any = null;
      
      if (isManager) {
        // Get manager data from departments
        const managerId = employeeId.replace('manager-', '');
        const deptDoc = await getDoc(doc(db, 'departments', managerId));
        
        if (deptDoc.exists()) {
          const deptData = deptDoc.data();
          staffData = {
            name: deptData.head || 'Manager',
            salary: 80000,
            department: deptData.name || 'Department'
          };
        }
      } else {
        // Get employee data
        const empDoc = await getDoc(doc(db, 'employeeList', employeeId));
        if (empDoc.exists()) {
          const empData = empDoc.data();
          staffData = {
            name: empData.name || '',
            salary: empData.salary || 0,
            department: empData.department || 'Unknown'
          };
        }
      }
      
      if (!staffData) {
        throw new Error(`Staff with ID ${employeeId} not found`);
      }
      
      const basicSalary = staffData.salary;
      const allowances: Allowance[] = [
        { type: 'Basic Salary', amount: basicSalary },
        { type: 'House Rent', amount: basicSalary * 0.4 },
        { type: 'Medical', amount: 1500 },
      ];
      
      const deductions: Deduction[] = [
        { type: 'Income Tax', amount: basicSalary * 0.1 },
        { type: 'Provident Fund', amount: basicSalary * 0.05 },
      ];
      
      const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
      const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const netPay = totalAllowances - totalDeductions;
      
      const newRecord: Omit<SalaryRecord, 'id'> = {
        employeeId: employeeId,
        employeeName: staffData.name,
        month,
        year: new Date().getFullYear(),
        basicSalary,
        allowances,
        deductions,
        netPay,
        status: status,
        paymentMethod: 'Bank Transfer',
        createdAt: Timestamp.now(),
        isManager: isManager
      };
      
      await saveSalaryRecord(newRecord);
    } else {
      // Update existing record
      querySnapshot.forEach(async (docSnapshot) => {
        const docRef = doc(db, 'salaryManagement', docSnapshot.id);
        await updateDoc(docRef, {
          status,
          paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
          updatedAt: Timestamp.now(),
        });
      });
    }
  } catch (error) {
    console.error('Error updating salary status:', error);
    throw error;
  }
}

export async function generatePayroll(month: string, year: number): Promise<SalaryRecord[]> {
  try {
    const employees = await fetchEmployees();
    const managers = await fetchManagers();
    const existingRecords = await fetchSalaryRecords(month);
    
    const newRecords: SalaryRecord[] = [];
    
    // Process employees
    for (const employee of employees) {
      const existingRecord = existingRecords.find(record => record.employeeId === employee.id);
      
      if (!existingRecord && employee.status === 'active') {
        const basicSalary = employee.salary;
        const allowances: Allowance[] = [
          { type: 'Basic Salary', amount: basicSalary },
          { type: 'House Rent', amount: basicSalary * 0.4 },
          { type: 'Medical', amount: 1500 },
        ];
        
        const deductions: Deduction[] = [
          { type: 'Income Tax', amount: basicSalary * 0.1 },
          { type: 'Provident Fund', amount: basicSalary * 0.05 },
        ];
        
        const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
        const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
        const netPay = totalAllowances - totalDeductions;
        
        const newRecord: Omit<SalaryRecord, 'id'> = {
          employeeId: employee.id,
          employeeName: employee.name,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          netPay,
          status: 'pending',
          paymentMethod: 'Bank Transfer',
          createdAt: Timestamp.now(),
          isManager: false,
        };
        
        const recordId = await saveSalaryRecord(newRecord);
        newRecords.push({ ...newRecord, id: recordId });
      }
    }
    
    // Process managers
    for (const manager of managers) {
      const existingRecord = existingRecords.find(record => record.employeeId === manager.id);
      
      if (!existingRecord) {
        const basicSalary = manager.salary;
        const allowances: Allowance[] = [
          { type: 'Basic Salary', amount: basicSalary },
          { type: 'House Rent', amount: basicSalary * 0.4 },
          { type: 'Medical', amount: 1500 },
          { type: 'Manager Allowance', amount: 10000 },
        ];
        
        const deductions: Deduction[] = [
          { type: 'Income Tax', amount: basicSalary * 0.15 },
          { type: 'Provident Fund', amount: basicSalary * 0.08 },
        ];
        
        const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
        const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
        const netPay = totalAllowances - totalDeductions;
        
        const newRecord: Omit<SalaryRecord, 'id'> = {
          employeeId: manager.id,
          employeeName: manager.name,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          netPay,
          status: 'pending',
          paymentMethod: 'Bank Transfer',
          createdAt: Timestamp.now(),
          isManager: true,
        };
        
        const recordId = await saveSalaryRecord(newRecord);
        newRecords.push({ ...newRecord, id: recordId });
      }
    }
    
    return newRecords;
  } catch (error) {
    console.error('Error generating payroll:', error);
    throw error;
  }
}

export async function getPayrollStats(month: string) {
  try {
    const records = await fetchSalaryRecords(month);
    const employees = await fetchEmployees();
    const managers = await fetchManagers();
    
    const totalEmployees = employees.filter(e => e.status === 'active').length;
    const totalManagers = managers.length;
    const totalStaff = totalEmployees + totalManagers;
    
    const processedPayrolls = records.filter(r => r.status === 'paid' || r.status === 'processed').length;
    const pendingPayrolls = records.filter(r => r.status === 'pending').length;
    const totalPayrollAmount = records.reduce((sum, r) => sum + r.netPay, 0);
    
    // Calculate total budget from departments
    let totalBudget = 0;
    const deptSnapshot = await getDocs(collection(db, 'departments'));
    deptSnapshot.forEach((doc) => {
      const data = doc.data();
      totalBudget += parseInt(data.budget || '0');
    });
    
    return {
      totalEmployees,
      totalManagers,
      totalStaff,
      processedPayrolls,
      pendingPayrolls,
      totalPayrollAmount,
      totalBudget,
      records,
    };
  } catch (error) {
    console.error('Error getting payroll stats:', error);
    throw error;
  }
}

// Helper function to get salary record by employee ID and month
export async function getSalaryRecord(employeeId: string, month: string): Promise<SalaryRecord | null> {
  try {
    const q = query(
      collection(db, 'salaryManagement'),
      where('employeeId', '==', employeeId),
      where('month', '==', month)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      month: data.month,
      year: data.year,
      basicSalary: data.basicSalary,
      allowances: data.allowances || [],
      deductions: data.deductions || [],
      netPay: data.netPay,
      status: data.status,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      createdAt: data.createdAt,
      isManager: data.isManager || false,
    };
  } catch (error) {
    console.error('Error getting salary record:', error);
    throw error;
  }
}

// Function to create salary record if not exists
export async function createSalaryRecordIfNotExists(employeeId: string, month: string): Promise<string> {
  try {
    const existingRecord = await getSalaryRecord(employeeId, month);
    
    if (existingRecord) {
      return existingRecord.id!;
    }
    
    // Check if it's a manager
    const isManager = employeeId.startsWith('manager-');
    let staffData: any = null;
    
    if (isManager) {
      // Get manager data from departments
      const managerId = employeeId.replace('manager-', '');
      const deptDoc = await getDoc(doc(db, 'departments', managerId));
      
      if (deptDoc.exists()) {
        const deptData = deptDoc.data();
        staffData = {
          name: deptData.head || 'Manager',
          salary: 80000,
          department: deptData.name || 'Department'
        };
      }
    } else {
      // Get employee data
      const empDoc = await getDoc(doc(db, 'employeeList', employeeId));
      if (empDoc.exists()) {
        const empData = empDoc.data();
        staffData = {
          name: empData.name || '',
          salary: empData.salary || 0,
          department: empData.department || 'Unknown'
        };
      }
    }
    
    if (!staffData) {
      throw new Error(`Staff with ID ${employeeId} not found`);
    }
    
    const basicSalary = staffData.salary;
    const allowances: Allowance[] = [
      { type: 'Basic Salary', amount: basicSalary },
      { type: 'House Rent', amount: basicSalary * 0.4 },
      { type: 'Medical', amount: 1500 },
    ];
    
    const deductions: Deduction[] = [
      { type: 'Income Tax', amount: basicSalary * 0.1 },
      { type: 'Provident Fund', amount: basicSalary * 0.05 },
    ];
    
    const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
    const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    const netPay = totalAllowances - totalDeductions;
    
    const newRecord: Omit<SalaryRecord, 'id'> = {
      employeeId: employeeId,
      employeeName: staffData.name,
      month,
      year: new Date().getFullYear(),
      basicSalary,
      allowances,
      deductions,
      netPay,
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      createdAt: Timestamp.now(),
      isManager: isManager
    };
    
    return await saveSalaryRecord(newRecord);
  } catch (error) {
    console.error('Error creating salary record:', error);
    throw error;
  }
}