/**
 * PaywallModal — Modal per l'upgrade alla versione Pro/Business.
 * Confronto feature tra piani con CTA accattivante.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius, FontSizes, Shadows } from '../constants/theme';
import { FEATURES_LIST, PRICING, setCurrentTier, SubscriptionTier } from '../lib/subscription';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribed?: () => void;
}

export default function PaywallModal({ visible, onClose, onSubscribed }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const pricing = PRICING[selectedPlan];
  const price = billingCycle === 'monthly' ? pricing.monthly : pricing.yearly;
  const monthlyEquiv = billingCycle === 'yearly' ? pricing.yearlyMonthly : pricing.monthly;
  const savings = billingCycle === 'yearly'
    ? Math.round((1 - pricing.yearly / (pricing.monthly * 12)) * 100)
    : 0;

  const handleSubscribe = () => {
    // In produzione: expo-in-app-purchases
    // Per ora: simuliamo l'acquisto
    setCurrentTier(selectedPlan as SubscriptionTier);
    Alert.alert(
      '🎉 Benvenuto in VoceSpesa ' + (selectedPlan === 'pro' ? 'Pro' : 'Business') + '!',
      'Il tuo abbonamento è stato attivato con successo.',
      [{ text: 'Inizia', onPress: () => { onSubscribed?.(); onClose(); } }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Sblocca tutto il potenziale 🚀</Text>
            <Text style={styles.subtitle}>
              Gestisci le tue spese senza limiti
            </Text>

            {/* Plan selector */}
            <View style={styles.planSelector}>
              <TouchableOpacity
                style={[styles.planTab, selectedPlan === 'pro' && styles.planTabActive]}
                onPress={() => setSelectedPlan('pro')}
              >
                <Text style={styles.planEmoji}>💎</Text>
                <Text style={[styles.planTabText, selectedPlan === 'pro' && styles.planTabTextActive]}>Pro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.planTab, selectedPlan === 'business' && styles.planTabActive]}
                onPress={() => setSelectedPlan('business')}
              >
                <Text style={styles.planEmoji}>🏢</Text>
                <Text style={[styles.planTabText, selectedPlan === 'business' && styles.planTabTextActive]}>Business</Text>
              </TouchableOpacity>
            </View>

            {/* Billing toggle */}
            <View style={styles.billingToggle}>
              <TouchableOpacity
                style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
                onPress={() => setBillingCycle('monthly')}
              >
                <Text style={[styles.billingText, billingCycle === 'monthly' && styles.billingTextActive]}>Mensile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
                onPress={() => setBillingCycle('yearly')}
              >
                <Text style={[styles.billingText, billingCycle === 'yearly' && styles.billingTextActive]}>Annuale</Text>
                {savings > 0 && <Text style={styles.savingsBadge}>-{savings}%</Text>}
              </TouchableOpacity>
            </View>

            {/* Price display */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>€{price.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.pricePeriod}>/{billingCycle === 'monthly' ? 'mese' : 'anno'}</Text>
              {billingCycle === 'yearly' && (
                <Text style={styles.monthlyEquiv}>
                  = €{monthlyEquiv.toFixed(2).replace('.', ',')}/mese
                </Text>
              )}
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>Cosa include:</Text>
              {FEATURES_LIST.map((feature, index) => {
                const value = selectedPlan === 'pro' ? feature.pro : feature.business;
                const freeValue = feature.free;
                if (value === freeValue) return null;
                const hasFeature = value === true || (typeof value === 'string' && value !== freeValue);
                if (!hasFeature) return null;
                return (
                  <View key={index} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    {typeof value === 'string' && (
                      <Text style={styles.featureValue}>{value}</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe}>
              <Text style={styles.ctaText}>
                Prova gratis per {pricing.trialDays} giorni
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Puoi annullare in qualsiasi momento. Nessun addebito durante il periodo di prova.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxHeight: '92%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 18, color: Colors.textSecondary },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xxxl,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  planSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xs,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  planTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  planTabActive: { backgroundColor: Colors.primary },
  planEmoji: { fontSize: 18 },
  planTabText: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  planTabTextActive: { color: Colors.text },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  billingOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  billingOptionActive: { backgroundColor: Colors.backgroundLight, borderWidth: 1, borderColor: Colors.primary },
  billingText: { fontFamily: Fonts.body, fontSize: FontSizes.md, color: Colors.textSecondary },
  billingTextActive: { fontFamily: Fonts.headingMedium, color: Colors.text },
  savingsBadge: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xs,
    color: Colors.success,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  priceContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  priceAmount: { fontFamily: Fonts.heading, fontSize: FontSizes.display, color: Colors.text },
  pricePeriod: { fontFamily: Fonts.body, fontSize: FontSizes.lg, color: Colors.textSecondary },
  monthlyEquiv: { fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.textTertiary, marginTop: Spacing.xs },
  featuresSection: { marginBottom: Spacing.lg },
  featuresTitle: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  featureCheck: { fontSize: 16, color: Colors.success },
  featureName: { fontFamily: Fonts.body, fontSize: FontSizes.md, color: Colors.text, flex: 1 },
  featureValue: { fontFamily: Fonts.headingMedium, fontSize: FontSizes.sm, color: Colors.primaryLight },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    ...Shadows.lg,
    marginBottom: Spacing.md,
  },
  ctaText: { fontFamily: Fonts.heading, fontSize: FontSizes.xl, color: Colors.text },
  disclaimer: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
