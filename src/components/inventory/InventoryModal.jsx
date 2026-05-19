import React, { useState, useEffect } from 'react';
import { Package, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import { inventoryCategories, inventoryUnits } from '../../data/inventory';

const empty = {
  name: '',
  category: 'Consumables',
  stock: '',
  minStock: '',
  unit: 'boxes',
  price: '',
  lastOrdered: new Date().toISOString().slice(0, 10),
};

export default function InventoryModal({ isOpen, onClose, onSubmit, initialItem }) {
  const [form, setForm] = useState(empty);
  const isEdit = !!initialItem;

  useEffect(() => {
    if (isOpen) {
      setForm(initialItem ? {
        name: initialItem.name,
        category: initialItem.category,
        stock: String(initialItem.stock),
        minStock: String(initialItem.minStock),
        unit: initialItem.unit,
        price: String(initialItem.price),
        lastOrdered: initialItem.lastOrdered || new Date().toISOString().slice(0, 10),
      } : empty);
    }
  }, [isOpen, initialItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    const item = {
      id: initialItem?.id ?? `i${Date.now().toString(36)}`,
      name: form.name.trim(),
      category: form.category,
      stock: parseInt(form.stock || '0', 10),
      minStock: parseInt(form.minStock || '0', 10),
      unit: form.unit,
      price: parseFloat(form.price || '0'),
      lastOrdered: form.lastOrdered,
    };
    onSubmit(item, isEdit);
    toast.success(isEdit ? `${item.name} updated` : `${item.name} added to inventory`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Item' : 'Add Inventory Item'}
      icon={<Package size={24} className="text-primary" />}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Item Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Disposable Gloves (Box)"
            className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Category</label>
            <Select
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={inventoryCategories}
              size="lg"
              buttonClassName="bg-bg-body"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Unit</label>
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
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Stock</label>
            <input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Min Stock</label>
            <input
              type="number"
              min="0"
              required
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Unit Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Last Ordered</label>
          <input
            type="date"
            value={form.lastOrdered}
            onChange={(e) => setForm({ ...form, lastOrdered: e.target.value })}
            className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>

        <div className="pt-4 mt-2 border-t border-border-color flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-body transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2"
          >
            <Check size={16} weight="bold" />
            {isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
