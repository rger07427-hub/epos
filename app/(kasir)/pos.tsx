import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { Colors } from '../../constants/colors';
import AppHeader from '../../components/shared/AppHeader';
import ProductGrid from '../../components/pos/ProductGrid';
import CartPanel from '../../components/pos/CartPanel';
import PaymentModal from '../../components/pos/PaymentModal';

export default function AdminPOS() {
  const { profile } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { items, addItem, clearCart, getTotal } = useCartStore();
  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');

  useEffect(() => {
    if (profile?.branch_id) fetchProducts(profile.branch_id);
  }, [profile]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = async (
    method: 'cash' | 'qris' | 'transfer',
    paid: number
  ) => {
    if (!profile?.branch_id) return;
    const total = getTotal();

    try {
      // 1. Simpan transaksi
      const { data: trx, error: trxError } = await supabase
        .from('transactions')
        .insert({
          cashier_id: profile.id,
          branch_id: profile.branch_id,
          total,
          paid_amount: paid,
          change_amount: method === 'cash' ? paid - total : 0,
          payment_method: method,
          status: 'completed',
        })
        .select()
        .single();

      if (trxError) throw trxError;

      // 2. Simpan item transaksi
      const trxItems = items.map(i => ({
        transaction_id: trx.id,
        product_id: i.product.id,
        product_name: i.product.name,
        price_at_sale: i.product.price,
        quantity: i.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(trxItems);

      if (itemsError) throw itemsError;

      // 3. Kurangi stok per item
      for (const item of items) {
        const { data: stockData } = await supabase
          .from('branch_stocks')
          .select('stock')
          .eq('product_id', item.product.id)
          .eq('branch_id', profile.branch_id)
          .single();

        if (stockData) {
          await supabase
            .from('branch_stocks')
            .update({ stock: stockData.stock - item.quantity })
            .eq('product_id', item.product.id)
            .eq('branch_id', profile.branch_id);
        }
      }

      // 4. Refresh produk & kosongkan keranjang
      await fetchProducts(profile.branch_id);
      clearCart();
      setShowPayment(false);
      setActiveTab('products');

      Alert.alert(
        '✅ Transaksi Berhasil',
        method === 'cash'
          ? `Kembalian: Rp ${(paid - total).toLocaleString('id-ID')}`
          : 'Pembayaran dikonfirmasi'
      );
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan');
    }
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="POS"
        subtitle={`${profile?.full_name} · ${profile?.branch?.name}`}
      />

      {/* Tab Switcher (untuk HP) */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'products' && styles.tabTextActive,
          ]}>
            Produk
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cart' && styles.tabActive]}
          onPress={() => setActiveTab('cart')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'cart' && styles.tabTextActive,
          ]}>
            Keranjang {totalItems > 0 && `(${totalItems})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Konten */}
      {activeTab === 'products' ? (
        <View style={styles.productsPanel}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Cari produk..."
            placeholderTextColor={Colors.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
          <ProductGrid
            products={filtered}
            onAdd={(product) => {
              addItem(product);
              setActiveTab('cart');
            }}
          />
        </View>
      ) : (
        <CartPanel onCheckout={() => setShowPayment(true)} />
      )}

      {/* Payment Modal */}
      <PaymentModal
        visible={showPayment}
        total={getTotal()}
        onClose={() => setShowPayment(false)}
        onConfirm={handleCheckout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[500],
  },
  tabTextActive: {
    color: Colors.primary,
  },
  productsPanel: {
    flex: 1,
  },
  searchInput: {
    margin: 10,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.gray[800],
  },
});
