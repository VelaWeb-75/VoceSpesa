/**
 * FilterBar — Barra filtri temporali per la dashboard.
 * Switch tra Settimana / Mese / Anno con animazione.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius, FontSizes } from '../constants/theme';
import { isFilterAvailable } from '../lib/subscription';

interface FilterBarProps {
  currentFilter: 'week' | 'month' | 'year';
  onFilterChange: (filter: 'week' | 'month' | 'year') => void;
  onPaywallNeeded?: () => void;
}

const FILTERS: { key: 'week' | 'month' | 'year'; label: string }[] = [
  { key: 'week', label: 'Settimana' },
  { key: 'month', label: 'Mese' },
  { key: 'year', label: 'Anno' },
];

export default function FilterBar({ currentFilter, onFilterChange, onPaywallNeeded }: FilterBarProps) {
  const handlePress = (filter: 'week' | 'month' | 'year') => {
    if (!isFilterAvailable(filter)) {
      onPaywallNeeded?.();
      return;
    }
    onFilterChange(filter);
  };

  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isActive = currentFilter === filter.key;
        const available = isFilterAvailable(filter.key);
        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              isActive && styles.filterButtonActive,
              !available && styles.filterButtonLocked,
            ]}
            onPress={() => handlePress(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                isActive && styles.filterTextActive,
                !available && styles.filterTextLocked,
              ]}
            >
              {filter.label}
            </Text>
            {!available && <Text style={styles.lockIcon}>🔒</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: Radius.lg,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonLocked: {
    opacity: 0.5,
  },
  filterText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    fontFamily: Fonts.headingMedium,
    color: Colors.text,
  },
  filterTextLocked: {
    color: Colors.textTertiary,
  },
  lockIcon: {
    fontSize: 10,
  },
});
