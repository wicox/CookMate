import type { Recipe, RecipeGroup, ShoppingItem } from '../types/recipe';

export interface AppExportData {
  version: string;
  exportedAt: string;
  recipes: Recipe[];
  groups: RecipeGroup[];
  shoppingList?: ShoppingItem[];
}

/**
 * Trigger download of recipe database or single recipe as a JSON file
 */
export function exportToJsonFile(
  recipes: Recipe[],
  groups: RecipeGroup[],
  shoppingList?: ShoppingItem[],
  customFilename?: string
): void {
  const exportPayload: AppExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    recipes,
    groups,
    shoppingList: shoppingList || [],
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = customFilename || `przepisy-kucharskie-${new Date().toISOString().slice(0, 10)}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger download of a single recipe as JSON
 */
export function exportSingleRecipeToJson(recipe: Recipe): void {
  const jsonString = JSON.stringify(recipe, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const sanitizedTitle = recipe.title.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'przepis';
  const filename = `${sanitizedTitle}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read and parse an imported JSON file
 */
export async function importFromJsonFile(file: File): Promise<{
  recipes: Recipe[];
  groups: RecipeGroup[];
  shoppingList?: ShoppingItem[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Case 1: Full AppExportData format
        if (parsed.recipes && Array.isArray(parsed.recipes)) {
          resolve({
            recipes: parsed.recipes,
            groups: Array.isArray(parsed.groups) ? parsed.groups : [],
            shoppingList: Array.isArray(parsed.shoppingList) ? parsed.shoppingList : [],
          });
          return;
        }

        // Case 2: Array of recipes
        if (Array.isArray(parsed)) {
          resolve({
            recipes: parsed,
            groups: [],
            shoppingList: [],
          });
          return;
        }

        // Case 3: Single recipe object
        if (parsed.title && Array.isArray(parsed.ingredients)) {
          resolve({
            recipes: [parsed as Recipe],
            groups: [],
            shoppingList: [],
          });
          return;
        }

        reject(new Error('Niepoprawny format pliku JSON z przepisami.'));
      } catch (err) {
        reject(new Error('Błąd parsowania pliku JSON: ' + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku.'));
    reader.readAsText(file);
  });
}
