/**
 * Home Screen — Input vocale + lista spese recenti.
 * Schermata principale con pulsante microfono e preview ultime spese.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Fonts, Spacing, Radius, FontSizes, Shadows } from '../../constants/theme';
import { useExpenses } from '../../contexts/ExpenseContext';
import VoiceInput from '../../components/VoiceInput';
import ExpenseCard from '../../components/ExpenseCard';
import PaywallModal from '../../components/PaywallModal';

export default function HomeScreen() {
  const { state, removeExpense, refreshData } = useExpenses();
  const [showPaywall, setShowPaywall] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Elimina spesa',
      'Sei sicuro di voler eliminare questa spesa?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => removeExpense(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ciao! 👋</Text>
            <Text style={styles.title}>VoceSpesa</Text>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalLabel}>Questo mese</Text>
            <Text style={styles.totalAmount}>
              €{state.totalAmount.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Voice Input */}
        <View style={styles.voiceSection}>
          <VoiceInput onPaywallNeeded={() => setShowPaywall(true)} />
          <Text style={styles.voiceHint}>
            Dì qualcosa come "Ho speso 25 euro per la pizza"
          </Text>
        </View>

        {/* Recent Expenses */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ultime Spese</Text>
            <Text style={styles.sectionCount}>
              {state.recentExpenses.length}
            </Text>
          </View>

          {state.recentExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyText}>
                Nessuna spesa ancora
              </Text>
              <Text style={styles.emptySubtext}>
                Tocca il microfono per registrare la prima spesa
              </Text>
            </View>
          ) : (
            state.recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={handleDelete}
              />
            ))
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.hero,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  totalBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-end',
    ...Shadows.sm,
  },
  totalLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalAmount: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xxl,
    color: Colors.primary,
    marginTop: 2,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  voiceHint: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  recentSection: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xl,
    color: Colors.text,
  },
  sectionCount: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
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
