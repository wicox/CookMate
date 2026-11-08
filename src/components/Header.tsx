import React from 'react';
import {
  BookOpen,
  ShoppingCart,
  FolderHeart,
  Plus,
  FileJson,
  Smartphone,
  Monitor,
  Printer,
  Sparkles,
} from 'lucide-react';
import type { AppTab, ViewMode } from '../types/recipe';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  shoppingCount: number;
  onOpenNewRecipe: () => void;
  onOpenJsonSync: () => void;
  onOpenGroups: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  viewMode,
  onToggleViewMode,
  shoppingCount,
  onOpenNewRecipe,
  onOpenJsonSync,
  onOpenGroups,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Wordmark */}
          <div
            onClick={() => onSelectTab('recipes')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-inner font-bold text-lg">
              🍽️
            </div>
            <div>
              <span className="font-serif-culinary text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Cookmate <span className="text-amber-400 font-sans text-xs font-semibold uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded bg-amber-500/20">PL</span>
              </span>
              <p className="text-[11px] text-stone-400 hidden sm:block -mt-0.5">
                Twoja Książka Przepisów & Zakupy
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700/60">
            <button
              onClick={() => onSelectTab('recipes')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                currentTab === 'recipes' || currentTab === 'recipe-detail'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Przepisy
            </button>

            <button
              onClick={() => onSelectTab('shopping')}
              className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                currentTab === 'shopping'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Lista Zakupów
              {shoppingCount > 0 && (
                <span className="ml-1 bg-amber-400 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {shoppingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectTab('groups');
                onOpenGroups();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                currentTab === 'groups'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              Grupy & Kolekcje
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile View Toggle */}
            <button
              onClick={onToggleViewMode}
              title={viewMode === 'desktop' ? 'Przełącz na widok mobilny' : 'Przełącz na widok pełny (desktop)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                viewMode === 'mobile-simulator'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-700/80'
              }`}
            >
              {viewMode === 'desktop' ? (
                <>
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Widok mobilny</span>
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Widok desktop</span>
                </>
              )}
            </button>

            {/* JSON Sync */}
            <button
              onClick={onOpenJsonSync}
              title="Zapisz lub otwórz plik JSON z przepisami"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 text-stone-300 border border-stone-700 hover:text-white hover:bg-stone-700/80 transition-all"
            >
              <FileJson className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Plik JSON</span>
            </button>

            {/* New Recipe CTA */}
            <button
              onClick={onOpenNewRecipe}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 hover:text-white shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Dodaj przepis</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
