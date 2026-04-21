/**
 * VoiceInput — Componente principale per l'input vocale delle spese.
 * Pulsante grande con animazione pulse durante l'ascolto.
 * Gestisce speech-to-text, parsing e suggerimento categorie.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, Radius, FontSizes, Shadows } from '../constants/theme';
import { parseVoiceInput, CategorySuggestion } from '../lib/classifier';
import { useExpenses } from '../contexts/ExpenseContext';
import { canAddExpense } from '../lib/subscription';
import CategoryPicker from './CategoryPicker';

interface VoiceInputProps {
  onPaywallNeeded?: () => void;
}

export default function VoiceInput({ onPaywallNeeded }: VoiceInputProps) {
  const { addNewExpense } = useExpenses();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Animazioni
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animazione pulse durante l'ascolto
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          ]),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isListening]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const startListening = async () => {
    // Controlla limiti freemium
    const check = await canAddExpense();
    if (!check.allowed) {
      onPaywallNeeded?.();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Su web/Expo Go simuliamo con input manuale
    if (Platform.OS === 'web') {
      // Simula input vocale con prompt
      setShowConfirm(true);
      setTranscript('');
      setAmount('');
      setDescription('');
      setSuggestions([]);
      setSelectedCategoryId(null);
      return;
    }

    try {
      setIsListening(true);
      // Prova ad usare expo-speech-recognition se disponibile
      let SpeechModule: any = null;
      try {
        SpeechModule = require('expo-speech-recognition');
      } catch {
        // Modulo non disponibile, usa fallback
      }

      if (SpeechModule && SpeechModule.ExpoSpeechRecognitionModule) {
        const { granted } = await SpeechModule.ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!granted) {
          Alert.alert('Permesso negato', 'VoceSpesa ha bisogno del microfono per il riconoscimento vocale.');
          setIsListening(false);
          return;
        }

        SpeechModule.ExpoSpeechRecognitionModule.start({ lang: 'it-IT', interimResults: true });

        SpeechModule.addSpeechRecognitionListener('result', (event: any) => {
          if (event.results && event.results[0]) {
            const text = event.results[0].transcript;
            setTranscript(text);
            if (event.isFinal) {
              processTranscript(text);
              SpeechModule.ExpoSpeechRecognitionModule.stop();
              setIsListening(false);
            }
          }
        });

        SpeechModule.addSpeechRecognitionListener('error', () => {
          setIsListening(false);
          // Fallback a input manuale
          setShowConfirm(true);
        });
      } else {
        // Fallback: input manuale
        setIsListening(false);
        setShowConfirm(true);
        setTranscript('');
        setAmount('');
        setDescription('');
        setSuggestions([]);
        setSelectedCategoryId(null);
      }
    } catch {
      setIsListening(false);
      setShowConfirm(true);
    }
  };

  const processTranscript = (text: string) => {
    const result = parseVoiceInput(text);
    setAmount(result.parsed.amount?.toString() ?? '');
    setDescription(result.parsed.description);
    setSuggestions(result.suggestions);
    setSelectedCategoryId(result.suggestions[0]?.category.id ?? null);
    setShowConfirm(true);
  };

  const handleManualProcess = () => {
    if (transcript.trim()) {
      processTranscript(transcript);
    }
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Importo non valido', 'Inserisci un importo maggiore di zero.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Seleziona categoria', 'Scegli una categoria per la spesa.');
      return;
    }

    await addNewExpense(numAmount, description || 'Spesa', selectedCategoryId, transcript);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setShowConfirm(false);
    setTranscript('');
    setAmount('');
    setDescription('');
    setSuggestions([]);
    setSelectedCategoryId(null);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Pulsante vocale principale */}
      <View style={styles.buttonWrapper}>
        {/* Glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        {/* Pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              opacity: glowOpacity,
              transform: [{ scale: Animated.multiply(pulseAnim, 1.3) }],
            },
          ]}
        />

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={startListening}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
          >
            <Text style={styles.micIcon}>{isListening ? '🔴' : '🎙️'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.hint}>
        {isListening ? 'Sto ascoltando...' : 'Tocca per parlare'}
      </Text>
      {isListening && transcript ? (
        <Text style={styles.liveTranscript}>"{transcript}"</Text>
      ) : null}

      {/* Modal di conferma spesa */}
      <Modal visible={showConfirm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nuova Spesa</Text>

            {/* Input testo vocale (se fallback) */}
            {!transcript && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descrivi la spesa a parole</Text>
                <View style={styles.transcriptInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="es. Ho speso 35 euro dal meccanico"
                    placeholderTextColor={Colors.textTertiary}
                    value={transcript}
                    onChangeText={setTranscript}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.processButton} onPress={handleManualProcess}>
                    <Text style={styles.processButtonText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {transcript ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>Hai detto:</Text>
                <Text style={styles.transcriptText}>"{transcript}"</Text>
              </View>
            ) : null}

            {/* Importo */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Importo (€)</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Descrizione */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrizione</Text>
              <TextInput
                style={styles.input}
                placeholder="Descrizione spesa"
                placeholderTextColor={Colors.textTertiary}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Categorie suggerite */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <CategoryPicker
                suggestions={suggestions}
                selectedId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            </View>

            {/* Azioni */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salva ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  buttonWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
  },
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  voiceButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    ...Shadows.lg,
  },
  voiceButtonActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.secondary,
  },
  micIcon: {
    fontSize: 40,
  },
  hint: {
    marginTop: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  liveTranscript: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.primaryLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textTertiary,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xxl,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  transcriptBox: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  transcriptLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  transcriptText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.lg,
    color: Colors.primaryLight,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: FontSizes.lg,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInput: {
    fontSize: FontSizes.xxxl,
    fontFamily: Fonts.heading,
    textAlign: 'center',
  },
  transcriptInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  processButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processButtonText: {
    fontSize: 24,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontFamily: Fonts.headingMedium,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    ...Shadows.md,
  },
  saveButtonText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.text,
  },
});
