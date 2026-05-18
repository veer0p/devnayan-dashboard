import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, Package, Warning, Check } from '@phosphor-icons/react';
import AppLayout from '../components/layout/AppLayout';

const items = [
  { id: 1, name: 'Disposable Gloves (Box)', category: 'Consumables', stock: 45, minStock: 10, unit: 'boxes', price: 350, lastOrdered: '2026-05-01' },
  { id: 2, name: 'Dental Composite Resin', category: 'Materials', stock: 8, minStock: 5, unit: 'syringes', price: 1200, lastOrdered: '2026-04-15' },
  { id: 3, name: 'Anesthesia Cartridges', category: 'Medicines', stock: 3, minStock: 10, unit: 'packs', price: 800, lastOrdered: '2026-04-20' },
  { id: 4, name: 'Sterilization Pouches', category: 'Consumables', stock: 120, minStock: 30, unit: 'pouches', price: 15, lastOrdered: '2026-05-05' },
  { id: 5, name: 'Dental Burs (Assorted)', category: 'Instruments', stock: 2, minStock: 5, unit: 'packs', price: 2500, lastOrdered: '2026-03-10' },
  { id: 6, name: 'Impression Material', category: 'Materials', stock: 12, minStock: 5, unit: 'cartridges', price: 950, lastOrdered: '2026-04-28' },
  { id: 7, name: 'Face Masks (Box)', category: 'Consumables', stock: 30, minStock: 10, unit: 'boxes', price: 200, lastOrdered: '2026-05-08' },
  { id: 8, name: 'Temporary Crown Kit', category: 'Materials', stock: 6, minStock: 3, unit: 'kits', price: 1800, lastOrdered: '2026-04-01' },
];

const categories = ['All', ...new Set(items.map(i => i.category))];

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStock = items.filter(i => i.stock <= i.minStock).length;

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Inventory</h1>
          <p className="text-text-muted text-sm">{items.length} items tracked • {lowStock} low stock</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
            <Plus size={16} weight="bold" /> Add Item
          </button>
        </motion.div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Items', value: items.length, icon: <Package size={18} />, color: 'text-primary' },
          { label: 'Low Stock', value: lowStock, icon: <Warning size={18} />, color: 'text-red-400' },
          { label: 'Categories', value: categories.length - 1, icon: <Package size={18} />, color: 'text-blue-400' },
          { label: 'Stock Value', value: `₹${items.reduce((s, i) => s + i.stock * i.price, 0).toLocaleString()}`, icon: <Check size={18} />, color: 'text-emerald-400' },
        ].map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border-color rounded-xl p-4"
          >
            <div className="text-xs text-text-muted font-medium mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border-color rounded-2xl shadow-sm"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-border-color flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="h-9 px-3 bg-bg-card border border-border-color rounded-lg text-sm focus:outline-none cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-text-muted border-b border-border-color">
                <th className="pb-3 pt-4 font-semibold pl-4">Item</th>
                <th className="pb-3 pt-4 font-semibold">Category</th>
                <th className="pb-3 pt-4 font-semibold">Stock</th>
                <th className="pb-3 pt-4 font-semibold">Unit Price</th>
                <th className="pb-3 pt-4 font-semibold">Last Ordered</th>
                <th className="pb-3 pt-4 font-semibold pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.stock <= item.minStock;
                return (
                  <tr key={item.id} className="border-b border-border-color last:border-0 hover:bg-bg-body/50 transition-colors cursor-pointer">
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isLow ? 'bg-red-900/20 text-red-400' : 'bg-primary/15 text-primary'}`}>
                          <Package size={18} />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-body border border-border-color">{item.category}</span>
                    </td>
                    <td className="py-3">
                      <span className={`font-semibold ${isLow ? 'text-red-400' : 'text-text-main'}`}>{item.stock}</span>
                      <span className="text-text-muted text-xs ml-1">/ min {item.minStock} {item.unit}</span>
                    </td>
                    <td className="py-3 font-medium">₹{item.price.toLocaleString()}</td>
                    <td className="py-3 text-text-muted">{new Date(item.lastOrdered).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${isLow ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                        {isLow ? <><Warning size={12} /> Low Stock</> : <><Check size={12} /> In Stock</>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-3 space-y-3">
          {filtered.map(item => {
            const isLow = item.stock <= item.minStock;
            return (
              <div key={item.id} className="bg-bg-body border border-border-color rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isLow ? 'bg-red-900/20 text-red-400' : 'bg-primary/15 text-primary'}`}>
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-text-main text-sm">{item.name}</div>
                      <div className="text-xs text-text-muted">{item.category}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${isLow ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                    {isLow ? 'Low' : 'OK'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mt-2">
                  <span>Stock: <span className={`font-semibold ${isLow ? 'text-red-400' : 'text-text-main'}`}>{item.stock}</span> {item.unit}</span>
                  <span className="font-medium text-text-main">₹{item.price.toLocaleString()}/unit</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-text-muted">No items found.</div>}
        </div>
      </motion.div>
    </AppLayout>
  );
}
