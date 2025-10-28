'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Package, Users, DollarSign, Factory, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalProducts: number;
  activeEmployees: number;
  monthlyRevenue: number;
  activeOrders: number;
  productChange: string;
  employeeChange: string;
  revenueChange: string;
  orderChange: string;
}

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setStats({
      totalProducts: 1234,
      activeEmployees: 45,
      monthlyRevenue: 12345,
      activeOrders: 23,
      productChange: '+12%',
      employeeChange: '+3%',
      revenueChange: '+8%',
      orderChange: '-2%',
    });

    setActivities([
      { id: 1, action: 'New product added', user: 'John Doe', time: '2 minutes ago', type: 'success' },
      { id: 2, action: 'Stock alert triggered', user: 'System', time: '15 minutes ago', type: 'warning' },
      { id: 3, action: 'Employee attendance recorded', user: 'Jane Smith', time: '1 hour ago', type: 'info' },
    ]);

    setLowStockItems([
      { id: 1, name: 'Widget A', sku: 'WGT-001', stock: 5, threshold: 10 },
      { id: 2, name: 'Component B', sku: 'CMP-002', stock: 3, threshold: 15 },
    ]);

    setLoading(false);
  }, []);

  if (loading || !stats) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const statsData = [
    { name: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, change: stats.productChange },
    { name: 'Active Employees', value: stats.activeEmployees.toString(), icon: Users, change: stats.employeeChange },
    { name: 'Monthly Revenue', value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, change: stats.revenueChange },
    { name: 'Active Orders', value: stats.activeOrders.toString(), icon: Factory, change: stats.orderChange },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {activities.map((activity) => (
                    <li key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-500' : activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" /> Low Stock Alert
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {lowStockItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">{item.stock}</p>
                        <p className="text-xs text-gray-500">Threshold: {item.threshold}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
