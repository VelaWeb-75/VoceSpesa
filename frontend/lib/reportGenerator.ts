/**
 * Generatore di report settimanali.
 * Calcola aggregati, trend e evidenzia le categorie con più spese.
 */
import {
  getExpensesByDateRange,
  getTotalsByCategory,
  getTotalExpenses,
  saveWeeklyReport,
  CategoryTotal,
  Expense,
} from './database';

export interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  totalAmount: number;
  expenseCount: number;
  dailyBreakdown: DailyBreakdown[];
  categoryBreakdown: CategoryTotal[];
  topCategories: TopCategory[];
  previousWeekTotal: number | null;
  changePercentage: number | null;
  averageDaily: number;
}

export interface DailyBreakdown {
  date: string;
  dayName: string;
  total: number;
  expenses: Expense[];
}

export interface TopCategory {
  category_id: number;
  category_name: string;
  icon: string;
  color: string;
  total: number;
  percentage: number;
  isHighest: boolean;
}

const DAYS_IT = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateIT(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getDate()} ${MONTHS_IT[date.getMonth()]}`;
}

export function formatWeekRange(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} ${MONTHS_IT[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_IT[start.getMonth()]} - ${end.getDate()} ${MONTHS_IT[end.getMonth()]} ${end.getFullYear()}`;
}

export async function generateWeeklyReport(referenceDate: Date = new Date()): Promise<WeeklyReportData> {
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = getWeekEnd(referenceDate);
  const startStr = formatDateISO(weekStart);
  const endStr = formatDateISO(weekEnd);

  const expenses = await getExpensesByDateRange(startStr, endStr);
  const categoryBreakdown = await getTotalsByCategory(startStr, endStr);
  const totalAmount = await getTotalExpenses(startStr, endStr);

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekEnd);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
  const prevTotal = await getTotalExpenses(formatDateISO(prevWeekStart), formatDateISO(prevWeekEnd));

  const dailyBreakdown: DailyBreakdown[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dayStr = formatDateISO(day);
    const dayExpenses = expenses.filter((e) => e.date === dayStr);
    dailyBreakdown.push({
      date: dayStr,
      dayName: DAYS_IT[day.getDay()],
      total: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      expenses: dayExpenses,
    });
  }

  const topCategories: TopCategory[] = categoryBreakdown.map((cat, index) => ({
    category_id: cat.category_id,
    category_name: cat.category_name,
    icon: cat.icon,
    color: cat.color,
    total: cat.total,
    percentage: cat.percentage,
    isHighest: index === 0,
  }));

  const changePercentage = prevTotal > 0 ? ((totalAmount - prevTotal) / prevTotal) * 100 : null;

  const reportData: WeeklyReportData = {
    weekStart: startStr,
    weekEnd: endStr,
    totalAmount,
    expenseCount: expenses.length,
    dailyBreakdown,
    categoryBreakdown,
    topCategories,
    previousWeekTotal: prevTotal > 0 ? prevTotal : null,
    changePercentage,
    averageDaily: totalAmount / 7,
  };

  const topCategoryId = topCategories.length > 0 ? topCategories[0].category_id : null;
  await saveWeeklyReport(startStr, endStr, totalAmount, topCategoryId, reportData);

  return reportData;
}

export async function generateRecentReports(weeks: number = 4): Promise<WeeklyReportData[]> {
  const reports: WeeklyReportData[] = [];
  const today = new Date();
  for (let i = 0; i < weeks; i++) {
    const refDate = new Date(today);
    refDate.setDate(refDate.getDate() - i * 7);
    reports.push(await generateWeeklyReport(refDate));
  }
  return reports;
}

export function getDateRangeForFilter(filter: 'week' | 'month' | 'year') {
  const today = new Date();
  switch (filter) {
    case 'week': {
      const start = getWeekStart(today);
      const end = getWeekEnd(today);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end), label: 'Questa settimana' };
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end), label: MONTHS_IT[today.getMonth()] };
    }
    case 'year': {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end), label: `${today.getFullYear()}` };
    }
  }
}
