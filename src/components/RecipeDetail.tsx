import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Printer,
  FileText,
  FileJson,
  ShoppingCart,
  Edit2,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookmarkCheck,
  Flame,
  Check,
} from 'lucide-react';
import type { Recipe, Ingredient } from '../types/recipe';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onPrintA4: (recipe: Recipe) => void;
  onExportWord: (recipe: Recipe) => void;
  onExportJson: (recipe: Recipe) => void;
  onAddIngredientsToShopping: (recipe: Recipe, ingredientsToAdd: Ingredient[]) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onEdit,
  onPrintA4,
  onExportWord,
  onExportJson,
  onAddIngredientsToShopping,
}) => {
  // Dynamic portion multiplier
  const [servings, setServings] = useState<number>(recipe.servings || 4);
  // Checklist for ingredients during prep
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  // Completed steps tracker
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  // Active step timer
  const [activeTimerStepId, setActiveTimerStepId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  // Shopping added toast
  const [showShoppingToast, setShowShoppingToast] = useState(false);

  // Portion multiplier calculation
  const ratio = servings / (recipe.servings || 1);

  const calculateAmount = (originalAmount: string): string => {
    if (!originalAmount) return '';
    const num = parseFloat(originalAmount.replace(',', '.'));
    if (isNaN(num)) return originalAmount; // e.g. "do smaku"
    const scaled = num * ratio;
    // format gracefully: integer or up to 2 decimal places
    return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1).replace('.0', '');
  };

  // Toggle ingredient checkbox
  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle step complete
  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Step timer handlers
  const startTimer = (stepId: string, minutes: number) => {
    if (activeTimerStepId === stepId && timerRunning) {
      setTimerRunning(false);
      return;
    }
    setActiveTimerStepId(stepId);
    setTimeLeft(minutes * 60);
    setTimerRunning(true);
  };

  const resetTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setTimerRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Play a quick subtle browser audio beep if allowed
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.connect(audioCtx.destination);
        osc.frequency.value = 587.33; // D5
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // audio context failed or blocked
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft]);

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddAllToShopping = () => {
    // Add scaled ingredients
    const scaledIngredients = recipe.ingredients.map((ing) => ({
      ...ing,
      amount: calculateAmount(ing.amount),
    }));
    onAddIngredientsToShopping(recipe, scaledIngredients);
    setShowShoppingToast(true);
    setTimeout(() => setShowShoppingToast(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 sm:px-6">
      {/* Top back button and actions bar */}
      <div className="no-print flex items-center justify-between py-4 mb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200/80 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Wszystkie przepisy
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onPrintA4(recipe)}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3 py-2 rounded-xl transition-colors shadow-xs"
            title="Drukuj przepis w eleganckim formacie A4"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Drukuj</span> A4
          </button>

          <button
            onClick={() => onExportWord(recipe)}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3 py-2 rounded-xl transition-colors shadow-xs"
            title="Zapisz do pliku Microsoft Word (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Zapisz</span> Word
          </button>

          <button
            onClick={() => onExportJson(recipe)}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3 py-2 rounded-xl transition-colors shadow-xs"
            title="Pobierz ten przepis jako plik JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Pobierz</span> JSON
          </button>

          <button
            onClick={() => onEdit(recipe)}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            Edytuj
          </button>
        </div>
      </div>

      {/* Shopping Toast Notification */}
      {showShoppingToast && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">Składniki dodane do listy zakupów!</p>
            <p className="text-[11px] text-stone-400">Możesz odznaczać je podczas zakupów.</p>
          </div>
        </div>
      )}

      {/* Main Recipe Card Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Hero split: Image and Key Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-stone-200/80">
          {/* Thumbnail */}
          <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:min-h-[360px] bg-stone-100">
            {recipe.thumbnail ? (
              <img
                src={recipe.thumbnail}
                alt={recipe.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <ChefHat className="w-16 h-16 stroke-1" />
              </div>
            )}
            
            {/* Overlay Gradient for readability on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent lg:hidden" />
            
            <div className="absolute bottom-3 left-4 right-4 lg:hidden text-white">
              <span className="text-xs font-medium text-amber-300">
                {recipe.groups.join(' · ')}
              </span>
            </div>
          </div>

          {/* Recipe Info */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Unboxed Metadata (Frontend Design Skill: Clean unboxed text) */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3">
                {recipe.groups.length > 0 ? (
                  recipe.groups.map((grp, i) => (
                    <React.Fragment key={grp}>
                      <span className="text-amber-800 uppercase tracking-wider text-[11px]">{grp}</span>
                      {i < recipe.groups.length - 1 && <span aria-hidden="true">/</span>}
                    </React.Fragment>
                  ))
                ) : (
                  <span>Ogólne</span>
                )}
                <span aria-hidden="true">·</span>
                <span className="text-stone-600 font-medium">Trudność: {recipe.difficulty}</span>
              </div>

              <h1 className="font-serif-culinary text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
                {recipe.title}
              </h1>

              <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-3 gap-3 text-center sm:text-left">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/50">
                <span className="text-[11px] text-stone-500 block font-medium">Przygotowanie</span>
                <span className="text-base sm:text-lg font-bold text-stone-900 tabular-nums">
                  {recipe.prepTimeMinutes} <span className="text-xs font-normal text-stone-500">min</span>
                </span>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/50">
                <span className="text-[11px] text-stone-500 block font-medium">Gotowanie / Pieczenie</span>
                <span className="text-base sm:text-lg font-bold text-stone-900 tabular-nums">
                  {recipe.cookTimeMinutes} <span className="text-xs font-normal text-stone-500">min</span>
                </span>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/50">
                <span className="text-[11px] text-amber-800 block font-medium">Łączny czas</span>
                <span className="text-base sm:text-lg font-bold text-amber-900 tabular-nums">
                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes} <span className="text-xs font-normal text-amber-700">min</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: 2 Columns (Ingredients & Steps) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          
          {/* Left Column: Ingredients with Servings Adjuster */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-stone-50/80 p-5 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/70">
                <div>
                  <h2 className="font-serif-culinary text-xl font-bold text-stone-900">
                    Składniki
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Zaznacz przygotowane produkty
                  </p>
                </div>

                {/* Servings Portions Scaler */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-300 shadow-xs">
                  <span className="text-xs font-semibold text-stone-600">Porcje:</span>
                  <button
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors text-xs"
                    aria-label="Zmniejsz porcje"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-stone-900 tabular-nums min-w-4 text-center">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings((s) => s + 1)}
                    className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors text-xs"
                    aria-label="Zwiększ porcje"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ingredients Checklist */}
              <div className="mt-4 space-y-2">
                {recipe.ingredients.map((ing) => {
                  const isChecked = !!checkedIngredients[ing.id];
                  const displayAmount = calculateAmount(ing.amount);

                  return (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-stone-100/60 text-stone-400'
                          : 'hover:bg-white text-stone-800'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-stone-400 group-hover:text-amber-600 transition-colors"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 text-xs">
                        <span className={isChecked ? 'line-through text-stone-400' : 'text-stone-900 font-medium'}>
                          {ing.name}
                        </span>
                        {ing.section && (
                          <span className="block text-[10px] text-stone-400 font-normal">
                            sekcja: {ing.section}
                          </span>
                        )}
                      </div>

                      {(displayAmount || ing.unit) && (
                        <div
                          className={`text-xs font-semibold tabular-nums shrink-0 ${
                            isChecked ? 'line-through text-stone-400' : 'text-amber-800'
                          }`}
                        >
                          {displayAmount} {ing.unit}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Button: Add to Shopping List */}
              <div className="mt-5 pt-4 border-t border-stone-200/70">
                <button
                  onClick={handleAddAllToShopping}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Dodaj składniki do Listy Zakupów
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Cooking Steps & Directions */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif-culinary text-xl sm:text-2xl font-bold text-stone-900">
                Sposób przygotowania
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                {Object.values(completedSteps).filter(Boolean).length} z {recipe.steps.length} kroków ukończonych
              </span>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-4">
              {recipe.steps.map((step, idx) => {
                const isStepDone = !!completedSteps[step.id];
                const hasTimer = !!step.timerMinutes;
                const isTimerActive = activeTimerStepId === step.id;

                return (
                  <div
                    key={step.id}
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isStepDone
                        ? 'bg-stone-50/70 border-stone-200 text-stone-400'
                        : 'bg-white border-stone-200/90 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                            isStepDone
                              ? 'bg-stone-200 text-stone-500'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className={`text-xs font-semibold ${isStepDone ? 'text-stone-400' : 'text-stone-900'}`}>
                          Krok {idx + 1}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleStep(step.id)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                          isStepDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isStepDone ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ukończono
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            Oznacz jako zrobiony
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step Instruction */}
                    <p className={`text-xs sm:text-sm leading-relaxed ${isStepDone ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                      {step.instruction}
                    </p>

                    {/* Optional Chef Tip */}
                    {step.tip && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/50 text-[11px] text-amber-900 flex items-start gap-2">
                        <span className="text-amber-600 shrink-0 font-bold">💡</span>
                        <span>{step.tip}</span>
                      </div>
                    )}

                    {/* Interactive Step Timer */}
                    {hasTimer && (
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-stone-700">
                            Minutnik: {step.timerMinutes} min
                          </span>
                          {isTimerActive && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md tabular-nums animate-pulse">
                              {formatTimerDisplay(timeLeft)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startTimer(step.id, step.timerMinutes || 5)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
                              isTimerActive && timerRunning
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                : 'bg-stone-900 text-white hover:bg-stone-800'
                            }`}
                          >
                            {isTimerActive && timerRunning ? (
                              <>
                                <Pause className="w-3 h-3" /> Wstrzymaj
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" /> Start
                              </>
                            )}
                          </button>

                          {isTimerActive && (
                            <button
                              onClick={() => resetTimer(step.id === activeTimerStepId ? step.timerMinutes || 5 : 5)}
                              className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                              title="Zresetuj minutnik"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chef notes section if available */}
            {recipe.notes && (
              <div className="mt-8 p-5 bg-stone-50 rounded-2xl border border-stone-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Notatki kucharza & podawanie
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{recipe.notes}"
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
