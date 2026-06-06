import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useCartStore } from '../../store/useCartStore';
import { Colors } from '../../constants/colors';
import CartItemRow from './CartItem';

interface Props {
  onCheckout: () => void;
}

export default function CartPanel({ onCheckout }: Props) {
  const { items, addItem, removeItem, updateQty, clearCart, getTotal } =
    useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Keranjang kosong</Text>
        <Text style={styles.emptySubtext}>
          Tap produk untuk menambahkan
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Keranjang ({items.length} item)
        </Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Kosongkan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
        {items.map(item => (
          <CartItemRow
            key={item.product.id}
            item={item}
            onIncrease={() => addItem(item.product)}
            onDecrease={() => updateQty(item.product.id, item.quantity - 1)}
            onRemove={() => removeItem(item.product.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            Rp {total.toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={onCheckout}
        >
          <Text style={styles.checkoutText}>Bayar Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.gray[400],
    marginTop: 4,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  clearText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },
  itemList: {
    flex: 1,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
