export const inventoryCategories = ['Consumables', 'Materials', 'Medicines', 'Instruments', 'Equipment', 'Other'];

export const inventoryUnits = ['boxes', 'pieces', 'packs', 'pouches', 'syringes', 'cartridges', 'kits', 'bottles', 'tubes', 'rolls'];

export const mockInventory = [
  { id: 'i1', name: 'Disposable Gloves (Box)', category: 'Consumables', stock: 45, minStock: 10, unit: 'boxes', price: 350, lastOrdered: '2026-05-01' },
  { id: 'i2', name: 'Dental Composite Resin', category: 'Materials', stock: 8, minStock: 5, unit: 'syringes', price: 1200, lastOrdered: '2026-04-15' },
  { id: 'i3', name: 'Anesthesia Cartridges', category: 'Medicines', stock: 3, minStock: 10, unit: 'packs', price: 800, lastOrdered: '2026-04-20' },
  { id: 'i4', name: 'Sterilization Pouches', category: 'Consumables', stock: 120, minStock: 30, unit: 'pouches', price: 15, lastOrdered: '2026-05-05' },
  { id: 'i5', name: 'Dental Burs (Assorted)', category: 'Instruments', stock: 2, minStock: 5, unit: 'packs', price: 2500, lastOrdered: '2026-03-10' },
  { id: 'i6', name: 'Impression Material', category: 'Materials', stock: 12, minStock: 5, unit: 'cartridges', price: 950, lastOrdered: '2026-04-28' },
  { id: 'i7', name: 'Face Masks (Box)', category: 'Consumables', stock: 30, minStock: 10, unit: 'boxes', price: 200, lastOrdered: '2026-05-08' },
  { id: 'i8', name: 'Temporary Crown Kit', category: 'Materials', stock: 6, minStock: 3, unit: 'kits', price: 1800, lastOrdered: '2026-04-01' },
];
