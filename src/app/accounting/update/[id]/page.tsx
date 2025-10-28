'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  description?: string;
  customerId?: string | null;
  supplierId?: string | null;
}

export default function UpdateTransactionPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams(); // get route param
  const { id } = params as { id: string };

  const [type, setType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_OUT');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers + suppliers + transaction
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        const [customersRes, suppliersRes, transactionRes] = await Promise.all([
          fetch('https://erp-backend-production-3dd4.up.railway.app/api/crm/customers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://erp-backend-production-3dd4.up.railway.app/api/inventory/suppliers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`https://erp-backend-production-3dd4.up.railway.app/api/accounting/transactions/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!customersRes.ok) throw new Error(`Failed to fetch customers: ${customersRes.status}`);
        if (!suppliersRes.ok) throw new Error(`Failed to fetch suppliers: ${suppliersRes.status}`);
        if (!transactionRes.ok) throw new Error(`Failed to fetch transaction: ${transactionRes.status}`);

        const customersData: Customer[] = await customersRes.json();
        const suppliersData: Supplier[] = await suppliersRes.json();
        const transactionData: Transaction = await transactionRes.json();

        setCustomers(customersData);
        setSuppliers(suppliersData);

        // prefill transaction data
        setType(transactionData.type);
        setAmount(transactionData.amount);
        setDescription(transactionData.description || '');
        setCustomerId(transactionData.customerId || '');
        setSupplierId(transactionData.supplierId || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      }
    };

    if (token && id) {
      fetchData();
    }
  }, [token, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://erp-backend-production-3dd4.up.railway.app/api/accounting/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          amount,
          description,
          customerId: customerId || null,
          supplierId: supplierId || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update transaction: ${res.status} ${text}`);
      }

      router.push('/accounting');
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
            <h1 className="text-2xl font-bold text-gray-900">Update Transaction</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
          >
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'CASH_IN' | 'CASH_OUT')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CASH_IN">Cash In</option>
                <option value="CASH_OUT">Cash Out</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. beli barang"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer (optional)</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Customer --</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier (optional)</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
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
                <span>{loading ? 'Updating...' : 'Update Transaction'}</span>
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
