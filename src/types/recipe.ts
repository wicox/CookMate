export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  section?: string; // e.g. "Ciasto", "Farsz", "Dekoracja"
}

export interface Step {
  id: string;
  stepNumber: number;
  instruction: string;
  tip?: string;
  timerMinutes?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // Base64 or URL
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Łatwy' | 'Średni' | 'Zaawansowany';
  groups: string[]; // e.g. ["Wigilia", "Dania główne"]
  ingredients: Ingredient[];
  steps: Step[];
  sourceUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  recipeId?: string;
  recipeTitle?: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  category?: string;
  createdAt: string;
}

export interface RecipeGroup {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

export type ViewMode = 'desktop' | 'mobile-simulator';
export type AppTab = 'recipes' | 'recipe-detail' | 'recipe-edit' | 'shopping' | 'groups';
