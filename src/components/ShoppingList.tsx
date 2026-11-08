import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Copy,
  Printer,
  Sparkles,
  Check,
  Filter,
} from 'lucide-react';
import type { ShoppingItem } from '../types/recipe';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (name: string, amount: string, unit: string, recipeTitle?: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onClearCompleted,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [copied, setCopied] = useState(false);

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return !item.checked;
    if (filter === 'completed') return item.checked;
    return true;
  });

  const completedCount = items.filter((i) => i.checked).length;
  const pendingCount = items.length - completedCount;

  // Add new item handler
  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddItem(newName.trim(), newAmount.trim(), newUnit.trim());
    setNewName('');
    setNewAmount('');
    setNewUnit('');
  };

  // Copy shopping list to clipboard
  const handleCopyList = () => {
    if (items.length === 0) return;
    const text = items
      .map((it) => `${it.checked ? '✓ [Kupione]' : '□ [Do kupienia]'} ${it.name}${it.amount ? ` - ${it.amount} ${it.unit}` : ''}${it.recipeTitle ? ` (${it.recipeTitle})` : ''}`)
      .join('\n');
    
    navigator.clipboard.writeText(`🛒 Moja lista zakupów:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick print of shopping list
  const handlePrint = () => {
    window.print();
  };

  // Group by recipe if present
  const itemsByRecipe: Record<string, ShoppingItem[]> = {};
  filteredItems.forEach((it) => {
    const key = it.recipeTitle || 'Inne produkty';
    if (!itemsByRecipe[key]) itemsByRecipe[key] = [];
    itemsByRecipe[key].push(it);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif-culinary text-2xl sm:text-3xl font-bold text-stone-900">
              Lista Zakupów
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 tabular-nums">
              {pendingCount} do kupienia
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Zaznaczaj kupione składniki w sklepie – zostaną automatycznie przekreślone.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="no-print flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyList}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors shadow-xs"
            title="Kopiuj listę do schowka np. do WhatsApp lub SMS"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Skopiowano!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Kopiuj listę</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Drukuj</span>
          </button>

          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              Usuń kupione ({completedCount})
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Czy na pewno chcesz wyczyścić całą listę zakupów?')) {
                  onClearAll();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              Wyczyść wszystko
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleAddNew}
        className="no-print mt-6 p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center"
      >
        <div className="flex-1 w-full">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Dodaj własny produkt (np. Masło klarowane, Mleko)..."
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
          />
        </div>

        <div className="w-full sm:w-28 flex-shrink-0">
          <input
            type="text"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Ilość (np. 2)"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
          />
        </div>

        <div className="w-full sm:w-28 flex-shrink-0">
          <input
            type="text"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="Jednostka (np. szt.)"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="no-print mt-6 flex items-center justify-between">
        <div className="inline-flex p-1 bg-stone-200/70 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Wszystkie ({items.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'pending'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Do kupienia ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'completed'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Kupione ({completedCount})
          </button>
        </div>
      </div>

      {/* Shopping Items List */}
      <div className="mt-6 space-y-6">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80">
            <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-3 stroke-1" />
            <h3 className="text-base font-semibold text-stone-800">
              {filter === 'completed'
                ? 'Brak oznaczonych produktów jako kupione'
                : 'Twoja lista zakupów jest pusta'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Możesz dodać składniki z dowolnego przepisu klikając „Dodaj do listy zakupów” lub wpisać produkty ręcznie powyżej.
            </p>
          </div>
        ) : (
          Object.entries(itemsByRecipe).map(([recipeTitle, groupItems]) => (
            <div key={recipeTitle} className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {recipeTitle}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  {groupItems.filter((i) => i.checked).length} / {groupItems.length} kupione
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`flex items-center justify-between px-5 py-3.5 hover:bg-stone-50/80 transition-colors cursor-pointer select-none ${
                      item.checked ? 'bg-stone-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                      <button
                        type="button"
                        aria-label={item.checked ? 'Odznacz produkt' : 'Zaznacz jako kupiony'}
                        className="text-stone-400 hover:text-amber-600 transition-colors shrink-0"
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs sm:text-sm font-medium transition-all ${
                            item.checked
                              ? 'line-through text-stone-400'
                              : 'text-stone-900'
                          }`}
                        >
                          {item.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {(item.amount || item.unit) && (
                        <span
                          className={`text-xs sm:text-sm font-semibold tabular-nums ${
                            item.checked ? 'line-through text-stone-400' : 'text-amber-800'
                          }`}
                        >
                          {item.amount} {item.unit}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="no-print p-1.5 rounded-lg text-stone-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Usuń pozycję"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
