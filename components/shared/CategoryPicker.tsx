import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { Colors } from '../../constants/colors';

interface Props {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onCategoryCreated: (category: Category) => void;
  error?: string;
}

export default function CategoryPicker({
  categories,
  selected,
  onSelect,
  onCategoryCreated,
  error,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCategory = categories.find(c => c.id === selected);

  const closeModal = () => {
    setModalVisible(false);
    setShowAddInput(false);
    setNewName('');
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    closeModal();
  };

  const handleSaveNew = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert({ name: newName.trim() })
        .select()
        .single();

      if (insertError) throw insertError;

      onCategoryCreated(data);
      onSelect(data.id);
      closeModal();
    } catch (e: any) {
      Alert.alert(
        'Gagal Menyimpan Kategori',
        e.message || 'Terjadi kesalahan tidak diketahui'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Kategori <Text style={styles.required}>*</Text>
      </Text>

      <TouchableOpacity
        style={[styles.dropdownBtn, error && styles.dropdownBtnError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedCategory ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selectedCategory ? selectedCategory.name : 'Pilih kategori'}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.sheet}>
                  <View style={styles.handle} />
                  <Text style={styles.sheetTitle}>Pilih Kategori</Text>

                  <FlatList
                    data={categories}
                    keyExtractor={item => item.id}
                    style={{ maxHeight: 300 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => handleSelect(item.id)}
                      >
                        <Text style={[
                          styles.optionText,
                          selected === item.id && styles.optionTextActive,
                        ]}>
                          {item.name}
                        </Text>
                        {selected === item.id && (
                          <Text style={styles.optionCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>Belum ada kategori, buat dulu di bawah</Text>
                    }
                  />

                  {!showAddInput ? (
                    <TouchableOpacity
                      style={styles.addRow}
                      onPress={() => setShowAddInput(true)}
                    >
                      <Text style={styles.addRowText}>+ Tambah Kategori Baru</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.addInputRow}>
                      <TextInput
                        style={styles.addInput}
                        placeholder="Nama kategori baru..."
                        placeholderTextColor={Colors.gray[400]}
                        value={newName}
                        onChangeText={setNewName}
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.addSaveBtn}
                        onPress={handleSaveNew}
                        disabled={saving || !newName.trim()}
                      >
                        {saving ? (
                          <ActivityIndicator color={Colors.white} size="small" />
                        ) : (
                          <Text style={styles.addSaveText}>Simpan</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.gray[700], marginBottom: 6 },
  required: { color: Colors.danger },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownBtnError: { borderColor: Colors.danger },
  dropdownText: { fontSize: 15, color: Colors.gray[800] },
  dropdownPlaceholder: { fontSize: 15, color: Colors.gray[400] },
  chevron: { fontSize: 16, color: Colors.gray[500] },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
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
    paddingBottom: 32,
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.gray[300],
    borderRadius: 2, alignSelf: 'center', marginBottom: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.gray[800], marginBottom: 12 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  optionText: { fontSize: 15, color: Colors.gray[700] },
  optionTextActive: { color: Colors.primary, fontWeight: '600' },
  optionCheck: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: Colors.gray[400], paddingVertical: 20 },
  addRow: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  addRowText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  addInputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addInput: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.gray[800],
  },
  addSaveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSaveText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
});
