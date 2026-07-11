/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { getInventory, getOrders } from '@/app/actions';
import { Package, ShoppingCart, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const inv = await getInventory();
      const ord = await getOrders();
      setInventory(inv);
      setOrders(ord);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 3 seconds for the demo
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-500 animate-pulse">Loading dashboard...</div>;
  }

  // Dummy Demand Forecast Data (Stable values to prevent chart fluctuation)
  const forecastData = inventory.map(item => {
    // Generate a stable "random" number based on the product name's length
    // so the chart doesn't jump every 3 seconds.
    const stableRandom = (item.name.length * 3) % 20; 
    return {
      name: item.name,
      stock: item.current_stock,
      predicted_demand: item.current_stock + stableRandom + 5
    };
  });

  return (
    <div className="space-y-8">
      {/* Inventory Section */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <Package className="w-5 h-5" /> Current Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const isLow = item.current_stock <= item.reorder_level;
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border-l-4 shadow-sm bg-gray-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${isLow ? 'border-red-500' : 'border-green-500'}`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  {isLow ? <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Stock:</span>
                  <span className={`font-bold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.current_stock}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reorder Level:</span>
                  <span className="text-gray-700">{item.reorder_level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Orders Section */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <ShoppingCart className="w-5 h-5" /> Procurement Orders
        </h3>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-2 rounded-tl-lg">Item</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 rounded-tr-lg">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{order.product.name}</td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Demand Forecast Chart Section */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-gray-700">
          <TrendingUp className="w-5 h-5 text-green-600" /> 7-Day Demand Forecast
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="stock" name="Current Stock" fill="#9ca3af" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted_demand" name="Predicted Demand" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
