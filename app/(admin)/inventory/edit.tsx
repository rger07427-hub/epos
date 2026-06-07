import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProductStore } from '../../../store/useProductStore';
import { Category, Product } from '../../../types';
import { Colors } from '../../../constants/colors';
import FormField from '../../../components/shared/FormField';
import CategoryPicker from '../../../components/shared/CategoryPicker';
import AppHeader from '../../../components/shared/AppHeader';

interface FormData {
  name: string;
  price: string;
  stock: string;
  unit: string;
  category_id: string | null;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
  unit?: string;
  category_id?: string;
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const { fetchProducts } = useProductStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<FormData>({
    name: '',
    price: '',
    stock: '',
    unit: 'pcs',
    category_id: null,
    is_active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    if (!id || !profile?.branch_id) return;
    setFetching(true);

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        branch_stocks!inner(stock)
      `)
      .eq('id', id)
      .eq('branch_stocks.branch_id', profile.branch_id)
      .single();

    if (!error && data) {
      setForm({
        name: data.name,
        price: String(data.price),
        stock: String(data.branch_stocks?.[0]?.stock ?? 0),
        unit: data.unit,
        category_id: data.category_id,
        is_active: data.is_active,
      });
    }
    setFetching(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim())
      newErrors.name = 'Nama produk harus diisi';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = 'Harga harus diisi dan lebih dari 0';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      newErrors.stock = 'Stok tidak boleh kurang dari 0';
    if (!form.unit.trim())
      newErrors.unit = 'Satuan harus diisi';
    if (!form.category_id)
      newErrors.category_id = 'Pilih kategori';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!profile?.branch_id || !id) return;

    setLoading(true);
    try {
      // 1. Update produk
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: form.name.trim(),
          price: Number(form.price),
          unit: form.unit.trim(),
          category_id: form.category_id,
          is_active: form.is_active,
        })
        .eq('id', id);

      if (productError) throw productError;

      // 2. Update stok cabang
      const { error: stockError } = await supabase
        .from('branch_stocks')
        .update({ stock: Number(form.stock) })
        .eq('product_id', id)
        .eq('branch_id', profile.branch_id);

      if (stockError) throw stockError;

      // 3. Refresh daftar produk
      await fetchProducts(profile.branch_id);

      Alert.alert('Berhasil', 'Produk berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Produk',
      'Produk akan dinonaktifkan dan tidak muncul di POS. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Nonaktifkan',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from('products')
                .update({ is_active: false })
                .eq('id', id);

              if (error) throw error;

              if (profile?.branch_id) {
                await fetchProducts(profile.branch_id);
              }

              Alert.alert(
                'Berhasil',
                'Produk telah dinonaktifkan',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error: any) {
              Alert.alert('Gagal', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const unitOptions = [
    'pcs', 'kg', 'gram', 'liter', 'ml',
    'botol', 'bungkus', 'dus', 'lusin'
  ];

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data produk...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Edit Produk"
        showBack
        rightAction={{
          label: 'Nonaktifkan',
          onPress: handleDelete,
          color: '#fca5a5',
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Aktif */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Status Produk</Text>
            <Text style={styles.switchSubLabel}>
              {form.is_active ? 'Aktif — tampil di POS' : 'Nonaktif — tidak tampil di POS'}
            </Text>
          </View>
          <Switch
            value={form.is_active}
            onValueChange={v => setForm(f => ({ ...f, is_active: v }))}
            trackColor={{
              false: Colors.gray[300],
              true: Colors.primary,
            }}
            thumbColor={Colors.white}
          />
        </View>

        <FormField
          label="Nama Produk"
          required
          placeholder="contoh: Aqua 600ml"
          value={form.name}
          onChangeText={v => setForm(f => ({ ...f, name: v }))}
          error={errors.name}
        />

        <FormField
          label="Harga Jual"
          required
          placeholder="contoh: 3000"
          value={form.price}
          onChangeText={v => setForm(f => ({ ...f, price: v }))}
          keyboardType="numeric"
          error={errors.price}
        />

        {/* Stok dengan highlight */}
        <View style={styles.stockContainer}>
          <FormField
            label="Stok Saat Ini"
            required
            placeholder="contoh: 50"
            value={form.stock}
            onChangeText={v => setForm(f => ({ ...f, stock: v }))}
            keyboardType="numeric"
            error={errors.stock}
          />
          <View style={styles.stockNote}>
            <Text style={styles.stockNoteText}>
              ℹ️ Ubah angka ini untuk koreksi stok manual
            </Text>
          </View>
        </View>

        {/* Satuan */}
        <View style={styles.unitContainer}>
          <Text style={styles.unitLabel}>
            Satuan <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.unitList}
          >
            {unitOptions.map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitChip,
                  form.unit === unit && styles.unitChipActive,
                ]}
                onPress={() => setForm(f => ({ ...f, unit }))}
              >
                <Text style={[
                  styles.unitText,
                  form.unit === unit && styles.unitTextActive,
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <CategoryPicker
          categories={categories}
          selected={form.category_id}
          onSelect={id => setForm(f => ({ ...f, category_id: id }))}
          error={errors.category_id}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gray[500],
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  switchSubLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
  stockContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  stockNote: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 10,
    marginTop: -8,
  },
  stockNoteText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  unitContainer: {
    marginBottom: 16,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  required: {
    color: Colors.danger,
  },
  unitList: {
    gap: 8,
    paddingVertical: 4,
  },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  unitTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    backgroundColor: Colors.gray[400],
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
