import React, { useState } from 'react';
import {
  BookOpen,
  ShoppingCart,
  FolderHeart,
  Plus,
  Monitor,
  Search,
  Clock,
  Users,
  ChevronRight,
  Printer,
  FileText,
  FileJson,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import type { Recipe, RecipeGroup, ShoppingItem, Ingredient } from '../types/recipe';

interface MobileSimulatorProps {
  recipes: Recipe[];
  groups: RecipeGroup[];
  shoppingList: ShoppingItem[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  onExitMobileSimulator: () => void;
  onOpenNewRecipe: () => void;
  onOpenJsonSync: () => void;
  onOpenGroups: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleShoppingItem: (id: string) => void;
  onDeleteShoppingItem: (id: string) => void;
  onAddShoppingItem: (name: string, amount: string, unit: string) => void;
  onClearCompletedShopping: () => void;
  onPrintA4: (recipe: Recipe) => void;
  onExportWord: (recipe: Recipe) => void;
  onExportJson: (recipe: Recipe) => void;
  onAddIngredientsToShopping: (recipe: Recipe, ingredients: Ingredient[]) => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  recipes,
  groups,
  shoppingList,
  selectedGroup,
  onSelectGroup,
  onExitMobileSimulator,
  onOpenNewRecipe,
  onOpenJsonSync,
  onOpenGroups,
  onSelectRecipe,
  onToggleShoppingItem,
  onDeleteShoppingItem,
  onAddShoppingItem,
  onClearCompletedShopping,
  onPrintA4,
  onExportWord,
  onExportJson,
  onAddIngredientsToShopping,
}) => {
  const [mobileTab, setMobileTab] = useState<'recipes' | 'shopping' | 'groups'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMobileRecipe, setSelectedMobileRecipe] = useState<Recipe | null>(null);
  const [mobileServings, setMobileServings] = useState<number>(4);
  const [checkedPrepIngredients, setCheckedPrepIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [newShopItem, setNewShopItem] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  // Filter recipes
  const filteredRecipes = recipes.filter((rec) => {
    const matchesGroup = selectedGroup === 'all' || rec.groups.includes(selectedGroup);
    const matchesSearch =
      !searchQuery ||
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const pendingShoppingCount = shoppingList.filter((i) => !i.checked).length;

  const handleOpenDetail = (recipe: Recipe) => {
    setSelectedMobileRecipe(recipe);
    setMobileServings(recipe.servings || 4);
    setCheckedPrepIngredients({});
    setCompletedSteps({});
  };

  const handleMobileAddAllShopping = () => {
    if (!selectedMobileRecipe) return;
    const ratio = mobileServings / (selectedMobileRecipe.servings || 1);
    const scaled = selectedMobileRecipe.ingredients.map((ing) => {
      const num = parseFloat(ing.amount?.replace(',', '.') || '');
      const scaledAmt = isNaN(num)
        ? ing.amount
        : Number.isInteger(num * ratio)
        ? (num * ratio).toString()
        : (num * ratio).toFixed(1).replace('.0', '');
      return { ...ing, amount: scaledAmt };
    });
    onAddIngredientsToShopping(selectedMobileRecipe, scaled);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="py-6 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Top Banner Control to Exit */}
      <div className="no-print mb-4 flex items-center gap-3 bg-stone-900 text-stone-100 px-4 py-2 rounded-2xl shadow-md border border-stone-800 text-xs">
        <span className="font-medium text-amber-400">📱 Symulator widoku smartfona</span>
        <span className="text-stone-500">|</span>
        <button
          onClick={onExitMobileSimulator}
          className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Wróć do widoku pełnego</span>
        </button>
      </div>

      {/* Realistic Smartphone Chassis Frame */}
      <div className="relative w-[385px] h-[780px] bg-stone-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-stone-800/80 flex flex-col">
        
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-stone-900 rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-stone-950 mr-3" />
          <div className="w-2 h-2 rounded-full bg-stone-800/60" />
        </div>

        {/* Screen Bezel / Container */}
        <div className="w-full h-full bg-stone-50 rounded-[38px] overflow-hidden flex flex-col relative">
          
          {/* Simulated Mobile Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-stone-900 select-none shrink-0 z-40 bg-stone-50">
            <span>12:45</span>
            <div className="flex items-center gap-1.5 text-stone-800 text-[10px]">
              <span>5G</span>
              <span>100% 🔋</span>
            </div>
          </div>

          {/* Toast inside phone */}
          {addedToast && (
            <div className="absolute top-12 left-4 right-4 z-50 bg-stone-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dodano składniki do zakupów!</span>
            </div>
          )}

          {/* Mobile Screen Body */}
          <div className="flex-1 overflow-y-auto pb-20">
            
            {/* If Single Recipe Detail is Active inside Mobile */}
            {selectedMobileRecipe ? (
              <div>
                {/* Mobile Recipe Header */}
                <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-2.5 border-b border-stone-200 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedMobileRecipe(null)}
                    className="flex items-center gap-1 text-xs font-semibold text-stone-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Wróć
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPrintA4(selectedMobileRecipe)}
                      className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100"
                      title="Drukuj A4"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onExportWord(selectedMobileRecipe)}
                      className="p-1.5 rounded-lg text-blue-700 hover:bg-stone-100"
                      title="Pobierz Word"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Hero Thumbnail */}
                <div className="w-full aspect-[4/3] bg-stone-200 relative">
                  {selectedMobileRecipe.thumbnail ? (
                    <img
                      src={selectedMobileRecipe.thumbnail}
                      alt={selectedMobileRecipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      Brak zdjęcia
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 bg-white border-b border-stone-200">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold mb-1">
                    <span>{selectedMobileRecipe.groups.join(' · ')}</span>
                    <span>·</span>
                    <span>{selectedMobileRecipe.difficulty}</span>
                  </div>

                  <h2 className="font-serif-culinary text-xl font-bold text-stone-900 leading-snug">
                    {selectedMobileRecipe.title}
                  </h2>

                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    {selectedMobileRecipe.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-100 text-center text-xs">
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-[10px] text-stone-400 block">Czas</span>
                      <span className="font-bold text-stone-800">
                        {selectedMobileRecipe.prepTimeMinutes + selectedMobileRecipe.cookTimeMinutes} min
                      </span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-[10px] text-stone-400 block">Porcje</span>
                      <div className="flex items-center justify-center gap-1 font-bold">
                        <button
                          onClick={() => setMobileServings((s) => Math.max(1, s - 1))}
                          className="px-1 text-stone-500"
                        >
                          -
                        </button>
                        <span>{mobileServings}</span>
                        <button
                          onClick={() => setMobileServings((s) => s + 1)}
                          className="px-1 text-stone-500"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-[10px] text-stone-400 block">Poziom</span>
                      <span className="font-bold text-stone-800 text-[11px]">
                        {selectedMobileRecipe.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Ingredients with checks */}
                <div className="p-4 bg-stone-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif-culinary text-base font-bold text-stone-900">
                      Składniki ({selectedMobileRecipe.ingredients.length})
                    </h3>
                    <button
                      onClick={handleMobileAddAllShopping}
                      className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-lg flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Do zakupów
                    </button>
                  </div>

                  <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-stone-200">
                    {selectedMobileRecipe.ingredients.map((ing) => {
                      const isChecked = checkedPrepIngredients[ing.id];
                      return (
                        <div
                          key={ing.id}
                          onClick={() =>
                            setCheckedPrepIngredients((prev) => ({
                              ...prev,
                              [ing.id]: !prev[ing.id],
                            }))
                          }
                          className="flex items-center justify-between py-1.5 text-xs border-b border-stone-100 last:border-0 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-300 shrink-0" />
                            )}
                            <span className={isChecked ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}>
                              {ing.name}
                            </span>
                          </div>
                          <span className={`font-semibold tabular-nums ${isChecked ? 'line-through text-stone-400' : 'text-amber-800'}`}>
                            {ing.amount} {ing.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Steps */}
                <div className="p-4 space-y-3">
                  <h3 className="font-serif-culinary text-base font-bold text-stone-900">
                    Sposób przygotowania
                  </h3>

                  {selectedMobileRecipe.steps.map((st, idx) => {
                    const isDone = completedSteps[st.id];
                    return (
                      <div
                        key={st.id}
                        onClick={() =>
                          setCompletedSteps((prev) => ({
                            ...prev,
                            [st.id]: !prev[st.id],
                          }))
                        }
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-stone-100 text-stone-400 border-stone-200'
                            : 'bg-white border-stone-200 text-stone-800 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold ${isDone ? 'text-stone-400' : 'text-amber-800'}`}>
                            Krok {idx + 1} {st.timerMinutes && `(⏱ ${st.timerMinutes} min)`}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-300" />
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${isDone ? 'line-through text-stone-400' : ''}`}>
                          {st.instruction}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : mobileTab === 'recipes' ? (
              /* Mobile Recipes Feed */
              <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj przepisu (np. barszcz, ciasto)..."
                    className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {/* Horizontal Group Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  <button
                    onClick={() => onSelectGroup('all')}
                    className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-all ${
                      selectedGroup === 'all'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    Wszystkie ({recipes.length})
                  </button>
                  {groups.map((grp) => (
                    <button
                      key={grp.id}
                      onClick={() => onSelectGroup(grp.name)}
                      className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-all ${
                        selectedGroup === grp.name
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-stone-600 border border-stone-200'
                      }`}
                    >
                      {grp.icon} {grp.name}
                    </button>
                  ))}
                </div>

                {/* Mobile Recipe Cards */}
                <div className="space-y-3">
                  {filteredRecipes.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleOpenDetail(rec)}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="aspect-[16/9] w-full bg-stone-100 relative">
                        {rec.thumbnail ? (
                          <img
                            src={rec.thumbnail}
                            alt={rec.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            Brak zdjęcia
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                          {rec.groups[0] || 'Książka'}
                        </span>
                      </div>

                      <div className="p-3">
                        <h3 className="font-serif-culinary text-sm font-bold text-stone-900 line-clamp-1">
                          {rec.title}
                        </h3>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {rec.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                          <span>⏱ {rec.prepTimeMinutes + rec.cookTimeMinutes} min</span>
                          <span>👥 {rec.servings} porcji</span>
                          <span className="text-amber-800 font-semibold">Gotuj →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : mobileTab === 'shopping' ? (
              /* Mobile Shopping Tab */
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-culinary text-lg font-bold text-stone-900">
                    Lista Zakupów
                  </h2>
                  {shoppingList.some((i) => i.checked) && (
                    <button
                      onClick={onClearCompletedShopping}
                      className="text-[10px] text-stone-500 hover:text-red-600 underline"
                    >
                      Wyczyść kupione
                    </button>
                  )}
                </div>

                {/* Quick Add Input inside phone */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newShopItem.trim()) return;
                    onAddShoppingItem(newShopItem.trim(), '', '');
                    setNewShopItem('');
                  }}
                  className="flex gap-1.5"
                >
                  <input
                    type="text"
                    value={newShopItem}
                    onChange={(e) => setNewShopItem(e.target.value)}
                    placeholder="Dodaj produkt do kupienia..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-stone-300"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
                  >
                    Dodaj
                  </button>
                </form>

                {/* Mobile Shopping Item List with Strikethrough */}
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
                  {shoppingList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-400">
                      Brak produktów na liście zakupów.
                    </div>
                  ) : (
                    shoppingList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleShoppingItem(item.id)}
                        className={`flex items-center justify-between p-3 cursor-pointer select-none ${
                          item.checked ? 'bg-stone-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {item.checked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 shrink-0" />
                          )}
                          <span
                            className={`text-xs font-medium truncate ${
                              item.checked ? 'line-through text-stone-400' : 'text-stone-900'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        {(item.amount || item.unit) && (
                          <span
                            className={`text-[11px] font-semibold tabular-nums shrink-0 ml-2 ${
                              item.checked ? 'line-through text-stone-400' : 'text-amber-800'
                            }`}
                          >
                            {item.amount} {item.unit}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Mobile Groups Tab */
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-culinary text-lg font-bold text-stone-900">
                    Grupy & Kolekcje
                  </h2>
                  <button
                    onClick={onOpenGroups}
                    className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg"
                  >
                    + Nowa grupa
                  </button>
                </div>

                <div className="space-y-2">
                  {groups.map((grp) => {
                    const count = recipes.filter((r) => r.groups.includes(grp.name)).length;
                    return (
                      <div
                        key={grp.id}
                        onClick={() => {
                          onSelectGroup(grp.name);
                          setMobileTab('recipes');
                        }}
                        className="flex items-center justify-between p-3 bg-white rounded-2xl border border-stone-200 cursor-pointer active:bg-amber-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{grp.icon || '📁'}</span>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900">{grp.name}</h4>
                            <span className="text-[10px] text-stone-500">{count} przepisów</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Mobile Bottom Navigation Bar (Pattern 1 from Skill) */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-stone-200 grid grid-cols-4 items-center px-2 z-40">
            <button
              onClick={() => {
                setSelectedMobileRecipe(null);
                setMobileTab('recipes');
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                mobileTab === 'recipes' && !selectedMobileRecipe
                  ? 'text-amber-600 font-bold'
                  : 'text-stone-500'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">Przepisy</span>
            </button>

            <button
              onClick={() => {
                setSelectedMobileRecipe(null);
                setMobileTab('shopping');
              }}
              className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                mobileTab === 'shopping' ? 'text-amber-600 font-bold' : 'text-stone-500'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">Zakupy</span>
              {pendingShoppingCount > 0 && (
                <span className="absolute top-1 right-5 bg-amber-500 text-stone-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingShoppingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedMobileRecipe(null);
                setMobileTab('groups');
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                mobileTab === 'groups' ? 'text-amber-600 font-bold' : 'text-stone-500'
              }`}
            >
              <FolderHeart className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">Grupy</span>
            </button>

            <button
              onClick={onOpenNewRecipe}
              className="flex flex-col items-center justify-center min-h-[44px] text-amber-700"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">Dodaj</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
