/**
 * Reports Screen — Report settimanali con dettagli e trend.
 * Lista scrollabile di report con vista dettagliata.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius, FontSizes } from '../../constants/theme';
import { useExpenses } from '../../contexts/ExpenseContext';
import {
  generateRecentReports,
  WeeklyReportData,
  formatWeekRange,
  formatDateIT,
} from '../../lib/reportGenerator';
import { getCategoryById } from '../../lib/categories';
import WeeklyReportCard from '../../components/WeeklyReportCard';

export default function ReportsScreen() {
  const { state } = useExpenses();
  const [reports, setReports] = useState<WeeklyReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReportData | null>(null);

  const loadReports = useCallback(async () => {
    if (!state.isDbReady) return;
    try {
      const data = await generateRecentReports(8);
      setReports(data);
    } catch (err) {
      console.error('Errore caricamento report:', err);
    } finally {
      setLoading(false);
    }
  }, [state.isDbReady]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.title}>Report</Text>
        <Text style={styles.subtitle}>I tuoi report settimanali</Text>

        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Generazione report...</Text>
          </View>
        ) : reports.length === 0 || reports.every((r) => r.expenseCount === 0) ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Nessun report disponibile</Text>
            <Text style={styles.emptySubtext}>
              I report verranno generati automaticamente quando avrai registrato delle spese
            </Text>
          </View>
        ) : (
          reports
            .filter((r) => r.expenseCount > 0)
            .map((report, index) => (
              <WeeklyReportCard
                key={report.weekStart}
                report={report}
                onPress={() => setSelectedReport(report)}
              />
            ))
        )}
      </ScrollView>

      {/* Modal dettaglio report */}
      <Modal visible={!!selectedReport} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Handle */}
              <View style={styles.modalHandle} />

              {selectedReport && (
                <>
                  {/* Header */}
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>Report Settimanale</Text>
                    <Text style={styles.detailPeriod}>
                      {formatWeekRange(selectedReport.weekStart, selectedReport.weekEnd)}
                    </Text>
                  </View>

                  {/* Totale */}
                  <View style={styles.detailTotalCard}>
                    <Text style={styles.detailTotalLabel}>Totale speso</Text>
                    <Text style={styles.detailTotalAmount}>
                      €{selectedReport.totalAmount.toFixed(2).replace('.', ',')}
                    </Text>
                    {selectedReport.changePercentage !== null && (
                      <Text
                        style={[
                          styles.detailTrend,
                          {
                            color:
                              selectedReport.changePercentage > 0
                                ? Colors.error
                                : Colors.success,
                          },
                        ]}
                      >
                        {selectedReport.changePercentage > 0 ? '↑' : '↓'}{' '}
                        {Math.abs(selectedReport.changePercentage).toFixed(1)}% vs settimana
                        precedente
                      </Text>
                    )}
                  </View>

                  {/* Top categorie */}
                  <Text style={styles.detailSectionTitle}>🏆 Dove hai speso di più</Text>
                  {selectedReport.topCategories.map((cat, index) => (
                    <View
                      key={cat.category_id}
                      style={[
                        styles.detailCategoryRow,
                        cat.isHighest && styles.detailCategoryHighest,
                      ]}
                    >
                      <Text style={styles.detailCategoryRank}>#{index + 1}</Text>
                      <Text style={styles.detailCategoryIcon}>{cat.icon}</Text>
                      <View style={styles.detailCategoryInfo}>
                        <Text style={styles.detailCategoryName}>{cat.category_name}</Text>
                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${cat.percentage}%`,
                                backgroundColor: cat.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={styles.detailCategoryValues}>
                        <Text style={[styles.detailCategoryAmount, { color: cat.color }]}>
                          €{cat.total.toFixed(2).replace('.', ',')}
                        </Text>
                        <Text style={styles.detailCategoryPerc}>
                          {Math.round(cat.percentage)}%
                        </Text>
                      </View>
                      {cat.isHighest && (
                        <View style={[styles.topBadge, { backgroundColor: cat.color }]}>
                          <Text style={styles.topBadgeText}>TOP</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {/* Breakdown giornaliero */}
                  <Text style={styles.detailSectionTitle}>📅 Giorno per giorno</Text>
                  {selectedReport.dailyBreakdown.map((day) => (
                    <View key={day.date} style={styles.dayRow}>
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayName}>{day.dayName}</Text>
                        <Text style={styles.dayDate}>{formatDateIT(day.date)}</Text>
                        <Text
                          style={[
                            styles.dayTotal,
                            day.total === 0 && styles.dayTotalZero,
                          ]}
                        >
                          {day.total > 0
                            ? `€${day.total.toFixed(2).replace('.', ',')}`
                            : 'Nessuna spesa'}
                        </Text>
                      </View>
                      {day.expenses.map((expense) => {
                        const cat = getCategoryById(expense.category_id);
                        return (
                          <View key={expense.id} style={styles.dayExpense}>
                            <Text style={styles.dayExpenseIcon}>{cat?.icon ?? '❓'}</Text>
                            <Text style={styles.dayExpenseDesc} numberOfLines={1}>
                              {expense.description}
                            </Text>
                            <Text style={styles.dayExpenseAmount}>
                              -€{expense.amount.toFixed(2).replace('.', ',')}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}

                  {/* Media giornaliera */}
                  <View style={styles.avgCard}>
                    <Text style={styles.avgLabel}>Media giornaliera</Text>
                    <Text style={styles.avgAmount}>
                      €{selectedReport.averageDaily.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedReport(null)}
            >
              <Text style={styles.closeText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.xxxl,
  },
  title: { fontFamily: Fonts.heading, fontSize: FontSizes.hero, color: Colors.text },
  subtitle: {
    fontFamily: Fonts.body, fontSize: FontSizes.md, color: Colors.textSecondary,
    marginTop: Spacing.xs, marginBottom: Spacing.lg,
  },
  loadingState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  loadingText: { fontFamily: Fonts.body, fontSize: FontSizes.md, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontFamily: Fonts.headingMedium, fontSize: FontSizes.lg, color: Colors.textSecondary },
  emptySubtext: {
    fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.textTertiary, textAlign: 'center',
  },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
    maxHeight: '95%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.textTertiary,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  detailHeader: { marginBottom: Spacing.lg },
  detailTitle: { fontFamily: Fonts.heading, fontSize: FontSizes.xxxl, color: Colors.text },
  detailPeriod: {
    fontFamily: Fonts.body, fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.xs,
  },
  detailTotalCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg,
    alignItems: 'center', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  detailTotalLabel: {
    fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  detailTotalAmount: {
    fontFamily: Fonts.heading, fontSize: FontSizes.display, color: Colors.text, marginVertical: Spacing.sm,
  },
  detailTrend: { fontFamily: Fonts.headingMedium, fontSize: FontSizes.sm },
  detailSectionTitle: {
    fontFamily: Fonts.heading, fontSize: FontSizes.xl, color: Colors.text,
    marginTop: Spacing.lg, marginBottom: Spacing.md,
  },
  detailCategoryRow: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  detailCategoryHighest: { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '08' },
  detailCategoryRank: {
    fontFamily: Fonts.heading, fontSize: FontSizes.md, color: Colors.textTertiary, width: 24,
  },
  detailCategoryIcon: { fontSize: 24 },
  detailCategoryInfo: { flex: 1, gap: 4 },
  detailCategoryName: { fontFamily: Fonts.headingMedium, fontSize: FontSizes.md, color: Colors.text },
  progressBarBg: {
    height: 4, backgroundColor: Colors.backgroundLight, borderRadius: 2, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2 },
  detailCategoryValues: { alignItems: 'flex-end' },
  detailCategoryAmount: { fontFamily: Fonts.heading, fontSize: FontSizes.md },
  detailCategoryPerc: { fontFamily: Fonts.body, fontSize: FontSizes.xs, color: Colors.textTertiary },
  topBadge: {
    position: 'absolute', top: -6, right: 12,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
  },
  topBadgeText: { fontFamily: Fonts.heading, fontSize: 8, color: '#fff', letterSpacing: 1 },
  dayRow: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  dayName: { fontFamily: Fonts.headingMedium, fontSize: FontSizes.md, color: Colors.text },
  dayDate: { fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.textSecondary, flex: 1 },
  dayTotal: { fontFamily: Fonts.heading, fontSize: FontSizes.md, color: Colors.text },
  dayTotalZero: { color: Colors.textTertiary, fontFamily: Fonts.body },
  dayExpense: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md, gap: Spacing.sm,
  },
  dayExpenseIcon: { fontSize: 16 },
  dayExpenseDesc: { fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.textSecondary, flex: 1 },
  dayExpenseAmount: { fontFamily: Fonts.headingMedium, fontSize: FontSizes.sm, color: Colors.secondary },
  avgCard: {
    backgroundColor: Colors.primary + '15', borderRadius: Radius.lg, padding: Spacing.lg,
    alignItems: 'center', marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30',
  },
  avgLabel: { fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.primaryLight },
  avgAmount: { fontFamily: Fonts.heading, fontSize: FontSizes.xxl, color: Colors.primary, marginTop: Spacing.xs },
  closeButton: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingVertical: Spacing.md,
    alignItems: 'center', marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  closeText: { fontFamily: Fonts.headingMedium, fontSize: FontSizes.lg, color: Colors.text },
});
