import React, { useState, useRef } from 'react';
import {
  X,
  FileJson,
  Download,
  Upload,
  Check,
  AlertCircle,
  FileCode,
  Layers,
  Database,
} from 'lucide-react';
import type { Recipe, RecipeGroup, ShoppingItem } from '../types/recipe';
import { exportToJsonFile, importFromJsonFile } from '../utils/jsonSync';

interface JsonSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  groups: RecipeGroup[];
  shoppingList: ShoppingItem[];
  onImportSuccess: (data: {
    recipes: Recipe[];
    groups: RecipeGroup[];
    shoppingList?: ShoppingItem[];
    mode: 'merge' | 'replace';
  }) => void;
}

export const JsonSyncModal: React.FC<JsonSyncModalProps> = ({
  isOpen,
  onClose,
  recipes,
  groups,
  shoppingList,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    recipes: Recipe[];
    groups: RecipeGroup[];
    shoppingList?: ShoppingItem[];
  } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle Export
  const handleExportAll = () => {
    exportToJsonFile(recipes, groups, shoppingList);
    setSuccessMsg('Pomyślnie wyeksportowano plik JSON!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedFile(file);

    try {
      const data = await importFromJsonFile(file);
      setParsedPreview(data);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setParsedPreview(null);
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    onImportSuccess({
      ...parsedPreview,
      mode: importMode,
    });
    setSuccessMsg(
      `Pomyślnie zaimportowano ${parsedPreview.recipes.length} przepisów!`
    );
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-culinary text-lg font-bold text-stone-900">
                Zapisz / Otwórz plik JSON
              </h2>
              <p className="text-[11px] text-stone-500">
                Lekki format ze skompresowanymi miniaturkami zdjęć
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Export JSON */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5 mb-1">
                  <Download className="w-4 h-4 text-amber-600" />
                  Eksportuj do pliku JSON
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Pobierz plik ze wszystkimi Twoimi przepisami ({recipes.length}), grupami ({groups.length}) oraz listą zakupów. Zawiera wbudowane miniaturki w base64, dzięki czemu możesz go łatwo przenieść na inny komputer lub telefon.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportAll}
              className="mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Pobierz plik .json ({recipes.length} przepisów)
            </button>
          </div>

          {/* Section 2: Import JSON */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5 mb-1">
              <Upload className="w-4 h-4 text-sky-600" />
              Otwórz plik JSON z przepisami
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Wybierz wcześniej wyeksportowany plik JSON, aby wczytać przepisy wraz ze zdjęciami miniaturkami.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            {!parsedPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-sky-500 hover:bg-sky-50/30 flex flex-col items-center justify-center text-stone-600 transition-colors"
              >
                <FileCode className="w-8 h-8 text-stone-400 mb-1.5 stroke-1" />
                <span className="text-xs font-semibold text-stone-800">
                  Wybierz plik .json z dysku
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5">
                  Kliknij tutaj, aby załadować
                </span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-950">
                    Plik: {selectedFile?.name}
                  </span>
                  <button
                    onClick={() => {
                      setParsedPreview(null);
                      setSelectedFile(null);
                    }}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Wybierz inny
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-sky-100">
                    <span className="text-[10px] text-stone-500 block">Przepisy</span>
                    <span className="font-bold text-stone-900">{parsedPreview.recipes.length} pozycji</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-sky-100">
                    <span className="text-[10px] text-stone-500 block">Grupy</span>
                    <span className="font-bold text-stone-900">{parsedPreview.groups?.length || 0} grup</span>
                  </div>
                </div>

                {/* Import Mode selection */}
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Tryb wczytywania:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${importMode === 'merge' ? 'bg-white border-sky-500 font-semibold' : 'bg-transparent border-stone-200'}`}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                      />
                      <span>Dołącz do obecnych</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${importMode === 'replace' ? 'bg-white border-red-500 font-semibold text-red-700' : 'bg-transparent border-stone-200'}`}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                      />
                      <span>Zastąp wszystko</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleConfirmImport}
                  className="w-full mt-2 py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Wczytaj i zastosuj przepisy
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
