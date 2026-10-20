import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Metrics } from '../ui/theme';
import { formatCOP, calculateDailyFixedLoan } from '../core/financialEngine';

interface CreateLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fullName: string;
    phone: string;
    principalCOP: number;
    ratePercent: number;
    days: number;
  }) => Promise<void>;
  theme: typeof Colors.light;
}

export function CreateLoanModal({ visible, onClose, onSubmit, theme }: CreateLoanModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [principalText, setPrincipalText] = useState('1000000');
  const [rateText, setRateText] = useState('20');
  const [daysText, setDaysText] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time amortization simulation
  const principal = parseInt(principalText.replace(/\D/g, ''), 10) || 0;
  const ratePercent = parseFloat(rateText) || 0;
  const days = parseInt(daysText, 10) || 0;

  let simulation = null;
  if (principal > 0 && days > 0) {
    try {
      simulation = calculateDailyFixedLoan({
        principalCOP: principal,
        rateBasisPoints: Math.round(ratePercent * 100),
        days,
        startDate: new Date(),
      });
    } catch {
      simulation = null;
    }
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Faltan datos', 'Ingresa el nombre del cliente/deudor.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Faltan datos', 'Ingresa el número de contacto.');
      return;
    }
    if (principal <= 0 || days <= 0) {
      Alert.alert('Valores inválidos', 'El monto y los días deben ser mayores a cero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        fullName: fullName.trim(),
        phone: phone.trim(),
        principalCOP: principal,
        ratePercent,
        days,
      });
      // Reset form
      setFullName('');
      setPhone('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo crear el préstamo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: theme.danger }]}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Nuevo Préstamo</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSubmitting} style={styles.headerButton}>
            <Text style={[styles.doneText, { color: theme.primary }]}>
              {isSubmitting ? '...' : 'Crear'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Borrower Information */}
          <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>DATOS DEL CLIENTE</Text>
          <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Nombre completo o negocio"
              placeholderTextColor={theme.textSecondary}
              value={fullName}
              onChangeText={setFullName}
            />
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Teléfono móvil (WhatsApp)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Loan Conditions */}
          <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>CONDICIONES (COP)</Text>
          <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.rowInput}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Monto Desembolso</Text>
              <TextInput
                style={[styles.inlineInput, { color: theme.primary }]}
                keyboardType="numeric"
                value={principalText}
                onChangeText={setPrincipalText}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.rowInput}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Interés (%)</Text>
              <TextInput
                style={[styles.inlineInput, { color: theme.textPrimary }]}
                keyboardType="numeric"
                value={rateText}
                onChangeText={setRateText}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.rowInput}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Días (Cuotas diarias)</Text>
              <TextInput
                style={[styles.inlineInput, { color: theme.textPrimary }]}
                keyboardType="numeric"
                value={daysText}
                onChangeText={setDaysText}
              />
            </View>
          </View>

          {/* Simulation Preview */}
          {simulation && (
            <View style={[styles.previewCard, { backgroundColor: theme.surfaceSubtle }]}>
              <Text style={[styles.previewTitle, { color: theme.textSecondary }]}>RESUMEN DEL PLAN</Text>
              <View style={styles.previewRow}>
                <Text style={{ color: theme.textSecondary }}>Total a recaudar:</Text>
                <Text style={[styles.previewValue, { color: theme.textPrimary }]}>
                  {formatCOP(simulation.totalDueCOP)}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={{ color: theme.textSecondary }}>Ganancia por interés:</Text>
                <Text style={[styles.previewValue, { color: theme.primary }]}>
                  {formatCOP(simulation.totalInterestCOP)}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={{ color: theme.textSecondary }}>Valor cuota diaria:</Text>
                <Text style={[styles.previewValue, { color: theme.primary }]}>
                  {formatCOP(simulation.installmentAmountCOP)} / día
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.spacingMd,
    borderBottomWidth: 1,
    borderBottomColor: '#33415520',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerButton: {
    minHeight: Metrics.touchTargetMin,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: Metrics.spacingMd,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Metrics.spacingMd,
    marginBottom: Metrics.spacingXs,
    marginLeft: 4,
  },
  inputGroup: {
    borderRadius: Metrics.radiusMedium,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    height: Metrics.touchTargetMin,
    paddingHorizontal: Metrics.spacingMd,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: Metrics.spacingMd,
  },
  rowInput: {
    height: Metrics.touchTargetMin,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Metrics.spacingMd,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  inlineInput: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    minWidth: 100,
    fontVariant: ['tabular-nums'],
  },
  previewCard: {
    marginTop: Metrics.spacingLg,
    padding: Metrics.spacingMd,
    borderRadius: Metrics.radiusMedium,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Metrics.spacingSm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  previewValue: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
