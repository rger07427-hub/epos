import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Category } from '../../types';
import { Colors } from '../../constants/colors';

interface Props {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  error?: string;
}

export default function CategoryPicker({
  categories,
  selected,
  onSelect,
  error,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Kategori <Text style={styles.required}>*</Text>
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              selected === cat.id && styles.chipActive,
            ]}
            onPress={() => onSelect(cat.id)}
          >
            <Text style={[
              styles.chipText,
              selected === cat.id && styles.chipTextActive,
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  required: {
    color: Colors.danger,
  },
  list: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
});
