import React, { useState, useEffect } from 'react';
import { Package, PencilSimple, Trash, X, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Drawer from '../ui/Drawer';
import Select from '../ui/Select';
import StatusBadge from '../ui/StatusBadge';
import { inventoryCategories, inventoryUnits } from '../../data/inventory';

export default function InventoryDrawer({ item, isOpen, onClose, onUpdate, onDelete, initialEditMode = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Consumables',
    stock: '',
    minStock: '',
    unit: 'boxes',
    price: '',
    lastOrdered: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    } else if (item) {
      setForm({
        name: item.name || '',
        category: item.category || 'Consumables',
        stock: String(item.stock || '0'),
        minStock: String(item.minStock || '0'),
        unit: item.unit || 'boxes',
        price: String(item.price || '0'),
        lastOrdered: item.lastOrdered || new Date().toISOString().slice(0, 10),
      });
      setIsEditing(initialEditMode);
    } else {
      setForm({
        name: '',
        category: 'Consumables',
        stock: '',
        minStock: '',
        unit: 'boxes',
        price: '',
        lastOrdered: new Date().toISOString().slice(0, 10),
      });
      setIsEditing(true);
    }
  }, [item, isOpen, initialEditMode]);

  if (!isOpen) return null;
  if (!isEditing && !item) return null;

  const isLow = item ? (item.stock <= item.minStock) : false;
  const stockValue = item ? (item.stock * item.price) : 0;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    const updated = {
      ...(item || {}),
      id: item?.id ?? `i${Date.now().toString(36)}`,
      name: form.name.trim(),
      category: form.category,
      stock: parseInt(form.stock || '0', 10),
      minStock: parseInt(form.minStock || '0', 10),
      unit: form.unit,
      price: parseFloat(form.price || '0'),
      lastOrdered: form.lastOrdered,
    };
    const isEdit = !!item;
    onUpdate?.(updated, isEdit);
    toast.success(isEdit ? `${updated.name} updated` : `${updated.name} added to inventory`);
    setIsEditing(false);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-start gap-3 bg-bg-body">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-text-main truncate">
              {isEditing ? (form.name || (item ? 'New Item' : 'Add Item')) : item?.name}
            </h2>
            {!isEditing && item ? (
              <div className="text-[11px] text-text-muted mt-1 flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-bg-card border border-border-color font-medium">{item.category}</span>
                <span>·</span>
                <span className="truncate">Last ordered {new Date(item.lastOrdered).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            ) : (
              <div className="text-xs text-text-muted mt-0.5 uppercase font-semibold tracking-wider">
                {item ? 'Editing Item' : 'Add New Item'}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-main hover:bg-border-color rounded-xl transition-colors shrink-0"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-bg-card">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase">Item Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Disposable Gloves (Box)"
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Category</label>
              <Select
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={inventoryCategories}
                size="lg"
                buttonClassName="bg-bg-body"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Unit</label>
              <Select
                value={form.unit}
                onChange={(v) => setForm({ ...form, unit: v })}
                options={inventoryUnits}
                size="lg"
                buttonClassName="bg-bg-body"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Stock</label>
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Min Stock</label>
              <input
                type="number"
                min="0"
                required
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Unit Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase">Last Ordered</label>
            <input
              type="date"
              value={form.lastOrdered}
              onChange={(e) => setForm({ ...form, lastOrdered: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
            />
          </div>

          <div className="pt-6 border-t border-border-color flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                if (!item) {
                  onClose();
                } else {
                  setIsEditing(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-text-muted hover:bg-bg-body transition-colors border border-border-color"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
            >
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Status banner — subtle */}
          {isLow && (
            <div className="mx-6 mt-5 p-3 bg-bg-body border border-border-color rounded-lg flex items-start gap-3">
              <span className="w-1 h-full min-h-[40px] rounded-full bg-rose-500/70 shrink-0" />
              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">Low stock</div>
                <div className="text-sm text-text-main">Stock has fallen at or below minimum reorder level.</div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden">
              <div className="p-4 bg-bg-body">
                <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Current stock</div>
                <div className={`mt-2 text-[20px] font-semibold tracking-tight tabular-nums ${isLow ? 'text-rose-500' : 'text-text-main'}`}>
                  {item?.stock} <span className="text-sm font-medium text-text-muted">{item?.unit}</span>
                </div>
                <div className="text-[11px] text-text-muted mt-1">Min reorder: {item?.minStock} {item?.unit}</div>
              </div>
              <div className="p-4 bg-bg-body">
                <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Unit price</div>
                <div className="mt-2 text-[20px] font-semibold tracking-tight text-text-main tabular-nums">
                  ₹{item?.price?.toLocaleString()}
                </div>
                <div className="text-[11px] text-text-muted mt-1">per {item?.unit?.replace(/s$/, '')}</div>
              </div>
            </div>

            <div className="p-4 bg-bg-body border border-border-color rounded-xl">
              <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Total stock value</div>
              <div className="mt-2 text-[22px] font-semibold tracking-tight text-primary tabular-nums">
                ₹{stockValue.toLocaleString()}
              </div>
            </div>

            {/* Status row */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-2">Status</h4>
              <StatusBadge status={isLow ? 'Low Stock' : 'In Stock'} />
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-border-color flex justify-between gap-3 bg-bg-card">
            <button
              onClick={onDelete}
              className="h-10 px-4 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400/90 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <Trash size={14} /> Delete
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm"
            >
              <PencilSimple size={14} /> Edit item
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}
