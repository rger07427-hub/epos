import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Category } from '../../../types';
import { Colors } from '../../../constants/colors';
import EmptyState from '../../../components/shared/EmptyState';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      Alert.alert('Gagal Memuat Kategori', error.message);
    } else if (data) {
      setCategories(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setEditName(cat.name);
  };

  const handleSaveEdit = async () => {
    if (!editing || !editName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: editName.trim() })
        .eq('id', editing.id);
      if (error) throw error;
      await fetchCategories();
      setEditing(null);
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Hapus Kategori',
      `Hapus kategori "${cat.name}"? Produk yang memakai kategori ini akan menjadi "Tanpa Kategori", tidak ikut terhapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('categories')
              .delete()
              .eq('id', cat.id);
            if (error) {
              Alert.alert('Gagal', error.message);
            } else {
              await fetchCategories();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Kategori</Text>
        <View style={{ width: 80 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowName}>{item.name}</Text>
              <View style={styles.rowActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="🏷️"
              title="Belum ada kategori"
              subtitle="Tambahkan lewat form Tambah Produk, nanti muncul di sini"
            />
          }
        />
      )}

      <Modal visible={!!editing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ubah Nama Kategori</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditing(null)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backText: { fontSize: 14, color: Colors.primary, fontWeight: '600', width: 80 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.gray[800] },
  list: { padding: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06,
    shadowRadius: 4, elevation: 2,
  },
  rowName: { fontSize: 15, fontWeight: '600', color: Colors.gray[800] },
  rowActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 4 },
  actionText: { fontSize: 18 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  modalBox: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, width: '85%' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.gray[800], marginBottom: 12 },
  modalInput: {
    borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.gray[800],
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5,
    borderColor: Colors.gray[300], alignItems: 'center',
  },
  modalCancelText: { color: Colors.gray[600], fontWeight: '600' },
  modalSaveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSaveText: { color: Colors.white, fontWeight: '600' },
});
