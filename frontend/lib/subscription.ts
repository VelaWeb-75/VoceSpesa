/**
 * Logica freemium per VoceSpesa.
 * Gestisce i limiti della versione Free e il paywall.
 */
import { getMonthlyExpenseCount } from './database';
import { FREE_CATEGORY_IDS } from './categories';

export type SubscriptionTier = 'free' | 'pro' | 'business';

// Limiti per tier
export const TIER_LIMITS = {
  free: {
    maxExpensesPerMonth: 30,
    maxCategories: 6, // 5 + Altro
    hasAI: false,
    hasExport: false,
    hasBackup: false,
    hasBudget: false,
    hasAds: true,
    filters: ['month'] as string[],
    reportDetail: 'basic' as const,
  },
  pro: {
    maxExpensesPerMonth: Infinity,
    maxCategories: Infinity,
    hasAI: true,
    hasExport: true,
    hasBackup: true,
    hasBudget: true,
    hasAds: false,
    filters: ['week', 'month', 'year'] as string[],
    reportDetail: 'detailed' as const,
  },
  business: {
    maxExpensesPerMonth: Infinity,
    maxCategories: Infinity,
    hasAI: true,
    hasExport: true,
    hasBackup: true,
    hasBudget: true,
    hasAds: false,
    filters: ['week', 'month', 'year'] as string[],
    reportDetail: 'detailed' as const,
  },
};

// Pricing
export const PRICING = {
  pro: {
    monthly: 3.99,
    yearly: 29.99,
    yearlyMonthly: 2.50, // equivalente mensile
    trialDays: 7,
  },
  business: {
    monthly: 9.99,
    yearly: 89.99,
    yearlyMonthly: 7.50,
    trialDays: 14,
  },
};

// Features per il paywall comparison
export const FEATURES_LIST = [
  { name: 'Spese al mese', free: '30', pro: 'Illimitate', business: 'Illimitate' },
  { name: 'Categorie', free: '5', pro: 'Illimitate', business: 'Illimitate' },
  { name: 'Categorie personalizzate', free: false, pro: true, business: true },
  { name: 'Categorizzazione AI', free: false, pro: true, business: true },
  { name: 'Filtri dashboard', free: 'Mensile', pro: 'Tutti', business: 'Tutti' },
  { name: 'Report dettagliati', free: false, pro: true, business: true },
  { name: 'Export PDF/CSV', free: false, pro: true, business: true },
  { name: 'Backup iCloud', free: false, pro: true, business: true },
  { name: 'Budget per categoria', free: false, pro: true, business: true },
  { name: 'Nessuna pubblicità', free: false, pro: true, business: true },
  { name: 'Spese condivise', free: false, pro: false, business: true },
  { name: 'OCR Ricevute', free: false, pro: false, business: true },
  { name: 'Report fiscale', free: false, pro: false, business: true },
];

// Stato corrente (in produzione userebbe expo-in-app-purchases)
let currentTier: SubscriptionTier = 'free';

export function getCurrentTier(): SubscriptionTier {
  return currentTier;
}

export function setCurrentTier(tier: SubscriptionTier): void {
  currentTier = tier;
}

export function getTierLimits() {
  return TIER_LIMITS[currentTier];
}

export function isPro(): boolean {
  return currentTier === 'pro' || currentTier === 'business';
}

export function isBusiness(): boolean {
  return currentTier === 'business';
}

/**
 * Controlla se l'utente può aggiungere una nuova spesa
 */
export async function canAddExpense(): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  maxCount?: number;
}> {
  if (isPro()) return { allowed: true };
  try {
    const count = await getMonthlyExpenseCount();
    const max = TIER_LIMITS.free.maxExpensesPerMonth;
    if (count >= max) {
      return {
        allowed: false,
        reason: `Hai raggiunto il limite di ${max} spese questo mese. Passa a Pro per spese illimitate!`,
        currentCount: count,
        maxCount: max,
      };
    }
    return { allowed: true, currentCount: count, maxCount: max };
  } catch {
    // Database non ancora inizializzato — permettiamo l'operazione
    return { allowed: true };
  }
}

/**
 * Controlla se una categoria è disponibile nel tier corrente
 */
export function isCategoryAvailable(categoryId: number): boolean {
  if (isPro()) return true;
  return FREE_CATEGORY_IDS.includes(categoryId);
}

/**
 * Controlla se un filtro è disponibile nel tier corrente
 */
export function isFilterAvailable(filter: string): boolean {
  return getTierLimits().filters.includes(filter);
}
