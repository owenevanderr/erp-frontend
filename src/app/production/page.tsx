'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { Plus, Factory, Calendar, Users, Package, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // 👈 import AuthContext
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  unit: string;
};

type Employee = {
  id: string;
  name: string;
  position: string;
};

type WorkOrder = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  dueDate: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedEmployeeId?: string;
  assignedEmployee?: Employee;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState('workorders');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth(); // 👈 get token from context
  const router = useRouter();

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://erp-backend-production-3dd4.up.railway.app/api/production/work-orders',{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,  // 🔑 Is this included?
      },
        });
        if (!res.ok) throw new Error('Failed to fetch work orders');
        const data: WorkOrder[] = await res.json();
        setWorkOrders(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if(user && token){
      fetchWorkOrders();
    }
  }, [user, token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkOrders = workOrders.filter(
    (order) => statusFilter === 'ALL' || order.status === statusFilter
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
              <p className="text-gray-600">Manage work orders and production schedules</p>
            </div>
            <button
              onClick={() => router.push('/production/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Work Order</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'workorders', name: 'Work Orders', icon: Factory },
                { id: 'schedule', name: 'Schedule', icon: Calendar },
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

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-gray-600">Loading work orders...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : activeTab === 'workorders' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-3">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.product?.name}</div>
                              {order.notes && (
                                <div className="text-sm text-gray-500">{order.notes}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.assignedEmployee?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">Edit</button>
                            <button
                              onClick={() => router.push(`/production/update/${order.id}`)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Update Progress
                            </button>

                            <button className="text-purple-600 hover:text-purple-900">View Details</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Production Schedule</h3>
                <p className="text-sm text-gray-500">Upcoming work orders and deadlines</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {workOrders
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 rounded-full p-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{order.product?.name}</h4>
                            <p className="text-sm text-gray-500">Due: {new Date(order.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">Qty: {order.quantity}</span>
                          <button className="text-blue-600 hover:text-blue-900 text-sm">View Details</button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
