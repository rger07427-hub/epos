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
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProductStore } from '../../../store/useProductStore';
import { Category } from '../../../types';
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
}

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
  unit?: string;
  category_id?: string;
}

export default function AddProductScreen() {
  const { profile } = useAuthStore();
  const { fetchProducts } = useProductStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: '',
    price: '',
    stock: '',
    unit: 'pcs',
    category_id: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim())
      newErrors.name = 'Nama produk harus diisi';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = 'Harga harus diisi dan lebih dari 0';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      newErrors.stock = 'Stok harus diisi (minimal 0)';
    if (!form.unit.trim())
      newErrors.unit = 'Satuan harus diisi';
    if (!form.category_id)
      newErrors.category_id = 'Pilih kategori';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!profile?.branch_id) return;

    setLoading(true);
    try {
      // 1. Insert produk
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: form.name.trim(),
          price: Number(form.price),
          unit: form.unit.trim(),
          category_id: form.category_id,
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      // 2. Insert stok untuk cabang ini
      const { error: stockError } = await supabase
        .from('branch_stocks')
        .insert({
          branch_id: profile.branch_id,
          product_id: product.id,
          stock: Number(form.stock),
        });

      if (stockError) throw stockError;

      // 3. Refresh daftar produk
      await fetchProducts(profile.branch_id);

      Alert.alert('Berhasil', 'Produk berhasil ditambahkan', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const unitOptions = ['pcs', 'kg', 'gram', 'liter', 'ml', 'botol', 'bungkus', 'dus', 'lusin'];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Tambah Produk" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        <FormField
          label="Stok Awal"
          required
          placeholder="contoh: 50"
          value={form.stock}
          onChangeText={v => setForm(f => ({ ...f, stock: v }))}
          keyboardType="numeric"
          error={errors.stock}
        />

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
          {errors.unit && (
            <Text style={styles.errorText}>{errors.unit}</Text>
          )}
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
            <Text style={styles.submitText}>Simpan Produk</Text>
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

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
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
