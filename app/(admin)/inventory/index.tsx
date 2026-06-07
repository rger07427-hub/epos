import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProductStore } from '../../../store/useProductStore';
import { Product } from '../../../types';
import { Colors } from '../../../constants/colors';
import ProductCard from '../../../components/inventory/ProductCard';
import EmptyState from '../../../components/shared/EmptyState';
import AppHeader from '../../../components/shared/AppHeader';

export default function InventoryScreen() {
  const { profile } = useAuthStore();
  const { products, loading, fetchProducts } = useProductStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.branch_id) {
      fetchProducts(profile.branch_id);
    }
  }, [profile]);

  const categories = ['Semua', ...new Set(
    products
      .map(p => p.category?.name)
      .filter(Boolean) as string[]
  )];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory = !selectedCategory
      || selectedCategory === 'Semua'
      || p.category?.name === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Manajemen Stok"
        rightAction={{
          label: '+ Tambah',
          onPress: () => router.push('/(admin)/inventory/add'),
        }}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cari produk..."
          placeholderTextColor={Colors.gray[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Kategori */}
      <View style={styles.categoryContainer}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              (selectedCategory === cat ||
                (!selectedCategory && cat === 'Semua')) &&
              styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(
              cat === 'Semua' ? null : cat
            )}
          >
            <Text style={[
              styles.categoryText,
              (selectedCategory === cat ||
                (!selectedCategory && cat === 'Semua')) &&
              styles.categoryTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List Produk */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onEdit={(p) => router.push({
                pathname: '/(admin)/inventory/edit',
                params: { id: p.id },
              })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📦"
              title="Belum ada produk"
              subtitle="Tap tombol Tambah untuk menambahkan produk baru"
            />
          }
          contentContainerStyle={
            filtered.length === 0 && styles.emptyContainer
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  searchInput: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.gray[800],
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  loader: {
    marginTop: 48,
  },
  emptyContainer: {
    flex: 1,
  },
});
