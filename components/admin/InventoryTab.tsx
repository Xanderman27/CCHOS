'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Button from '@/components/ui/Button';
import type { InventoryRow } from '@/lib/db';

// --- Add / Edit Modal ---
function ItemModal({
  item,
  categories,
  onSave,
  onClose,
}: {
  item: InventoryRow | null; // null = adding new
  categories: string[];
  onSave: (data: Partial<InventoryRow> & { name: string; category: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [newCategory, setNewCategory] = useState('');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || '0');
  const [threshold, setThreshold] = useState(item?.low_stock_threshold?.toString() || '50');
  const [unit, setUnit] = useState(item?.unit || 'units');
  const [notes, setNotes] = useState(item?.notes || '');
  const [useNewCategory, setUseNewCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = useNewCategory ? newCategory.trim() : category;
    if (!name.trim() || !cat) return;
    onSave({
      id: item?.id,
      name: name.trim(),
      category: cat,
      quantity: parseInt(quantity) || 0,
      low_stock_threshold: parseInt(threshold) || 50,
      unit: unit.trim() || 'units',
      notes: notes.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">
            {item ? 'Edit Item' : 'Add Inventory Item'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Item Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Car Seat safety cards"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category *</label>
            {!useNewCategory ? (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
                  required={!useNewCategory}
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setUseNewCategory(true)}
                  className="px-3 py-2 text-xs text-slate-500 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  + New
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
                  required={useNewCategory}
                />
                <button
                  type="button"
                  onClick={() => { setUseNewCategory(false); setNewCategory(''); }}
                  className="px-3 py-2 text-xs text-slate-500 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Low Stock At</label>
              <input
                type="number"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="units"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this item..."
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit">{item ? 'Save Changes' : 'Add Item'}</Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Quick Quantity Adjuster ---
function QuantityAdjuster({
  item,
  onUpdate,
}: {
  item: InventoryRow;
  onUpdate: (id: number, quantity: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.quantity.toString());

  const isLow = item.quantity <= item.low_stock_threshold && item.quantity > 0;
  const isOut = item.quantity === 0;

  const handleCommit = () => {
    const qty = parseInt(value) || 0;
    onUpdate(item.id, Math.max(0, qty));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCommit(); if (e.key === 'Escape') { setEditing(false); setValue(item.quantity.toString()); } }}
          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ihc-purple"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onUpdate(item.id, Math.max(0, item.quantity - 1))}
        className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors text-xs font-medium"
        title="Decrease by 1"
      >
        -
      </button>
      <button
        onClick={() => { setEditing(true); setValue(item.quantity.toString()); }}
        className={`min-w-[3rem] px-2 py-0.5 rounded text-sm font-medium text-center cursor-text ${
          isOut
            ? 'bg-red-50 text-red-700 border border-red-200'
            : isLow
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-slate-50 text-slate-700 border border-slate-200'
        }`}
        title="Click to edit quantity"
      >
        {item.quantity.toLocaleString()}
      </button>
      <button
        onClick={() => onUpdate(item.id, item.quantity + 1)}
        className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors text-xs font-medium"
        title="Increase by 1"
      >
        +
      </button>
    </div>
  );
}

// --- Stock Status Badge ---
function StockBadge({ item }: { item: InventoryRow }) {
  if (item.quantity === 0) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">Out of Stock</span>;
  }
  if (item.quantity <= item.low_stock_threshold) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Low Stock</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">In Stock</span>;
}

// --- Main InventoryTab ---
export default function InventoryTab() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [modalItem, setModalItem] = useState<InventoryRow | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const categories = useMemo(() => {
    const cats = [...new Set(inventory.map(i => i.category))];
    cats.sort();
    return cats;
  }, [inventory]);

  const filtered = useMemo(() => {
    let result = inventory;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
    }
    if (categoryFilter) {
      result = result.filter(i => i.category === categoryFilter);
    }
    if (stockFilter === 'low') {
      result = result.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold);
    } else if (stockFilter === 'out') {
      result = result.filter(i => i.quantity === 0);
    } else if (stockFilter === 'in_stock') {
      result = result.filter(i => i.quantity > i.low_stock_threshold);
    }
    return result;
  }, [inventory, search, categoryFilter, stockFilter]);

  // Summary stats
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold).length;
  const outOfStockCount = inventory.filter(i => i.quantity === 0).length;
  const totalUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);

  const handleSave = async (data: Partial<InventoryRow> & { name: string; category: string }) => {
    try {
      if (data.id) {
        // Update existing
        await fetch(`/api/inventory/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        // Create new
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setModalItem(null);
      await fetchInventory();
    } catch (err) {
      console.error('Failed to save inventory item:', err);
    }
  };

  const handleQuantityUpdate = async (id: number, quantity: number) => {
    try {
      await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      await fetchInventory();
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-slate-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Items</div>
          <div className="text-2xl font-semibold text-slate-800">{totalItems}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Units</div>
          <div className="text-2xl font-semibold text-slate-800">{totalUnits.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setStockFilter(stockFilter === 'low' ? '' : 'low')}>
          <div className="text-xs font-medium text-amber-600 mb-1">Low Stock</div>
          <div className="text-2xl font-semibold text-amber-700">{lowStockCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-red-300 transition-colors" onClick={() => setStockFilter(stockFilter === 'out' ? '' : 'out')}>
          <div className="text-xs font-medium text-red-600 mb-1">Out of Stock</div>
          <div className="text-2xl font-semibold text-red-700">{outOfStockCount}</div>
        </div>
      </div>

      {/* Filters + Add Button */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
          >
            <option value="">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <Button onClick={() => setModalItem('new')}>
            + Add Item
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Item</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">Quantity</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    {inventory.length === 0 ? 'No inventory items yet. Click "Add Item" to get started.' : 'No items match the current filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-slate-800 font-medium">{item.name}</div>
                      {item.unit !== 'units' && (
                        <div className="text-xs text-slate-400">{item.unit}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-center">
                        <QuantityAdjuster item={item} onUpdate={handleQuantityUpdate} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StockBadge item={item} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs max-w-[200px] truncate">
                      {item.notes || '--'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModalItem(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100"
                          title="Edit item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs text-slate-500 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded hover:bg-slate-100"
                            title="Delete item"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {inventory.length} items
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalItem !== null && (
        <ItemModal
          item={modalItem === 'new' ? null : modalItem}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
}
