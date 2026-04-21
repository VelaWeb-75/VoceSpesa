/**
 * Database layer per VoceSpesa
 * Gestisce tutte le operazioni CRUD su SQLite per spese, categorie e report.
 */
import * as SQLite from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from './categories';

// Tipo per le spese
export interface Expense {
  id: number;
  amount: number;
  description: string;
  category_id: number;
  date: string; // ISO 8601
  created_at: string;
  voice_transcript: string | null;
}

// Tipo per i report settimanali
export interface WeeklyReportRecord {
  id: number;
  week_start: string;
  week_end: string;
  total_amount: number;
  top_category_id: number | null;
  report_data: string; // JSON
  created_at: string;
}

// Tipo per aggregati per categoria
export interface CategoryTotal {
  category_id: number;
  category_name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Inizializza il database e crea le tabelle se non esistono
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('vocespesa.db');

  // Abilita WAL mode per performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Crea tabelle
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      budget_limit REAL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      voice_transcript TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS weekly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      total_amount REAL NOT NULL,
      top_category_id INTEGER,
      report_data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
    CREATE INDEX IF NOT EXISTS idx_reports_week ON weekly_reports(week_start);
  `);

  // Inserisci categorie predefinite se non esistono
  const existingCategories = await db.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );

  if (existingCategories[0].count === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.runAsync(
        'INSERT INTO categories (id, name, icon, color, is_custom) VALUES (?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.icon, cat.color, cat.isCustom ? 1 : 0]
      );
    }
  }

  return db;
}

/**
 * Ottieni l'istanza del database (deve essere già inizializzato)
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database non inizializzato. Chiama initDatabase() prima.');
  return db;
}

// ==================== EXPENSES ====================

/**
 * Aggiunge una nuova spesa
 */
export async function addExpense(
  amount: number,
  description: string,
  categoryId: number,
  date: string,
  voiceTranscript?: string
): Promise<number> {
  const database = getDatabase();
  const result = await database.runAsync(
    'INSERT INTO expenses (amount, description, category_id, date, voice_transcript) VALUES (?, ?, ?, ?, ?)',
    [amount, description, categoryId, date, voiceTranscript ?? null]
  );
  return result.lastInsertRowId;
}

/**
 * Aggiorna una spesa esistente
 */
export async function updateExpense(
  id: number,
  amount: number,
  description: string,
  categoryId: number,
  date: string
): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    'UPDATE expenses SET amount = ?, description = ?, category_id = ?, date = ? WHERE id = ?',
    [amount, description, categoryId, date, id]
  );
}

/**
 * Elimina una spesa
 */
export async function deleteExpense(id: number): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

/**
 * Ottieni tutte le spese in un intervallo di date
 */
export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<Expense[]> {
  const database = getDatabase();
  return await database.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC, created_at DESC',
    [startDate, endDate]
  );
}

/**
 * Ottieni spese per categoria in un intervallo di date
 */
export async function getExpensesByCategory(
  categoryId: number,
  startDate?: string,
  endDate?: string
): Promise<Expense[]> {
  const database = getDatabase();
  if (startDate && endDate) {
    return await database.getAllAsync<Expense>(
      'SELECT * FROM expenses WHERE category_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      [categoryId, startDate, endDate]
    );
  }
  return await database.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE category_id = ? ORDER BY date DESC',
    [categoryId]
  );
}

/**
 * Ottieni i totali per categoria in un intervallo di date (per pie chart)
 */
export async function getTotalsByCategory(
  startDate: string,
  endDate: string
): Promise<CategoryTotal[]> {
  const database = getDatabase();
  const results = await database.getAllAsync<{
    category_id: number;
    name: string;
    icon: string;
    color: string;
    total: number;
    count: number;
  }>(
    `SELECT 
      e.category_id,
      c.name,
      c.icon,
      c.color,
      SUM(e.amount) as total,
      COUNT(e.id) as count
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.date >= ? AND e.date <= ?
    GROUP BY e.category_id
    ORDER BY total DESC`,
    [startDate, endDate]
  );

  // Calcola la percentuale
  const grandTotal = results.reduce((sum, r) => sum + r.total, 0);
  return results.map((r) => ({
    category_id: r.category_id,
    category_name: r.name,
    icon: r.icon,
    color: r.color,
    total: r.total,
    count: r.count,
    percentage: grandTotal > 0 ? (r.total / grandTotal) * 100 : 0,
  }));
}

/**
 * Ottieni il totale delle spese in un intervallo di date
 */
export async function getTotalExpenses(
  startDate: string,
  endDate: string
): Promise<number> {
  const database = getDatabase();
  const result = await database.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?',
    [startDate, endDate]
  );
  return result?.total ?? 0;
}

/**
 * Conta le spese nel mese corrente (per limiti freemium)
 */
export async function getMonthlyExpenseCount(): Promise<number> {
  const database = getDatabase();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM expenses WHERE date >= ? AND date <= ?',
    [startOfMonth, endOfMonth]
  );
  return result?.count ?? 0;
}

/**
 * Ottieni le ultime N spese
 */
export async function getRecentExpenses(limit: number = 10): Promise<Expense[]> {
  const database = getDatabase();
  return await database.getAllAsync<Expense>(
    'SELECT * FROM expenses ORDER BY date DESC, created_at DESC LIMIT ?',
    [limit]
  );
}

// ==================== WEEKLY REPORTS ====================

/**
 * Salva o aggiorna un report settimanale
 */
export async function saveWeeklyReport(
  weekStart: string,
  weekEnd: string,
  totalAmount: number,
  topCategoryId: number | null,
  reportData: object
): Promise<number> {
  const database = getDatabase();

  // Controlla se esiste già un report per questa settimana
  const existing = await database.getFirstAsync<{ id: number }>(
    'SELECT id FROM weekly_reports WHERE week_start = ?',
    [weekStart]
  );

  if (existing) {
    await database.runAsync(
      'UPDATE weekly_reports SET total_amount = ?, top_category_id = ?, report_data = ? WHERE id = ?',
      [totalAmount, topCategoryId, JSON.stringify(reportData), existing.id]
    );
    return existing.id;
  }

  const result = await database.runAsync(
    'INSERT INTO weekly_reports (week_start, week_end, total_amount, top_category_id, report_data) VALUES (?, ?, ?, ?, ?)',
    [weekStart, weekEnd, totalAmount, topCategoryId, JSON.stringify(reportData)]
  );
  return result.lastInsertRowId;
}

/**
 * Ottieni tutti i report settimanali ordinati per data
 */
export async function getAllWeeklyReports(): Promise<WeeklyReportRecord[]> {
  const database = getDatabase();
  return await database.getAllAsync<WeeklyReportRecord>(
    'SELECT * FROM weekly_reports ORDER BY week_start DESC'
  );
}

/**
 * Ottieni un report settimanale specifico
 */
export async function getWeeklyReport(weekStart: string): Promise<WeeklyReportRecord | null> {
  const database = getDatabase();
  return await database.getFirstAsync<WeeklyReportRecord>(
    'SELECT * FROM weekly_reports WHERE week_start = ?',
    [weekStart]
  );
}
