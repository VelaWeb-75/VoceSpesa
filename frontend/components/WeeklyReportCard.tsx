/**
 * WeeklyReportCard — Card per visualizzare un report settimanale.
 * Mostra periodo, totale, top categoria e trend vs settimana precedente.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius, FontSizes, Shadows } from '../constants/theme';
import { WeeklyReportData, formatWeekRange } from '../lib/reportGenerator';

interface WeeklyReportCardProps {
  report: WeeklyReportData;
  onPress?: () => void;
}

export default function WeeklyReportCard({ report, onPress }: WeeklyReportCardProps) {
  const trendUp = report.changePercentage !== null && report.changePercentage > 0;
  const trendDown = report.changePercentage !== null && report.changePercentage < 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.period}>
            {formatWeekRange(report.weekStart, report.weekEnd)}
          </Text>
          <Text style={styles.expenseCount}>
            {report.expenseCount} {report.expenseCount === 1 ? 'spesa' : 'spese'}
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalAmount}>
            €{report.totalAmount.toFixed(2).replace('.', ',')}
          </Text>
          {report.changePercentage !== null && (
            <View style={[
              styles.trendBadge,
              trendUp && styles.trendBadgeUp,
              trendDown && styles.trendBadgeDown,
            ]}>
              <Text style={[
                styles.trendText,
                trendUp && styles.trendTextUp,
                trendDown && styles.trendTextDown,
              ]}>
                {trendUp ? '↑' : '↓'} {Math.abs(report.changePercentage).toFixed(0)}%
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Top categories */}
      {report.topCategories.length > 0 && (
        <View style={styles.categoriesRow}>
          {report.topCategories.slice(0, 3).map((cat, index) => (
            <View
              key={cat.category_id}
              style={[
                styles.categoryChip,
                cat.isHighest && styles.categoryChipHighest,
                { borderColor: cat.color + '60' },
              ]}
            >
              {cat.isHighest && (
                <View style={[styles.highestBadge, { backgroundColor: cat.color }]}>
                  <Text style={styles.highestBadgeText}>TOP</Text>
                </View>
              )}
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName} numberOfLines={1}>{cat.category_name}</Text>
                <Text style={[styles.categoryAmount, { color: cat.color }]}>
                  €{cat.total.toFixed(0)} · {Math.round(cat.percentage)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Daily mini bar */}
      <View style={styles.dailyBar}>
        {report.dailyBreakdown.map((day) => {
          const maxDaily = Math.max(...report.dailyBreakdown.map((d) => d.total), 1);
          const height = Math.max((day.total / maxDaily) * 32, 3);
          return (
            <View key={day.date} style={styles.dayColumn}>
              <View style={[styles.dayBar, { height, backgroundColor: day.total > 0 ? Colors.primary : Colors.border }]} />
              <Text style={styles.dayLabel}>
                {day.dayName.substring(0, 2)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Media giornaliera: €{report.averageDaily.toFixed(2).replace('.', ',')}
        </Text>
        <Text style={styles.footerArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  period: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  expenseCount: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  totalContainer: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  totalAmount: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xxl,
    color: Colors.text,
  },
  trendBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundLight,
  },
  trendBadgeUp: {
    backgroundColor: Colors.error + '20',
  },
  trendBadgeDown: {
    backgroundColor: Colors.success + '20',
  },
  trendText: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  trendTextUp: {
    color: Colors.error,
  },
  trendTextDown: {
    color: Colors.success,
  },
  categoriesRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  categoryChipHighest: {
    borderWidth: 1.5,
  },
  highestBadge: {
    position: 'absolute',
    top: -6,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  highestBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 8,
    color: Colors.text,
    letterSpacing: 1,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  categoryAmount: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.sm,
  },
  dailyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 3,
  },
  dayLabel: {
    fontFamily: Fonts.body,
    fontSize: 9,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  footerArrow: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.primary,
  },
});
