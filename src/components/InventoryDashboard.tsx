/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { getInventory, getOrders } from '@/app/actions';
import { Package, ShoppingCart, AlertTriangle, CheckCircle, TrendingUp, Cpu, Lightbulb, Activity, Check } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-500 animate-pulse">Loading Agentic Dashboard...</div>;
  }

  // Demand Forecast Data
  const forecastData = inventory.map(item => {
    const stableRandom = (item.name.length * 3) % 20; 
    return {
      name: item.name,
      stock: item.current_stock,
      predicted_demand: item.current_stock + stableRandom + 5
    };
  });

  // Mock Past Sales Data for the Graph
  const pastSalesData = [
    { day: 'Mon', sales: 40 },
    { day: 'Tue', sales: 45 },
    { day: 'Wed', sales: 42 },
    { day: 'Thu', sales: 50 },
    { day: 'Fri', sales: 65 },
    { day: 'Sat', sales: 80 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Section: Inventory & Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Inventory Cards (Takes up 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
            <Package className="w-5 h-5 text-indigo-600" /> Current Stock Levels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.map((item) => {
              const isLow = item.current_stock <= item.reorder_level;
              return (
                <div key={item.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white hover:shadow-md transition-shadow ${isLow ? 'border-red-500' : 'border-emerald-500'}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    {isLow ? <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div className="mt-3 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Stock Left</p>
                      <p className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>{item.current_stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Reorder Lvl</p>
                      <p className="text-sm font-semibold text-gray-600">{item.reorder_level}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: AI Intelligence Panel */}
        <div className="space-y-6">
          {/* Agent Workflow Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-md font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
              <Cpu className="w-5 h-5 text-blue-600" /> Agentic AI Workflow
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-700">
                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                <span className="font-medium">Inventory Agent</span> <span className="text-gray-400 text-xs ml-auto">Completed</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                <span className="font-medium">Forecast Agent</span> <span className="text-gray-400 text-xs ml-auto">Completed</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                <span className="font-medium">Supplier Agent</span> <span className="text-gray-400 text-xs ml-auto">Completed</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="bg-yellow-100 p-1 rounded-full animate-pulse"><AlertTriangle className="w-3 h-3 text-yellow-600" /></div>
                <span className="font-medium">Order Agent</span> <span className="text-yellow-600 text-xs font-semibold ml-auto">Awaiting Approval</span>
              </li>
            </ul>
          </div>

          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10"><Lightbulb className="w-16 h-16" /></div>
            <h3 className="text-md font-bold flex items-center gap-2 mb-3 text-indigo-900">
              <Lightbulb className="w-5 h-5 text-indigo-600" /> AI Insights
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-indigo-800"><span className="font-semibold text-indigo-900">Demand:</span> ↑ Surge Expected</p>
              <p className="text-sm text-indigo-800"><span className="font-semibold text-indigo-900">Confidence:</span> 91%</p>
              <div className="mt-3 p-3 bg-white/60 rounded-lg text-xs text-indigo-900 leading-relaxed font-medium">
                &quot;Weekend spike approaching. I compared 3 local suppliers and found the lowest rate for low-stock items. Requesting order approval to prevent stockout.&quot;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Sales Graph */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-md font-bold flex items-center gap-2 mb-4 text-gray-700">
            <Activity className="w-5 h-5 text-orange-500" /> Past 7-Day Sales Trend
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pastSalesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{fill: '#9ca3af', fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Future Demand Forecast Graph */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-md font-bold flex items-center gap-2 mb-4 text-gray-700">
            <TrendingUp className="w-5 h-5 text-green-600" /> AI Demand Forecast (Next 7 Days)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{fill: '#9ca3af', fontSize: 10}} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="stock" name="Current Stock" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted_demand" name="Predicted Demand" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Bottom Section: Orders */}
      <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-md font-bold flex items-center gap-2 mb-4 text-gray-700">
          <ShoppingCart className="w-5 h-5 text-blue-500" /> Live Procurement Orders
        </h3>
        {orders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm font-medium">No recent orders placed by the AI Order Agent yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Item</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-700">{order.product.name}</td>
                    <td className="px-4 py-3 font-medium text-gray-600">{order.quantity} units</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
