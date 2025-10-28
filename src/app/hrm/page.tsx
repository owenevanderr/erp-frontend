'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useEffect, useState } from 'react';
import { Plus, Search, Users, UserCheck, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  department?: string;
  hireDate?: string;
  createdAt?: string;
}

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}

// ✅ Fix: Prisma Decimal is string in JSON
interface Payroll {
  id: string;
  employeeId: string;
  baseSalary: string;
  deductions: string;
  netSalary: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export default function HRMPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // fetch employees + attendance
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('https://erp-backend-production-3dd4.up.railway.app/api/hrm/employees', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch employees');
        setEmployees(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAttendance = async () => {
      try {
        const res = await fetch('https://erp-backend-production-3dd4.up.railway.app/api/hrm/attendance', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        setAttendance(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    if (user && token) {
      Promise.all([fetchEmployees(), fetchAttendance()]).finally(() =>
        setLoading(false)
      );
    }
  }, [user, token]);

  // handle delete employee
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`https://erp-backend-production-3dd4.up.railway.app/api/hrm/employees/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete employee');

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  // filter employees
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // map latest attendance by employeeId
  const latestAttendanceMap: Record<string, Attendance | undefined> = {};
  attendance.forEach((att) => {
    const existing = latestAttendanceMap[att.employeeId];
    if (!existing || new Date(att.date) > new Date(existing.date)) {
      latestAttendanceMap[att.employeeId] = att;
    }
  });

  // fetch payroll
  const fetchPayroll = async () => {
    if (!employeeId || !month || !year) return;
    try {
      const res = await fetch(
        `https://erp-backend-production-3dd4.up.railway.app/api/hrm/payroll?employeeId=${employeeId}&month=${month}&year=${year}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch payroll');
      const data = await res.json();
      setPayroll(data[0] ?? null); // ✅ backend returns array
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Human Resource Management
              </h1>
              <p className="text-gray-600">
                Manage employees, attendance, and payroll
              </p>
            </div>
            <button
              onClick={() => router.push('/hrm/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'employees', name: 'Employees', icon: Users },
                { id: 'attendance', name: 'Attendance', icon: UserCheck },
                { id: 'payroll', name: 'Payroll', icon: DollarSign },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Search */}
          {['employees', 'attendance'].includes(activeTab) && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Employees tab */}
          {activeTab === 'employees' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  Loading employees...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No employees found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hire Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            {employee.name}
                          </td>
                          <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
                            {employee.position}
                          </td>
                          <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-900">
                            ${Number(employee.salary).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
                            {employee.hireDate
                              ? new Date(employee.hireDate).toLocaleDateString()
                              : new Date(employee.createdAt ?? '').toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => router.push(`/hrm/update/${employee.id}`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(employee.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Attendance tab */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  Loading attendance...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No employees found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Latest Attendance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => {
                        const latest = latestAttendanceMap[employee.id];
                        return (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                              {employee.name}
                            </td>
                            <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
                              {employee.position}
                            </td>
                            <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-900">
                              {latest
                                ? `${latest.status} (${new Date(latest.date).toLocaleDateString()})`
                                : 'No record'}
                            </td>
                            <td className="px-6 py-4 text-left">
                              <Link
                                href={`/hrm/attendance/${employee.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Attendance
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payroll tab */}
          {activeTab === 'payroll' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
              <div className="flex space-x-4">
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  placeholder="Month"
                  className="border border-gray-300 rounded-md px-3 py-2 w-24"
                />
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  placeholder="Year"
                  className="border border-gray-300 rounded-md px-3 py-2 w-28"
                />
                <button
                  onClick={fetchPayroll}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Fetch Payroll
                </button>
              </div>

              {payroll ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Base Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deductions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month / Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${Number(payroll.baseSalary).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          -${Number(payroll.deductions).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                          ${Number(payroll.netSalary).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {payroll.month}/{payroll.year}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">No payroll data</div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
