import React from 'react';
import { X, Printer, ChefHat, Clock, Users, CheckSquare, Sparkles } from 'lucide-react';
import type { Recipe } from '../types/recipe';

interface A4PrintModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const A4PrintModal: React.FC<A4PrintModalProps> = ({
  recipe,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !recipe) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2 bg-stone-900/90 backdrop-blur-md text-white p-2 rounded-2xl shadow-xl border border-stone-700">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Drukuj A4</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
          title="Zamknij podgląd"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* The Printable A4 Sheet */}
      <div className="print-container bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-8 sm:p-12 text-stone-900 print:shadow-none print:p-0 print:max-w-none print:w-full print:border-none print:m-0 rounded-2xl print:rounded-none">
        
        {/* Header Ribbon */}
        <div className="border-b-2 border-amber-600 pb-5 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-1 tracking-wide uppercase">
                <span>{recipe.groups.join(' · ') || 'Książka Przepisów'}</span>
                <span>/</span>
                <span>Trudność: {recipe.difficulty}</span>
              </div>
              <h1 className="font-serif-culinary text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-xs sm:text-sm text-stone-600 italic mt-2 leading-relaxed">
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            {recipe.thumbnail && (
              <div className="w-36 h-28 sm:w-44 sm:h-32 rounded-xl overflow-hidden shrink-0 border border-stone-200 bg-stone-100 shadow-xs">
                <img
                  src={recipe.thumbnail}
                  alt={recipe.title}
                  className="w-full h-full object-cover print-header-img"
                />
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-700 font-medium">
            <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
              <span>
                <strong>Porcje:</strong> {recipe.servings}
              </span>
              <span>
                <strong>Przygotowanie:</strong> {recipe.prepTimeMinutes} min
              </span>
              <span>
                <strong>Gotowanie / Pieczenie:</strong> {recipe.cookTimeMinutes} min
              </span>
              <span>
                <strong>Łączny czas:</strong> {totalTime} min
              </span>
            </div>
            <span className="text-[10px] text-stone-400 hidden sm:inline">
              Cookmate PL · Książka Przepisów
            </span>
          </div>
        </div>

        {/* 2-Column Split for A4 layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 print:grid-cols-12">
          
          {/* Column 1: Ingredients with checkboxes for paper use */}
          <div className="sm:col-span-5 print:col-span-5 bg-stone-50/70 p-4 rounded-xl border border-stone-200 print:bg-transparent print:border-stone-300">
            <h2 className="font-serif-culinary text-base font-bold text-stone-900 pb-2 border-b border-stone-200 uppercase tracking-wider text-xs">
              Składniki
            </h2>

            <div className="mt-3 space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <div key={ing.id || idx} className="flex items-start gap-2 text-xs leading-snug">
                  {/* Paper Checkbox */}
                  <span className="w-3.5 h-3.5 rounded-sm border border-stone-400 shrink-0 mt-0.5 inline-block" />
                  <div className="flex-1">
                    <span className="font-medium text-stone-800">{ing.name}</span>
                    {ing.section && (
                      <span className="block text-[10px] text-stone-400 italic">
                        {ing.section}
                      </span>
                    )}
                  </div>
                  {(ing.amount || ing.unit) && (
                    <span className="font-bold tabular-nums text-stone-900 shrink-0">
                      {ing.amount} {ing.unit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Preparation Steps */}
          <div className="sm:col-span-7 print:col-span-7 space-y-4">
            <h2 className="font-serif-culinary text-base font-bold text-stone-900 pb-2 border-b border-stone-200 uppercase tracking-wider text-xs">
              Sposób przygotowania
            </h2>

            <div className="space-y-3.5">
              {recipe.steps.map((st, idx) => (
                <div key={st.id || idx} className="print-break-inside-avoid">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-xs text-amber-900">
                      Krok {idx + 1}.
                    </span>
                    {st.timerMinutes && (
                      <span className="text-[10px] text-stone-500 font-medium italic">
                        (⏱ {st.timerMinutes} min)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed pl-1">
                    {st.instruction}
                  </p>
                  {st.tip && (
                    <p className="text-[11px] text-amber-900 italic mt-1 pl-1 bg-amber-50/50 p-1.5 rounded border border-amber-200/40">
                      💡 {st.tip}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Chef Notes if any */}
            {recipe.notes && (
              <div className="mt-5 p-3 rounded-lg bg-stone-100/70 border border-stone-200 print-break-inside-avoid text-xs text-stone-700">
                <span className="font-bold block text-stone-900 mb-0.5">Wskazówki podania:</span>
                <p className="italic">{recipe.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400 print:mt-6">
          Wydrukowano z aplikacji Książka Przepisów & Lista Zakupów · Smacznego!
        </div>

      </div>
    </div>
  );
};
