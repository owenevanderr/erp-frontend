'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
}

export default function EmployeeAttendancePage() {
  const { token } = useAuth();
  const params = useParams();
  const employeeId = params?.employeeId as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId || !token) return;

    const fetchEmployee = async () => {
      try {
        const res = await fetch(
          `https://erp-backend-production-3dd4.up.railway.app/api/hrm/employees/${employeeId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch employee');
        setEmployee(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAttendance = async () => {
      try {
        const res = await fetch(
          `https://erp-backend-production-3dd4.up.railway.app/api/hrm/attendance?employeeId=${employeeId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch attendance');
        setAttendance(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([fetchEmployee(), fetchAttendance()]).finally(() =>
      setLoading(false)
    );
  }, [employeeId, token]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee
                  ? `${employee.name}'s Attendance`
                  : 'Attendance History'}
              </h1>
              {employee && (
                <p className="text-gray-600">Position: {employee.position}</p>
              )}
            </div>
            <Link
              href="/hrm"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Back to HRM
            </Link>
          </div>

          {/* Attendance History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Loading attendance history...
              </div>
            ) : attendance.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No attendance records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((att) => (
                        <tr key={att.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
                            {att.status}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
