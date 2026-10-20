import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors, Metrics } from './src/ui/theme';
import { formatCOP } from './src/core/financialEngine';
import { dbDriver } from './src/database/driver';
import { LoanRepository, LoanWithBorrower } from './src/database/repository';
import { CreateLoanModal } from './src/ui/components/CreateLoanModal';

export default function App() {
  const systemTheme = useColorScheme();
  const theme = systemTheme === 'dark' ? Colors.dark : Colors.light;

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loans, setLoans] = useState<LoanWithBorrower[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const repo = new LoanRepository(dbDriver);

  const loadData = useCallback(async () => {
    try {
      await dbDriver.init();
      const loadedLoans = await repo.getAllLoansWithBorrower();
      setLoans(loadedLoans);
    } catch (err: any) {
      console.error('Error loading loans from database:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateLoan = async (data: {
    fullName: string;
    phone: string;
    principalCOP: number;
    ratePercent: number;
    days: number;
  }) => {
    // 1. Create or link Contact
    const contactId = 'contact_' + Date.now();
    await repo.createContact({
      id: contactId,
      fullName: data.fullName,
      phone: data.phone,
    });

    // 2. Create Daily Loan with schedule
    const loanId = 'loan_' + Date.now();
    await repo.createDailyLoan({
      loanId,
      contactId,
      principalCOP: data.principalCOP,
      rateBasisPoints: Math.round(data.ratePercent * 100),
      days: data.days,
      startDate: new Date(),
    });

    Alert.alert('¡Éxito!', `Préstamo creado con cronograma de ${data.days} cuotas.`);
    await loadData();
  };

  const totalOutstanding = loans.reduce((acc, curr) => acc + curr.pendingAmountCOP, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={systemTheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>CuentasClaras iOS</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Cartera de Préstamos</Text>
        </View>

        {/* Metric Summary Card */}
        <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Saldo Total por Cobrar (COP)</Text>
          <Text style={[styles.metricValue, { color: theme.primary }]}>
            {formatCOP(totalOutstanding)}
          </Text>
          <View style={styles.metricRow}>
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
              {loans.length} préstamos registrados en SQLite
            </Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Préstamos Activos</Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando cartera local...</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && loans.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Sin préstamos activos</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Toca el botón inferior para desembolsar tu primer préstamo con cronograma automático.
            </Text>
          </View>
        )}

        {/* Loans List */}
        {!isLoading &&
          loans.map((item) => {
            const isOverdue = item.loan.status === 'IN_ARREARS';
            return (
              <TouchableOpacity
                key={item.loan.id}
                activeOpacity={0.7}
                style={[
                  styles.loanCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <View style={styles.loanCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.borrowerName, { color: theme.textPrimary }]}>
                      {item.borrowerName}
                    </Text>
                    <Text style={[styles.borrowerPhone, { color: theme.textSecondary }]}>
                      {item.borrowerPhone}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isOverdue ? theme.danger + '20' : theme.primary + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: isOverdue ? theme.danger : theme.primary }]}>
                      {isOverdue ? 'En Mora' : 'Al Día'}
                    </Text>
                  </View>
                </View>

                <View style={styles.loanCardBody}>
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Saldo pendiente</Text>
                    <Text style={[styles.fieldAmount, { color: theme.textPrimary }]}>
                      {formatCOP(item.pendingAmountCOP)}
                    </Text>
                  </View>
                  <View style={styles.alignRight}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Vence</Text>
                    <Text style={[styles.fieldDate, { color: isOverdue ? theme.danger : theme.textSecondary }]}>
                      {item.loan.dueDate}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

        {/* New Loan Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsModalOpen(true)}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.primaryText }]}>
            + Nuevo Préstamo
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Creation Modal */}
      <CreateLoanModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLoan}
        theme={theme}
      />
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
  centerContainer: {
    paddingVertical: Metrics.spacingXl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Metrics.spacingSm,
    fontSize: 14,
  },
  emptyCard: {
    padding: Metrics.spacingLg,
    borderRadius: Metrics.radiusMedium,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Metrics.spacingMd,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Metrics.spacingXs,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
    alignItems: 'flex-start',
    marginBottom: Metrics.spacingSm,
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  borrowerPhone: {
    fontSize: 13,
    marginTop: 2,
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
