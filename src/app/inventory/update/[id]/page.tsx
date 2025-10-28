'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Save } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  supplierId: string | null;
}

export default function UpdateProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams(); // 👈 get params from URL
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [supplierId, setSupplierId] = useState('');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch('https://erp-backend-production-3dd4.up.railway.app/api/inventory/suppliers', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Error fetching suppliers: ${res.status}`);
        const data: Supplier[] = await res.json();
        setSuppliers(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (token) fetchSuppliers();
  }, [token]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://erp-backend-production-3dd4.up.railway.app/api/inventory/products/${productId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Error fetching product: ${res.status}`);
        const data: Product = await res.json();
        setProduct(data);

        // Pre-fill form
        setName(data.name);
        setStock(data.stock);
        setUnit(data.unit);
        setLowStockThreshold(data.lowStockThreshold);
        setSupplierId(data.supplierId || '');
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (token && productId) fetchProduct();
  }, [token, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://erp-backend-production-3dd4.up.railway.app/api/inventory/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          stock,
          unit,
          lowStockThreshold,
          supplierId: supplierId || null,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update product. Status: ${res.status}`);
      }

      router.push('/inventory');
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
            <h1 className="text-2xl font-bold text-gray-900">Update Product</h1>
          </div>

          {!product ? (
            <p className="text-gray-600">Loading product...</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
            >
              {error && <p className="text-red-600 text-sm">{error}</p>}

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  placeholder="e.g. pcs, box, kg"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
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
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Updating...' : 'Update Product'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
