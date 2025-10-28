'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

// match real API shape
type WorkOrder = {
  id: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  product: {
    id: string;
    name: string;
  };
  assignedEmployee?: {
    id: string;
    name: string;
  };
};

export default function UpdateWorkOrderStatusPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [status, setStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>('PLANNED');
  const [productName, setProductName] = useState<string>('Loading...');
  const [employeeName, setEmployeeName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch work order details
  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const res = await fetch(`https://erp-backend-production-3dd4.up.railway.app/api/production/work-orders/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Error fetching work order: ${res.status}`);
        const data: WorkOrder = await res.json();

        setStatus(data.status);
        setProductName(data.product?.name || 'Unknown Product');
        setEmployeeName(data.assignedEmployee?.name || 'Unassigned');
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (token && id) fetchWorkOrder();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://erp-backend-production-3dd4.up.railway.app/api/production/work-orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update status. Status: ${res.status}`);
      }

      router.push('/production');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Update Work Order Status</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
          >
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Work Order Info */}
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Product:</span> {productName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Assigned Employee:</span> {employeeName}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{loading ? 'Updating...' : 'Update Status'}</span>
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
