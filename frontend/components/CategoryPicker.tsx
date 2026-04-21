/**
 * CategoryPicker — Selettore categorie con suggerimenti evidenziati.
 * Mostra le categorie suggerite dal classifier in ordine di confidence.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts, Spacing, Radius, FontSizes } from '../constants/theme';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { CategorySuggestion } from '../lib/classifier';
import { isCategoryAvailable } from '../lib/subscription';

interface CategoryPickerProps {
  suggestions: CategorySuggestion[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function CategoryPicker({ suggestions, selectedId, onSelect }: CategoryPickerProps) {
  // Mostra suggerimenti in alto, poi tutte le altre categorie
  const suggestedIds = new Set(suggestions.map((s) => s.category.id));
  const otherCategories = DEFAULT_CATEGORIES.filter((c) => !suggestedIds.has(c.id));

  return (
    <View style={styles.container}>
      {/* Suggerimenti */}
      {suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Suggerite</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {suggestions.map((suggestion) => {
              const isSelected = selectedId === suggestion.category.id;
              const confidence = Math.round(suggestion.confidence * 100);
              return (
                <TouchableOpacity
                  key={suggestion.category.id}
                  style={[
                    styles.chip,
                    styles.suggestedChip,
                    { borderColor: suggestion.category.color },
                    isSelected && { backgroundColor: suggestion.category.color + '30' },
                  ]}
                  onPress={() => onSelect(suggestion.category.id)}
                >
                  <Text style={styles.chipIcon}>{suggestion.category.icon}</Text>
                  <View>
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {suggestion.category.name}
                    </Text>
                    <Text style={[styles.confidenceText, { color: suggestion.category.color }]}>
                      {confidence}% match
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Tutte le altre categorie */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tutte le categorie</Text>
        <View style={styles.grid}>
          {otherCategories.map((category) => {
            const isSelected = selectedId === category.id;
            const available = isCategoryAvailable(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.gridChip,
                  { borderColor: available ? category.color + '40' : Colors.textTertiary },
                  isSelected && { backgroundColor: category.color + '20', borderColor: category.color },
                  !available && styles.lockedChip,
                ]}
                onPress={() => available && onSelect(category.id)}
                disabled={!available}
              >
                <Text style={styles.gridIcon}>
                  {available ? category.icon : '🔒'}
                </Text>
                <Text
                  style={[
                    styles.gridText,
                    isSelected && styles.chipTextSelected,
                    !available && styles.lockedText,
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scrollRow: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.backgroundLight,
    marginRight: Spacing.sm,
    gap: Spacing.sm,
  },
  suggestedChip: {
    minWidth: 140,
  },
  chipIcon: {
    fontSize: 24,
  },
  chipText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  chipTextSelected: {
    fontFamily: Fonts.headingMedium,
    color: Colors.text,
  },
  confidenceText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: 'bold',
    marginLeft: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: Colors.backgroundLight,
    gap: Spacing.xs,
    minWidth: '30%',
  },
  gridIcon: {
    fontSize: 18,
  },
  gridText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  lockedChip: {
    opacity: 0.4,
  },
  lockedText: {
    color: Colors.textTertiary,
  },
});
