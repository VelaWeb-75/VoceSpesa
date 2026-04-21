/**
 * Context globale per la gestione delle spese.
 * Fornisce stato e azioni a tutta l'app.
 */
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  initDatabase,
  addExpense as dbAddExpense,
  deleteExpense as dbDeleteExpense,
  getRecentExpenses,
  getTotalsByCategory,
  getTotalExpenses,
  Expense,
  CategoryTotal,
} from '../lib/database';
import { getDateRangeForFilter } from '../lib/reportGenerator';

// State type
interface ExpenseState {
  isLoading: boolean;
  isDbReady: boolean;
  recentExpenses: Expense[];
  categoryTotals: CategoryTotal[];
  totalAmount: number;
  currentFilter: 'week' | 'month' | 'year';
  error: string | null;
}

// Action types
type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DB_READY'; payload: boolean }
  | { type: 'SET_RECENT_EXPENSES'; payload: Expense[] }
  | { type: 'SET_CATEGORY_TOTALS'; payload: CategoryTotal[] }
  | { type: 'SET_TOTAL_AMOUNT'; payload: number }
  | { type: 'SET_FILTER'; payload: 'week' | 'month' | 'year' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'EXPENSE_ADDED'; payload: Expense };

// Initial state
const initialState: ExpenseState = {
  isLoading: true,
  isDbReady: false,
  recentExpenses: [],
  categoryTotals: [],
  totalAmount: 0,
  currentFilter: 'month',
  error: null,
};

// Reducer
function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DB_READY':
      return { ...state, isDbReady: action.payload, isLoading: false };
    case 'SET_RECENT_EXPENSES':
      return { ...state, recentExpenses: action.payload };
    case 'SET_CATEGORY_TOTALS':
      return { ...state, categoryTotals: action.payload };
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmount: action.payload };
    case 'SET_FILTER':
      return { ...state, currentFilter: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'EXPENSE_ADDED':
      return {
        ...state,
        recentExpenses: [action.payload, ...state.recentExpenses].slice(0, 20),
      };
    default:
      return state;
  }
}

// Context type
interface ExpenseContextType {
  state: ExpenseState;
  addNewExpense: (amount: number, description: string, categoryId: number, voiceTranscript?: string) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
  setFilter: (filter: 'week' | 'month' | 'year') => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Inizializza il database
  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        dispatch({ type: 'SET_DB_READY', payload: true });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: 'Errore inizializzazione database' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    init();
  }, []);

  // Carica dati quando il DB è pronto o il filtro cambia
  const refreshData = useCallback(async () => {
    if (!state.isDbReady) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const recent = await getRecentExpenses(20);
      dispatch({ type: 'SET_RECENT_EXPENSES', payload: recent });

      const range = getDateRangeForFilter(state.currentFilter);
      const totals = await getTotalsByCategory(range.startDate, range.endDate);
      dispatch({ type: 'SET_CATEGORY_TOTALS', payload: totals });

      const total = await getTotalExpenses(range.startDate, range.endDate);
      dispatch({ type: 'SET_TOTAL_AMOUNT', payload: total });

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Errore caricamento dati' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.isDbReady, state.currentFilter]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Aggiungi una spesa
  const addNewExpense = useCallback(
    async (amount: number, description: string, categoryId: number, voiceTranscript?: string) => {
      const today = new Date().toISOString().split('T')[0];
      await dbAddExpense(amount, description, categoryId, today, voiceTranscript);
      await refreshData();
    },
    [refreshData]
  );

  // Rimuovi una spesa
  const removeExpense = useCallback(
    async (id: number) => {
      await dbDeleteExpense(id);
      await refreshData();
    },
    [refreshData]
  );

  // Cambia filtro
  const setFilter = useCallback((filter: 'week' | 'month' | 'year') => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  return (
    <ExpenseContext.Provider value={{ state, addNewExpense, removeExpense, refreshData, setFilter }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses deve essere usato dentro ExpenseProvider');
  return context;
}
