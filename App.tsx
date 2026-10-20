import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { Colors, Metrics } from './src/ui/theme';
import { formatCOP } from './src/core/financialEngine';

interface LoanCardItem {
  id: string;
  borrowerName: string;
  principalCOP: number;
  balanceCOP: number;
  nextPaymentDate: string;
  status: 'AL_DIA' | 'EN_MORA' | 'PAGADO';
}

export default function App() {
  const systemTheme = useColorScheme();
  const theme = systemTheme === 'dark' ? Colors.dark : Colors.light;

  const [loans] = useState<LoanCardItem[]>([
    {
      id: '1',
      borrowerName: 'Carlos Mendoza (Panadería)',
      principalCOP: 1200000,
      balanceCOP: 680000,
      nextPaymentDate: 'Hoy, 5:00 PM',
      status: 'AL_DIA',
    },
    {
      id: '2',
      borrowerName: 'Marta Lucía Gómez',
      principalCOP: 500000,
      balanceCOP: 320000,
      nextPaymentDate: 'Ayer (Atrasado)',
      status: 'EN_MORA',
    },
    {
      id: '3',
      borrowerName: 'Andrés Felipe Restrepo',
      principalCOP: 2000000,
      balanceCOP: 1850000,
      nextPaymentDate: '24 Oct 2026',
      status: 'AL_DIA',
    },
  ]);

  const totalOutstanding = loans.reduce((acc, curr) => acc + curr.balanceCOP, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={systemTheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>CuentasClaras iOS</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Cartera de Préstamos</Text>
        </View>

        {/* Metric Summary Card */}
        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Saldo Total en Calle (COP)</Text>
          <Text style={[styles.metricValue, { color: theme.primary }]}>
            {formatCOP(totalOutstanding)}
          </Text>
          <View style={styles.metricRow}>
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
              {loans.length} préstamos activos
            </Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Préstamos Activos</Text>
        </View>

        {/* Loans List */}
        {loans.map((loan) => (
          <TouchableOpacity
            key={loan.id}
            activeOpacity={0.7}
            style={[
              styles.loanCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View style={styles.loanCardHeader}>
              <Text style={[styles.borrowerName, { color: theme.textPrimary }]}>
                {loan.borrowerName}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      loan.status === 'EN_MORA'
                        ? theme.danger + '20'
                        : theme.primary + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: loan.status === 'EN_MORA' ? theme.danger : theme.primary,
                    },
                  ]}
                >
                  {loan.status === 'EN_MORA' ? 'En Mora' : 'Al Día'}
                </Text>
              </View>
            </View>

            <View style={styles.loanCardBody}>
              <View>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Saldo pendiente</Text>
                <Text style={[styles.fieldAmount, { color: theme.textPrimary }]}>
                  {formatCOP(loan.balanceCOP)}
                </Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Próximo Cobro</Text>
                <Text
                  style={[
                    styles.fieldDate,
                    {
                      color: loan.status === 'EN_MORA' ? theme.danger : theme.textSecondary,
                    },
                  ]}
                >
                  {loan.nextPaymentDate}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* New Loan Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.primaryText }]}>
            + Nuevo Préstamo
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: Metrics.spacingMd,
    paddingBottom: Metrics.spacingXl,
  },
  header: {
    marginTop: Metrics.spacingSm,
    marginBottom: Metrics.spacingMd,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  metricCard: {
    borderRadius: Metrics.radiusMedium,
    padding: Metrics.spacingMd,
    borderWidth: 1,
    marginBottom: Metrics.spacingLg,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: Metrics.spacingXs,
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: Metrics.spacingXs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: Metrics.spacingSm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loanCard: {
    borderRadius: Metrics.radiusMedium,
    padding: Metrics.spacingMd,
    borderWidth: 1,
    marginBottom: Metrics.spacingSm,
    minHeight: Metrics.touchTargetMin * 1.5,
  },
  loanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.spacingSm,
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Metrics.radiusSmall,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loanCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  fieldAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  fieldDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    height: Metrics.touchTargetMin + 6,
    borderRadius: Metrics.radiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Metrics.spacingMd,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
