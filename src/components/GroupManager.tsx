import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FolderHeart,
  Tag,
  Check,
  Edit2,
  BookOpen,
} from 'lucide-react';
import type { RecipeGroup, Recipe } from '../types/recipe';

interface GroupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: RecipeGroup[];
  recipes: Recipe[];
  onCreateGroup: (name: string, icon?: string, description?: string) => void;
  onDeleteGroup: (groupId: string, groupName: string) => void;
  onSelectGroupFilter: (groupName: string) => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  isOpen,
  onClose,
  groups,
  recipes,
  onCreateGroup,
  onDeleteGroup,
  onSelectGroupFilter,
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('🍲');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onCreateGroup(newGroupName.trim(), newGroupIcon, newGroupDesc.trim());
    setNewGroupName('');
    setNewGroupDesc('');
  };

  const getRecipeCountForGroup = (groupName: string) => {
    return recipes.filter((r) => r.groups.includes(groupName)).length;
  };

  const commonIcons = ['🎄', '⏱️', '🍰', '🍲', '🍝', '🥗', '🥩', '🐟', '🥞', '☕', '🥖', '🍷'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <FolderHeart className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="font-serif-culinary text-lg font-bold text-stone-900">
                Grupy i Kolekcje Przepisów
              </h2>
              <p className="text-[11px] text-stone-500">
                Organizuj przepisy np. w grupy „Wigilia”, „Szybki obiad” itp.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Create new group */}
          <form onSubmit={handleCreate} className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-600" />
              Utwórz nową grupę
            </h3>

            <div className="space-y-3">
              <div className="flex gap-2">
                {/* Emoji selector */}
                <select
                  value={newGroupIcon}
                  onChange={(e) => setNewGroupIcon(e.target.value)}
                  className="w-14 text-base px-2 py-2 rounded-xl border border-stone-300 bg-white text-center cursor-pointer"
                  title="Wybierz ikonę grupy"
                >
                  {commonIcons.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  placeholder="Nazwa grupy (np. Wigilia, Grill, Śniadania)..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
                >
                  Dodaj
                </button>
              </div>

              <input
                type="text"
                placeholder="Opcjonalny opis grupy (np. Tradycyjne dania wigilijne)..."
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </form>

          {/* Existing Groups List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              Twoje grupy ({groups.length})
            </h3>

            <div className="space-y-2">
              {groups.map((group) => {
                const count = getRecipeCountForGroup(group.name);

                return (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 transition-all group"
                  >
                    <div
                      onClick={() => {
                        onSelectGroupFilter(group.name);
                        onClose();
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <span className="text-xl w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                        {group.icon || '📁'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                            {group.name}
                          </h4>
                          <span className="text-[11px] px-2 py-0.2 rounded-full bg-stone-100 text-stone-600 tabular-nums">
                            {count} {count === 1 ? 'przepis' : count > 1 && count < 5 ? 'przepisy' : 'przepisów'}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-[11px] text-stone-500 line-clamp-1">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onSelectGroupFilter(group.name);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                      >
                        Pokaż przepisy
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Czy na pewno chcesz usunąć grupę "${group.name}"?`)) {
                            onDeleteGroup(group.id, group.name);
                          }
                        }}
                        className="p-1.5 text-stone-300 hover:text-red-600 rounded-lg transition-colors"
                        title="Usuń grupę"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
