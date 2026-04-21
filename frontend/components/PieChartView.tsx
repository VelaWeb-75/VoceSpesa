/**
 * PieChartView — Grafico a torta per la dashboard delle spese.
 * Mostra distribuzione spese per categoria con legenda interattiva.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Colors, Fonts, Spacing, Radius, FontSizes, Shadows } from '../constants/theme';
import { CategoryTotal } from '../lib/database';

interface PieChartViewProps {
  data: CategoryTotal[];
  totalAmount: number;
}

export default function PieChartView({ data, totalAmount }: PieChartViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>Nessuna spesa registrata</Text>
        <Text style={styles.emptySubtext}>Usa il microfono per aggiungere la prima spesa</Text>
      </View>
    );
  }

  const pieData = data.map((item, index) => ({
    value: item.total,
    color: item.color,
    text: `${Math.round(item.percentage)}%`,
    focused: selectedIndex === index,
    onPress: () => setSelectedIndex(selectedIndex === index ? null : index),
  }));

  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View style={styles.container}>
      {/* Grafico */}
      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          donut
          radius={100}
          innerRadius={65}
          innerCircleColor={Colors.surface}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerAmount}>
                €{totalAmount.toFixed(0)}
              </Text>
              <Text style={styles.centerSubtext}>
                {selectedItem ? selectedItem.category_name : 'Totale'}
              </Text>
            </View>
          )}
          focusOnPress
          sectionAutoFocus
          textColor={Colors.text}
          textSize={10}
          fontWeight="bold"
        />
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        {data.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableOpacity
              key={item.category_id}
              style={[styles.legendItem, isSelected && styles.legendItemSelected]}
              onPress={() => setSelectedIndex(isSelected ? null : index)}
            >
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <View style={styles.legendInfo}>
                <Text style={styles.legendIcon}>{item.icon}</Text>
                <Text style={[styles.legendName, isSelected && styles.legendNameSelected]} numberOfLines={1}>
                  {item.category_name}
                </Text>
              </View>
              <View style={styles.legendValues}>
                <Text style={[styles.legendAmount, isSelected && styles.legendAmountSelected]}>
                  €{item.total.toFixed(2).replace('.', ',')}
                </Text>
                <Text style={styles.legendPercentage}>
                  {Math.round(item.percentage)}%
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAmount: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xxl,
    color: Colors.text,
  },
  centerSubtext: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  legend: {
    gap: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  legendItemSelected: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendIcon: {
    fontSize: 16,
  },
  legendName: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  legendNameSelected: {
    fontFamily: Fonts.headingMedium,
    color: Colors.text,
  },
  legendValues: {
    alignItems: 'flex-end',
  },
  legendAmount: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  legendAmountSelected: {
    fontFamily: Fonts.heading,
    color: Colors.primary,
  },
  legendPercentage: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
