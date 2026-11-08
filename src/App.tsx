import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  FolderHeart,
  ShoppingCart,
  Printer,
  FileText,
  FileJson,
  Smartphone,
  Sparkles,
  ChefHat,
  Tag,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type {
  Recipe,
  RecipeGroup,
  ShoppingItem,
  ViewMode,
  AppTab,
  Ingredient,
} from './types/recipe';
import {
  INITIAL_RECIPES,
  INITIAL_GROUPS,
  INITIAL_SHOPPING,
} from './data/initialData';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { ShoppingList } from './components/ShoppingList';
import { RecipeFormModal } from './components/RecipeFormModal';
import { A4PrintModal } from './components/A4PrintModal';
import { JsonSyncModal } from './components/JsonSyncModal';
import { GroupManager } from './components/GroupManager';
import { MobileSimulator } from './components/MobileSimulator';
import { exportRecipeToDocx } from './utils/docxExport';
import { exportSingleRecipeToJson } from './utils/jsonSync';

const STORAGE_KEYS = {
  RECIPES: 'cookmate_recipes_v1',
  GROUPS: 'cookmate_groups_v1',
  SHOPPING: 'cookmate_shopping_v1',
  VIEW_MODE: 'cookmate_view_mode_v1',
};

export default function App() {
  // Load initial data from localStorage if available
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return stored ? JSON.parse(stored) : INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  });

  const [groups, setGroups] = useState<RecipeGroup[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return stored ? JSON.parse(stored) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      return stored ? JSON.parse(stored) : INITIAL_SHOPPING;
    } catch {
      return INITIAL_SHOPPING;
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      return (stored as ViewMode) || 'desktop';
    } catch {
      return 'desktop';
    }
  });

  // Navigation & Filtering
  const [currentTab, setCurrentTab] = useState<AppTab>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isPrintA4Open, setIsPrintA4Open] = useState(false);
  const [recipeForPrint, setRecipeForPrint] = useState<Recipe | null>(null);
  const [isJsonSyncOpen, setIsJsonSyncOpen] = useState(false);
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.warn('Storage quota exceeded for recipes', e);
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingList));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [shoppingList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    } catch (e) {
      // ignore
    }
  }, [viewMode]);

  // Recipe Handlers
  const handleSaveRecipe = (recipeToSave: Recipe) => {
    setRecipes((prev) => {
      const existsIndex = prev.findIndex((r) => r.id === recipeToSave.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = recipeToSave;
        return updated;
      }
      return [recipeToSave, ...prev];
    });

    if (selectedRecipe && selectedRecipe.id === recipeToSave.id) {
      setSelectedRecipe(recipeToSave);
    }

    // Ensure any new groups exist in the groups list
    recipeToSave.groups.forEach((grpName) => {
      if (!groups.some((g) => g.name.toLowerCase() === grpName.toLowerCase())) {
        handleCreateGroup(grpName);
      }
    });
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(null);
      setCurrentTab('recipes');
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsRecipeFormOpen(true);
  };

  // Group Handlers
  const handleCreateGroup = (name: string, icon = '🍲', description = '') => {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (groups.some((g) => g.name.toLowerCase() === cleanName.toLowerCase())) return;

    const newGroup: RecipeGroup = {
      id: `grp-${Date.now()}`,
      name: cleanName,
      icon,
      description,
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    // Remove group reference from recipes
    setRecipes((prev) =>
      prev.map((r) => ({
        ...r,
        groups: r.groups.filter((g) => g !== groupName),
      }))
    );
    if (selectedGroup === groupName) {
      setSelectedGroup('all');
    }
  };

  // Shopping List Handlers
  const handleAddIngredientsToShopping = (
    recipe: Recipe,
    ingredientsToAdd: Ingredient[]
  ) => {
    const newItems: ShoppingItem[] = ingredientsToAdd.map((ing) => ({
      id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      name: ing.name,
      amount: ing.amount || '',
      unit: ing.unit || '',
      checked: false,
      category: ing.section || 'Ogólne',
      createdAt: new Date().toISOString(),
    }));

    setShoppingList((prev) => [...newItems, ...prev]);
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddManualShoppingItem = (
    name: string,
    amount: string,
    unit: string,
    recipeTitle?: string
  ) => {
    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      recipeTitle: recipeTitle || 'Własne zakupy',
      name,
      amount,
      unit,
      checked: false,
      createdAt: new Date().toISOString(),
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const handleClearCompletedShopping = () => {
    setShoppingList((prev) => prev.filter((it) => !it.checked));
  };

  const handleClearAllShopping = () => {
    setShoppingList([]);
  };

  // Export / Print Handlers
  const handleOpenPrintA4 = (recipe: Recipe) => {
    setRecipeForPrint(recipe);
    setIsPrintA4Open(true);
  };

  const handleExportWord = async (recipe: Recipe) => {
    try {
      await exportRecipeToDocx(recipe);
    } catch (err) {
      alert('Błąd podczas eksportu do pliku Word: ' + (err as Error).message);
    }
  };

  const handleExportJsonSingle = (recipe: Recipe) => {
    exportSingleRecipeToJson(recipe);
  };

  const handleImportJsonSuccess = (data: {
    recipes: Recipe[];
    groups: RecipeGroup[];
    shoppingList?: ShoppingItem[];
    mode: 'merge' | 'replace';
  }) => {
    if (data.mode === 'replace') {
      setRecipes(data.recipes);
      if (data.groups?.length) setGroups(data.groups);
      if (data.shoppingList?.length) setShoppingList(data.shoppingList);
    } else {
      // Merge unique by title or ID
      setRecipes((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const toAdd = data.recipes.filter((r) => !existingIds.has(r.id));
        return [...toAdd, ...prev];
      });
      if (data.groups?.length) {
        setGroups((prev) => {
          const existingNames = new Set(prev.map((g) => g.name.toLowerCase()));
          const toAdd = data.groups.filter((g) => !existingNames.has(g.name.toLowerCase()));
          return [...prev, ...toAdd];
        });
      }
      if (data.shoppingList?.length) {
        setShoppingList((prev) => [...data.shoppingList!, ...prev]);
      }
    }
  };

  // Filter recipes for main feed
  const filteredRecipes = recipes.filter((rec) => {
    const matchesGroup =
      selectedGroup === 'all' || rec.groups.includes(selectedGroup);
    const matchesSearch =
      !searchQuery ||
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.ingredients.some((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesGroup && matchesSearch;
  });

  const pendingShoppingCount = shoppingList.filter((i) => !i.checked).length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'recipes') {
            setSelectedRecipe(null);
          }
        }}
        viewMode={viewMode}
        onToggleViewMode={() =>
          setViewMode((m) => (m === 'desktop' ? 'mobile-simulator' : 'desktop'))
        }
        shoppingCount={pendingShoppingCount}
        onOpenNewRecipe={() => {
          setEditingRecipe(null);
          setIsRecipeFormOpen(true);
        }}
        onOpenJsonSync={() => setIsJsonSyncOpen(true)}
        onOpenGroups={() => setIsGroupsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {viewMode === 'mobile-simulator' ? (
          /* Mobile View Simulator Mode */
          <MobileSimulator
            recipes={recipes}
            groups={groups}
            shoppingList={shoppingList}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            onExitMobileSimulator={() => setViewMode('desktop')}
            onOpenNewRecipe={() => {
              setEditingRecipe(null);
              setIsRecipeFormOpen(true);
            }}
            onOpenJsonSync={() => setIsJsonSyncOpen(true)}
            onOpenGroups={() => setIsGroupsModalOpen(true)}
            onSelectRecipe={(rec) => {
              setSelectedRecipe(rec);
              setCurrentTab('recipe-detail');
            }}
            onToggleShoppingItem={handleToggleShoppingItem}
            onDeleteShoppingItem={handleDeleteShoppingItem}
            onAddShoppingItem={handleAddManualShoppingItem}
            onClearCompletedShopping={handleClearCompletedShopping}
            onPrintA4={handleOpenPrintA4}
            onExportWord={handleExportWord}
            onExportJson={handleExportJsonSingle}
            onAddIngredientsToShopping={handleAddIngredientsToShopping}
          />
        ) : currentTab === 'shopping' ? (
          /* Shopping List Tab */
          <ShoppingList
            items={shoppingList}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onAddItem={handleAddManualShoppingItem}
            onClearCompleted={handleClearCompletedShopping}
            onClearAll={handleClearAllShopping}
          />
        ) : selectedRecipe ? (
          /* Single Recipe Detail View */
          <div className="py-6">
            <RecipeDetail
              recipe={selectedRecipe}
              onBack={() => {
                setSelectedRecipe(null);
                setCurrentTab('recipes');
              }}
              onEdit={handleEditRecipe}
              onPrintA4={handleOpenPrintA4}
              onExportWord={handleExportWord}
              onExportJson={handleExportJsonSingle}
              onAddIngredientsToShopping={handleAddIngredientsToShopping}
            />
          </div>
        ) : (
          /* Standard Recipes Catalog View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Hero Banner / Inspiring Header */}
            <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white relative overflow-hidden shadow-lg border border-stone-800">
              <div className="relative z-10 max-w-2xl">
                <span className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2 block">
                  Kolekcje & Przepisy
                </span>
                <h1 className="font-serif-culinary text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Twoja domowa książka kucharska
                </h1>
                <p className="text-stone-300 text-xs sm:text-sm mt-2.5 leading-relaxed">
                  Zarządzaj przepisami, twórz własne grupy (np. Wigilia), generuj listy zakupów, drukuj w formacie A4 oraz zapisuj w Word i lekkich plikach JSON.
                </p>

                {/* Quick Action Badges */}
                <div className="flex items-center gap-3 mt-6 flex-wrap">
                  <button
                    onClick={() => {
                      setEditingRecipe(null);
                      setIsRecipeFormOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Dodaj nowy przepis
                  </button>

                  <button
                    onClick={() => setIsGroupsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700 transition-colors"
                  >
                    <FolderHeart className="w-4 h-4 text-amber-400" />
                    Zarządzaj grupami ({groups.length})
                  </button>

                  <button
                    onClick={() => setIsJsonSyncOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700 transition-colors"
                  >
                    <FileJson className="w-4 h-4 text-sky-400" />
                    Zapisz / Otwórz JSON
                  </button>
                </div>
              </div>

              {/* Background ambient decorative motif */}
              <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 text-stone-800/30 text-9xl font-serif pointer-events-none select-none hidden lg:block">
                🍽️
              </div>
            </div>

            {/* Search and Group Filter Controls */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj po nazwie, opisie lub składnikach (np. borowiki, mak)..."
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter info */}
                <div className="flex items-center gap-2 text-xs text-stone-500 justify-end">
                  <span className="font-medium">
                    Znaleziono: <strong className="text-stone-900">{filteredRecipes.length}</strong> {filteredRecipes.length === 1 ? 'przepis' : 'przepisów'}
                  </span>
                </div>
              </div>

              {/* Functional Interactive Filter Controls: Groups (Frontend Design: clean segmented tabs) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedGroup('all')}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                    selectedGroup === 'all'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Wszystkie ({recipes.length})
                </button>

                {groups.map((group) => {
                  const count = recipes.filter((r) => r.groups.includes(group.name)).length;
                  const isSelected = selectedGroup === group.name;

                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group.name)}
                      className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span>{group.icon || '📁'}</span>
                      <span>{group.name}</span>
                      <span className={`text-[10px] tabular-nums ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setIsGroupsModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl text-amber-700 hover:bg-amber-50 font-semibold transition-colors shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nowa grupa
                </button>
              </div>
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
                <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-3 stroke-1" />
                <h3 className="text-base font-bold text-stone-800">
                  Nie znaleziono przepisów
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? `Brak wyników dla zapytania „${searchQuery}”. Spróbuj zmienić słowo kluczowe.`
                    : `W grupie „${selectedGroup}” nie ma jeszcze żadnych przepisów.`}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {selectedGroup !== 'all' && (
                    <button
                      onClick={() => setSelectedGroup('all')}
                      className="px-3 py-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100"
                    >
                      Pokaż wszystkie przepisy
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingRecipe(null);
                      setIsRecipeFormOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800"
                  >
                    Dodaj przepis do tej grupy
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={(rec) => {
                      setSelectedRecipe(rec);
                      setCurrentTab('recipe-detail');
                    }}
                    onEdit={handleEditRecipe}
                    onDelete={handleDeleteRecipe}
                    onPrintA4={handleOpenPrintA4}
                    onExportWord={handleExportWord}
                    onAddAllToShopping={(rec) => handleAddIngredientsToShopping(rec, rec.ingredients)}
                  />
                ))}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-stone-200 bg-white py-6 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-culinary font-bold text-stone-900">
              Cookmate PL
            </span>
            <span>·</span>
            <span>Książka Przepisów & Lista Zakupów</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span>Druk format A4</span>
            <span>·</span>
            <span>Zapis Word (.docx)</span>
            <span>·</span>
            <span>Pliki JSON</span>
            <span>·</span>
            <span>Tryb mobilny</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RecipeFormModal
        isOpen={isRecipeFormOpen}
        recipe={editingRecipe}
        groups={groups}
        onClose={() => {
          setIsRecipeFormOpen(false);
          setEditingRecipe(null);
        }}
        onSave={handleSaveRecipe}
        onCreateGroup={handleCreateGroup}
      />

      <A4PrintModal
        isOpen={isPrintA4Open}
        recipe={recipeForPrint}
        onClose={() => {
          setIsPrintA4Open(false);
          setRecipeForPrint(null);
        }}
      />

      <JsonSyncModal
        isOpen={isJsonSyncOpen}
        recipes={recipes}
        groups={groups}
        shoppingList={shoppingList}
        onClose={() => setIsJsonSyncOpen(false)}
        onImportSuccess={handleImportJsonSuccess}
      />

      <GroupManager
        isOpen={isGroupsModalOpen}
        groups={groups}
        recipes={recipes}
        onClose={() => setIsGroupsModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        onDeleteGroup={handleDeleteGroup}
        onSelectGroupFilter={(grpName) => {
          setSelectedGroup(grpName);
          setCurrentTab('recipes');
          setSelectedRecipe(null);
        }}
      />

    </div>
  );
}
