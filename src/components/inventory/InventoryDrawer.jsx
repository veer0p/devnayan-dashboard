import React from 'react';
import { Package, PencilSimple, Trash, X } from '@phosphor-icons/react';
import Drawer from '../ui/Drawer';
import StatusBadge from '../ui/StatusBadge';

export default function InventoryDrawer({ item, isOpen, onClose, onEdit, onDelete }) {
  if (!item) return null;
  const isLow = item.stock <= item.minStock;
  const stockValue = item.stock * item.price;

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-start gap-3 bg-bg-body">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-text-main truncate">{item.name}</h2>
            <div className="text-[11px] text-text-muted mt-1 flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-bg-card border border-border-color font-medium">{item.category}</span>
              <span>·</span>
              <span className="truncate">Last ordered {new Date(item.lastOrdered).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-main hover:bg-border-color rounded-xl transition-colors shrink-0"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

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
              {item.stock} <span className="text-sm font-medium text-text-muted">{item.unit}</span>
            </div>
            <div className="text-[11px] text-text-muted mt-1">Min reorder: {item.minStock} {item.unit}</div>
          </div>
          <div className="p-4 bg-bg-body">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Unit price</div>
            <div className="mt-2 text-[20px] font-semibold tracking-tight text-text-main tabular-nums">
              ₹{item.price.toLocaleString()}
            </div>
            <div className="text-[11px] text-text-muted mt-1">per {item.unit.replace(/s$/, '')}</div>
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
          onClick={onEdit}
          className="h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm"
        >
          <PencilSimple size={14} /> Edit item
        </button>
      </div>
    </Drawer>
  );
}
