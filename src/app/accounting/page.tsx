'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, FileText, BarChart3} from 'lucide-react';
import { accountingApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  description?: string;
  date: string;
  customer?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
}

interface MonthlyStats {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuth();
  const router = useRouter();

  const mockReports: MonthlyStats[] = [
    { month: 'January', revenue: 12000, expenses: 8000, profit: 4000 },
    { month: 'February', revenue: 15000, expenses: 9000, profit: 6000 },
    { month: 'March', revenue: 18000, expenses: 10000, profit: 8000 },
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const transactionsData = await accountingApi.getTransactions();
        setTransactions(transactionsData);
      } catch (err: any) {
        console.error('Failed to fetch transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchTransactions();
    }
  }, [user, token]);

  const totalRevenue = transactions
    .filter((t) => t.type === 'CASH_IN')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'CASH_OUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netProfit = totalRevenue - totalExpenses;

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-l text-gray-500 p-6">Loading transactions...</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accounting & Finance</h1>
              <p className="text-gray-600">Manage financial transactions and reports</p>
            </div>
            <button
              onClick={() => router.push('/accounting/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-semibold text-gray-900">${totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Net Profit</p>
                  <p
                    className={`text-2xl font-semibold ${
                      netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${netProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'transactions', name: 'Transactions', icon: FileText },
                { id: 'reports', name: 'Reports', icon: BarChart3 },
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

          {/* Transactions Table */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer / Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>                     
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              t.type === 'CASH_IN'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {t.type === 'CASH_IN' ? 'Cash In' : 'Cash Out'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{t.description || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {t.customer?.name || t.supplier?.name || '-'}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-medium ${
                            t.type === 'CASH_IN' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {t.type === 'CASH_IN' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Table */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Monthly Financial Report</h3>
                <p className="text-sm text-gray-500">Revenue, expenses, and profit analysis</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockReports.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.month}</td>
                        <td className="px-6 py-4 text-sm text-green-600">${r.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-red-600">${r.expenses.toLocaleString()}</td>
                        <td
                          className={`px-6 py-4 text-sm font-medium ${
                            r.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ${r.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
