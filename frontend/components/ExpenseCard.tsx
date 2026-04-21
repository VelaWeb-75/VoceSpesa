/**
 * ExpenseCard — Card per visualizzare una singola spesa.
 * Mostra importo, descrizione, categoria e data con swipe-to-delete.
 */
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, Fonts, Spacing, Radius, FontSizes, Shadows } from '../constants/theme';
import { getCategoryById } from '../lib/categories';
import { Expense } from '../lib/database';

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: number) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = dateStr.split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateOnly === todayStr) return 'Oggi';
  if (dateOnly === yesterdayStr) return 'Ieri';

  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

function formatAmount(amount: number): string {
  return amount.toFixed(2).replace('.', ',');
}

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const category = getCategoryById(expense.category_id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={() => onDelete?.(expense.id)}
        activeOpacity={0.9}
      >
        {/* Icona categoria */}
        <View style={[styles.iconContainer, { backgroundColor: (category?.color ?? '#B0BEC5') + '20' }]}>
          <Text style={styles.icon}>{category?.icon ?? '❓'}</Text>
        </View>

        {/* Descrizione e categoria */}
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={styles.categoryName}>{category?.name ?? 'Altro'}</Text>
        </View>

        {/* Importo e data */}
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>-€{formatAmount(expense.amount)}</Text>
          <Text style={styles.date}>{formatDate(expense.date)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  categoryName: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.secondary,
  },
  date: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
});
