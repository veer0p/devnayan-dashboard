import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, Package, PencilSimple, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import InventoryDrawer from '../components/inventory/InventoryDrawer';
import { mockInventory, inventoryCategories } from '../data/inventory';
import { useLocalStorage } from '../lib/useLocalStorage';

export default function Inventory() {
  const [items, setItems] = useLocalStorage('inventory', mockInventory);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [initialEditMode, setInitialEditMode] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const filterOptions = useMemo(
    () => ['All', ...inventoryCategories].map(c => ({ value: c, label: c === 'All' ? 'All Categories' : c })),
    []
  );

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStockCount = items.filter(i => i.stock <= i.minStock).length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.price, 0);

  const openAdd = () => {
    setViewingItem(null);
    setInitialEditMode(true);
    setIsDrawerOpen(true);
  };

  const openEdit = (item) => {
    setViewingItem(item);
    setInitialEditMode(true);
    setIsDrawerOpen(true);
  };

  const openView = (item) => {
    setViewingItem(item);
    setInitialEditMode(false);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (item, isEdit) => {
    if (isEdit) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    toast.success(`${deletingItem.name} deleted`);
    setViewingItem(null);
    setDeletingItem(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Inventory</h1>
          <p className="text-text-muted text-sm">{items.length} items tracked • {lowStockCount} low stock</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={openAdd}
            className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} weight="bold" /> Add Item
          </button>
        </motion.div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden mb-6">
        {[
          { label: 'Total items', value: items.length, sub: `${inventoryCategories.length} categories` },
          { label: 'Low stock', value: lowStockCount, sub: lowStockCount > 0 ? 'needs reorder' : 'all good' },
          { label: 'Avg. price', value: items.length > 0 ? `₹${Math.round(totalValue / items.reduce((s, i) => s + i.stock, 0)).toLocaleString()}` : '—', sub: 'per unit' },
          { label: 'Stock value', value: `₹${totalValue.toLocaleString()}`, accent: true, sub: 'at current stock' },
        ].map(s => (
          <div key={s.label} className="bg-bg-card p-4">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">{s.label}</div>
            <div className={`mt-2 text-[24px] leading-none font-semibold tracking-tight ${s.accent ? 'text-primary' : 'text-text-main'}`}>
              {s.value}
            </div>
            {s.sub && <div className="text-[11px] text-text-muted mt-2">{s.sub}</div>}
          </div>
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
          <Select
            value={catFilter}
            onChange={setCatFilter}
            options={filterOptions}
            className="w-full sm:w-48"
            size="md"
          />
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
                <th className="pb-3 pt-4 font-semibold">Status</th>
                <th className="pb-3 pt-4 font-semibold pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.stock <= item.minStock;
                return (
                  <tr
                    key={item.id}
                    onClick={() => openView(item)}
                    className="border-b border-border-color last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-bg-body border border-border-color text-text-muted flex items-center justify-center shrink-0">
                          <Package size={15} />
                        </div>
                        <span className="font-medium text-text-main">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-text-muted text-[12px]">{item.category}</td>
                    <td className="py-3 tabular-nums">
                      <span className={isLow ? 'font-semibold text-rose-500' : 'font-medium text-text-main'}>{item.stock}</span>
                      <span className="text-text-muted text-[11px] ml-1">/ min {item.minStock} {item.unit}</span>
                    </td>
                    <td className="py-3 font-medium tabular-nums">₹{item.price.toLocaleString()}</td>
                    <td className="py-3 text-text-muted text-[12px]">{new Date(item.lastOrdered).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="py-3">
                      <StatusBadge status={isLow ? 'Low Stock' : 'In Stock'} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                          className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary/80 shadow-sm hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center transition-colors"
                          title="Edit item"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingItem(item); }}
                          className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400/80 shadow-sm hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 flex items-center justify-center transition-colors"
                          title="Delete item"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-text-muted">No items match your search.</div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-3 space-y-3">
          {filtered.map(item => {
            const isLow = item.stock <= item.minStock;
            return (
              <div
                key={item.id}
                onClick={() => openView(item)}
                className="bg-bg-body border border-border-color rounded-xl p-4 active:bg-border-color/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
                      <Package size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-text-main text-sm">{item.name}</div>
                      <div className="text-xs text-text-muted">{item.category}</div>
                    </div>
                  </div>
                  <StatusBadge status={isLow ? 'Low' : 'OK'} size="xs" />
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mt-2">
                  <span>Stock: <span className={isLow ? 'font-semibold text-rose-500' : 'font-medium text-text-main'}>{item.stock}</span> {item.unit}</span>
                  <span className="font-medium text-text-main">₹{item.price.toLocaleString()}/unit</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-text-muted">No items found.</div>}
        </div>
      </motion.div>

      <InventoryDrawer
        item={viewingItem}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setViewingItem(null); }}
        initialEditMode={initialEditMode}
        onUpdate={(updated, isEdit) => {
          handleSubmit(updated, isEdit);
          if (isEdit) {
            setViewingItem(updated);
          } else {
            setViewingItem(null);
            setIsDrawerOpen(false);
          }
        }}
        onDelete={() => setDeletingItem(viewingItem)}
      />

      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete inventory item?"
        description={deletingItem ? `"${deletingItem.name}" will be permanently removed from your inventory. This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </AppLayout>
  );
}
