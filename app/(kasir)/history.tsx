import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Transaction } from '../../types';
import { Colors } from '../../constants/colors';
import TransactionCard from '../../components/history/TransactionCard';
import EmptyState from '../../components/shared/EmptyState';
import Badge from '../../components/shared/Badge';
import AppHeader from '../../components/shared/AppHeader';

const methodLabel: Record<string, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
};

const methodBadge: Record<string, 'success' | 'info' | 'warning'> = {
  cash: 'success',
  qris: 'info',
  transfer: 'warning',
};

export default function HistoryScreen() {
  const { profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!profile?.branch_id) return;

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        cashier:profiles(full_name),
        items:transaction_items(*)
      `)
      .eq('branch_id', profile.branch_id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) setTransactions(data);
    setLoading(false);
    setRefreshing(false);
  }, [profile]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const todayTotal = transactions
    .filter(t => {
      const today = new Date().toDateString();
      return new Date(t.created_at).toDateString() === today;
    })
    .reduce((sum, t) => sum + t.total, 0);

  const todayCount = transactions.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.created_at).toDateString() === today;
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Riwayat Saya" subtitle={profile?.branch?.name} />

      {/* Ringkasan Hari Ini */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{todayCount}</Text>
          <Text style={styles.summaryLabel}>Transaksi Hari Ini</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardRight]}>
          <Text style={styles.summaryValue}>
            Rp {todayTotal.toLocaleString('id-ID')}
          </Text>
          <Text style={styles.summaryLabel}>Omzet Hari Ini</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onPress={setSelected}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title="Belum ada transaksi"
              subtitle="Transaksi akan muncul di sini setelah ada penjualan"
            />
          }
          contentContainerStyle={
            transactions.length === 0 && styles.emptyContainer
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Transaksi</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info Transaksi */}
                <View style={styles.infoSection}>
                  <Row
                    label="ID Transaksi"
                    value={`#${selected.id.slice(-8).toUpperCase()}`}
                  />
                  <Row
                    label="Waktu"
                    value={new Date(selected.created_at)
                      .toLocaleString('id-ID')}
                  />
                  <Row
                    label="Kasir"
                    value={selected.cashier?.full_name ?? '-'}
                  />
                  <View style={styles.rowItem}>
                    <Text style={styles.rowLabel}>Metode</Text>
                    <Badge
                      label={methodLabel[selected.payment_method] ?? '-'}
                      type={methodBadge[selected.payment_method] ?? 'default'}
                    />
                  </View>
                </View>

                {/* Item Transaksi */}
                <Text style={styles.itemsTitle}>Item Dibeli</Text>
                {selected.items?.map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.productNameText} numberOfLines={1}>
                      {item.product_name}
                    </Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <Text style={styles.itemTotal}>
                      Rp {(item.price_at_sale * item.quantity)
                        .toLocaleString('id-ID')}
                    </Text>
                  </View>
                ))}

                {/* Ringkasan Bayar */}
                <View style={styles.paymentSummary}>
                  <Row
                    label="Total"
                    value={`Rp ${selected.total.toLocaleString('id-ID')}`}
                    bold
                  />
                  {selected.payment_method === 'cash' && (
                    <>
                      <Row
                        label="Dibayar"
                        value={`Rp ${selected.paid_amount?.toLocaleString('id-ID') ?? '-'}`}
                      />
                      <Row
                        label="Kembalian"
                        value={`Rp ${selected.change_amount?.toLocaleString('id-ID') ?? '-'}`}
                        highlight
                      />
                    </>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[
        styles.rowValue,
        bold && styles.rowValueBold,
        highlight && styles.rowValueHighlight,
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },

  summaryRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardRight: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  loader: {
    marginTop: 48,
  },
  emptyContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  closeText: {
    fontSize: 18,
    color: Colors.gray[500],
    padding: 4,
  },
  infoSection: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    gap: 8,
  },
  productNameText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray[800],
  },
  itemQty: {
    fontSize: 13,
    color: Colors.gray[500],
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 90,
    textAlign: 'right',
  },
  paymentSummary: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  rowValue: {
    fontSize: 14,
    color: Colors.gray[800],
  },
  rowValueBold: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.gray[900],
  },
  rowValueHighlight: {
    fontWeight: 'bold',
    color: Colors.success,
  },
});
