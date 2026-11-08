import React from 'react';
import {
  Clock,
  Users,
  ChefHat,
  ShoppingCart,
  Printer,
  FileText,
  MoreVertical,
  Edit2,
  Trash2,
  Utensils,
} from 'lucide-react';
import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
  onPrintA4: (recipe: Recipe) => void;
  onExportWord: (recipe: Recipe) => void;
  onAddAllToShopping: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onEdit,
  onDelete,
  onPrintA4,
  onExportWord,
  onAddAllToShopping,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Thumbnail Area */}
      <div
        onClick={() => onSelect(recipe)}
        className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer"
      >
        {recipe.thumbnail ? (
          <img
            src={recipe.thumbnail}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
            <Utensils className="w-10 h-10 stroke-1 mb-2" />
            <span className="text-xs font-medium">Brak zdjęcia</span>
          </div>
        )}

        {/* Floating Quick Action Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              aria-label="Opcje przepisu"
              className="p-1.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-sm shadow-md transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSelect(recipe);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <Utensils className="w-3.5 h-3.5 text-stone-500" />
                    Zobacz przepis i kroki
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onAddAllToShopping(recipe);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-stone-500" />
                    Dodaj do listy zakupów
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onPrintA4(recipe);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-500" />
                    Drukuj format A4
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onExportWord(recipe);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    Zapisz do Word (.docx)
                  </button>

                  <div className="h-px bg-stone-100 my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(recipe);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                    Edytuj przepis
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (confirm(`Czy na pewno chcesz usunąć przepis "${recipe.title}"?`)) {
                        onDelete(recipe.id);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    Usuń przepis
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Line (Frontend Design Anti-Pill Discipline) */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-stone-500 mb-2 font-medium">
            {recipe.groups.length > 0 ? (
              recipe.groups.map((grp, i) => (
                <React.Fragment key={grp}>
                  <span className="text-amber-700 font-semibold">{grp}</span>
                  {i < recipe.groups.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))
            ) : (
              <span>Ogólne</span>
            )}
            <span aria-hidden="true">·</span>
            <span>{recipe.difficulty}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(recipe)}
            className="font-serif-culinary text-lg font-semibold text-stone-900 group-hover:text-amber-700 transition-colors cursor-pointer line-clamp-1"
          >
            {recipe.title}
          </h3>

          {/* Short description */}
          <p className="text-stone-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {recipe.description || 'Brak opisu'}
          </p>
        </div>

        {/* Footer Info Strip */}
        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Łączny czas">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="tabular-nums">{totalTime} min</span>
            </span>

            <span className="flex items-center gap-1" title="Ilość porcji">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span className="tabular-nums">{recipe.servings} porcji</span>
            </span>
          </div>

          <button
            onClick={() => onSelect(recipe)}
            className="text-amber-700 hover:text-amber-800 font-semibold text-xs flex items-center gap-1 hover:underline underline-offset-2"
          >
            Gotuj →
          </button>
        </div>
      </div>
    </div>
  );
};
