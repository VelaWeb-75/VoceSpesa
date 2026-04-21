/**
 * Dashboard Screen — Grafici a torta con filtri temporali.
 * Mostra distribuzione spese per categoria con filtri settimanale/mensile/annuale.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius, FontSizes, Shadows } from '../../constants/theme';
import { useExpenses } from '../../contexts/ExpenseContext';
import FilterBar from '../../components/FilterBar';
import PieChartView from '../../components/PieChartView';
import PaywallModal from '../../components/PaywallModal';

export default function DashboardScreen() {
  const { state, setFilter, refreshData } = useExpenses();
  const [showPaywall, setShowPaywall] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Calcola statistiche
  const topCategory = state.categoryTotals.length > 0 ? state.categoryTotals[0] : null;
  const categoryCount = state.categoryTotals.length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Panoramica delle tue spese</Text>

        {/* Filtri */}
        <FilterBar
          currentFilter={state.currentFilter}
          onFilterChange={setFilter}
          onPaywallNeeded={() => setShowPaywall(true)}
        />

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Totale</Text>
            <Text style={styles.statValue}>
              €{state.totalAmount.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Categorie</Text>
            <Text style={styles.statValue}>{categoryCount}</Text>
          </View>
          {topCategory && (
            <View style={[styles.statCard, styles.statCardHighlight]}>
              <Text style={styles.statLabel}>Più speso</Text>
              <Text style={styles.statEmoji}>{topCategory.icon}</Text>
              <Text style={styles.statHighlight} numberOfLines={1}>
                {topCategory.category_name}
              </Text>
            </View>
          )}
        </View>

        {/* Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribuzione Spese</Text>
          <PieChartView
            data={state.categoryTotals}
            totalAmount={state.totalAmount}
          />
        </View>
      </ScrollView>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribed={refreshData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.hero,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  statCardHighlight: {
    borderColor: Colors.secondary + '40',
    backgroundColor: Colors.secondary + '10',
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xl,
    color: Colors.text,
  },
  statEmoji: {
    fontSize: 24,
  },
  statHighlight: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.xs,
    color: Colors.secondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  chartTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
});
