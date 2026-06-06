import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction } from '../../types';
import { Colors } from '../../constants/colors';
import Badge from '../shared/Badge';

interface Props {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

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

export default function TransactionCard({ transaction, onPress }: Props) {
  const date = new Date(transaction.created_at);
  const timeStr = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.trxId}>
          #{transaction.id.slice(-8).toUpperCase()}
        </Text>
        <Text style={styles.date}>{dateStr} · {timeStr}</Text>
        <Text style={styles.cashier}>
          Kasir: {transaction.cashier?.full_name ?? '-'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.total}>
          Rp {transaction.total.toLocaleString('id-ID')}
        </Text>
        <Badge
          label={methodLabel[transaction.payment_method] ?? '-'}
          type={methodBadge[transaction.payment_method] ?? 'default'}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  trxId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  cashier: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  total: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
