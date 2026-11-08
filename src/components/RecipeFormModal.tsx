import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Clock,
  Users,
  ChefHat,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { Recipe, Ingredient, Step, RecipeGroup } from '../types/recipe';
import { compressImageToThumbnail } from '../utils/imageCompressor';

interface RecipeFormModalProps {
  recipe?: Recipe | null;
  groups: RecipeGroup[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onCreateGroup?: (name: string) => void;
}

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  recipe,
  groups,
  isOpen,
  onClose,
  onSave,
  onCreateGroup,
}) => {
  const isEditing = !!recipe;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [thumbnail, setThumbnail] = useState(recipe?.thumbnail || '');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(recipe?.prepTimeMinutes || 20);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(recipe?.cookTimeMinutes || 30);
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>(recipe?.difficulty || 'Średni');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(recipe?.groups || ['Wigilia']);
  const [newGroupInput, setNewGroupInput] = useState('');
  const [notes, setNotes] = useState(recipe?.notes || '');
  
  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length
      ? recipe.ingredients
      : [
          { id: '1', name: 'Mąka pszenna', amount: '500', unit: 'g', section: 'Ciasto' },
          { id: '2', name: 'Ciepła woda', amount: '250', unit: 'ml', section: 'Ciasto' },
        ]
  );

  // Steps
  const [steps, setSteps] = useState<Step[]>(
    recipe?.steps?.length
      ? recipe.steps
      : [
          { id: '1', stepNumber: 1, instruction: 'Przygotuj składniki i oczyść warzywa.' },
          { id: '2', stepNumber: 2, instruction: 'Gotuj na wolnym ogniu przez 20 minut.', timerMinutes: 20 },
        ]
  );

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle image upload and client-side thumbnail compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setErrorMsg('');
      const compressedDataUrl = await compressImageToThumbnail(file, 640, 480, 0.78);
      setThumbnail(compressedDataUrl);
    } catch (err) {
      setErrorMsg('Nie udało się skompresować grafiki: ' + (err as Error).message);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Toggle group selection
  const toggleGroup = (groupName: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  // Add new custom group
  const handleAddNewGroup = () => {
    const clean = newGroupInput.trim();
    if (!clean) return;
    if (!selectedGroups.includes(clean)) {
      setSelectedGroups((prev) => [...prev, clean]);
      if (onCreateGroup) onCreateGroup(clean);
    }
    setNewGroupInput('');
  };

  // Ingredient methods
  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', amount: '', unit: '', section: '' },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Step methods
  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        stepNumber: prev.length + 1,
        instruction: '',
      },
    ]);
  };

  const handleUpdateStep = (index: number, field: keyof Step, value: any) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    });
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Wpisz tytuł przepisu');
      return;
    }
    if (ingredients.filter((i) => i.name.trim()).length === 0) {
      setErrorMsg('Dodaj co najmniej jeden składnik');
      return;
    }
    if (steps.filter((s) => s.instruction.trim()).length === 0) {
      setErrorMsg('Dodaj co najmniej jeden etap przygotowania');
      return;
    }

    const newRecipe: Recipe = {
      id: recipe?.id || `rec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      thumbnail: thumbnail.trim(),
      prepTimeMinutes: Number(prepTimeMinutes) || 0,
      cookTimeMinutes: Number(cookTimeMinutes) || 0,
      servings: Number(servings) || 4,
      difficulty,
      groups: selectedGroups.length ? selectedGroups : ['Ogólne'],
      ingredients: ingredients
        .filter((i) => i.name.trim())
        .map((i) => ({ ...i, name: i.name.trim(), amount: i.amount.trim(), unit: i.unit.trim() })),
      steps: steps
        .filter((s) => s.instruction.trim())
        .map((s, idx) => ({ ...s, stepNumber: idx + 1, instruction: s.instruction.trim() })),
      notes: notes.trim(),
      createdAt: recipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="font-serif-culinary text-xl font-bold text-stone-900">
              {isEditing ? 'Edytuj przepis' : 'Dodaj nowy przepis'}
            </h2>
            <p className="text-xs text-stone-500">
              Uzupełnij składniki, etapy oraz dodaj miniaturkę
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Photo and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Thumbnail upload & preview */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Zdjęcie miniaturki
              </label>

              <div className="relative aspect-[4/3] rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 hover:border-amber-500 overflow-hidden flex flex-col items-center justify-center text-center p-4 transition-colors group">
                {thumbnail ? (
                  <>
                    <img
                      src={thumbnail}
                      alt="Podgląd miniaturki"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-xs font-medium bg-white text-stone-900 rounded-lg hover:bg-stone-100"
                      >
                        Zmień
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbnail('')}
                        className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Usuń
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                  >
                    <Upload className="w-8 h-8 text-stone-400 group-hover:text-amber-600 mb-2 stroke-1" />
                    <span className="text-xs font-medium text-stone-700 group-hover:text-amber-600">
                      {isProcessingImage ? 'Przetwarzanie...' : 'Wgraj zdjęcie'}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1">
                      Kompresowane automatycznie do lekkiej miniaturki (idealnej do pliku JSON)
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Or paste image URL */}
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Lub wklej link do zdjęcia..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tytuł potrawy *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="np. Barszcz wigilijny z uszkami"
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Krótki opis
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Krótki, apetyczny opis lub historia dania..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                />
              </div>

              {/* Time, Servings, Difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Przygotowanie
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={prepTimeMinutes}
                      onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 pr-7"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-stone-400">min</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Gotowanie
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={cookTimeMinutes}
                      onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 pr-7"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-stone-400">min</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Porcje
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Trudność
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full text-xs px-2 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="Łatwy">Łatwy</option>
                    <option value="Średni">Średni</option>
                    <option value="Zaawansowany">Zaawansowany</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Groups & Categories (Kolekcje np. Wigilia) */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                Grupy i kolekcje (np. Wigilia, Szybki obiad)
              </label>
            </div>

            {/* Existing group chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {groups.map((grp) => {
                const isSelected = selectedGroups.includes(grp.name);
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => toggleGroup(grp.name)}
                    className={`px-3 py-1 text-xs rounded-xl border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {grp.icon && <span>{grp.icon}</span>}
                    <span>{grp.name}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>

            {/* Quick add custom group */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dodaj nową grupę (np. Wigilia, Wielkanoc)..."
                value={newGroupInput}
                onChange={(e) => setNewGroupInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewGroup();
                  }
                }}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
              <button
                type="button"
                onClick={handleAddNewGroup}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-900 text-white rounded-lg transition-colors"
              >
                Dodaj grupę
              </button>
            </div>
          </div>

          {/* Section 3: Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Składniki potrawy
                </h3>
                <p className="text-[11px] text-stone-500">
                  Wpisz nazwę, ilość oraz jednostkę (te składniki tworzą też listę zakupów)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Dodaj składnik
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.id || idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200"
                >
                  <input
                    type="text"
                    placeholder="Nazwa składnika (np. Buraki)"
                    value={ing.name}
                    onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Ilość (np. 1.5)"
                    value={ing.amount}
                    onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                    className="w-20 text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Jedn. (np. kg)"
                    value={ing.unit}
                    onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                    className="w-20 text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Sekcja (np. Ciasto)"
                    value={ing.section || ''}
                    onChange={(e) => handleUpdateIngredient(idx, 'section', e.target.value)}
                    className="w-28 text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hidden sm:block"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Cooking Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Etapy przygotowania potrawy
                </h3>
                <p className="text-[11px] text-stone-500">
                  Krok po kroku instrukcja jak zrobić danie
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Dodaj krok
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">
                      Krok {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="number"
                          placeholder="Minuty"
                          value={st.timerMinutes || ''}
                          onChange={(e) =>
                            handleUpdateStep(
                              idx,
                              'timerMinutes',
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                          className="w-16 text-xs px-2 py-1 rounded border border-stone-300 bg-white"
                        />
                        <span className="text-[10px] text-stone-400">min</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Opisz co należy zrobić w tym kroku..."
                    value={st.instruction}
                    onChange={(e) => handleUpdateStep(idx, 'instruction', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  <input
                    type="text"
                    placeholder="Opcjonalna wskazówka szefa kuchni (np. pilnuj, by nie wrzało)..."
                    value={st.tip || ''}
                    onChange={(e) => handleUpdateStep(idx, 'tip', e.target.value)}
                    className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Chef Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Notatki kucharza / Wskazówki podania
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="np. Podawaj z gorącymi uszkami i świeżym koperkiem..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors"
            >
              {isEditing ? 'Zapisz zmiany' : 'Zapisz przepis'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
