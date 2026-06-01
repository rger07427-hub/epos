import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../../types';
import { Colors } from '../../constants/colors';

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
}

export default function ProductCard({ product, onEdit }: Props) {
  const isLowStock = (product.stock ?? 0) <= 5;
  const isOutOfStock = (product.stock ?? 0) === 0;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.category}>
          {product.category?.name ?? 'Tanpa Kategori'}
        </Text>
        <Text style={styles.price}>
          Rp {product.price.toLocaleString('id-ID')}
        </Text>
      </View>
      <View style={styles.right}>
        <View style={[
          styles.stockBadge,
          isOutOfStock && styles.stockOut,
          isLowStock && !isOutOfStock && styles.stockLow,
          !isLowStock && styles.stockOk,
        ]}>
          <Text style={styles.stockText}>
            {product.stock} {product.unit}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(product)}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockOk: {
    backgroundColor: '#dcfce7',
  },
  stockLow: {
    backgroundColor: '#fef9c3',
  },
  stockOut: {
    backgroundColor: '#fee2e2',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
