import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Product } from '../../types';
import { Colors } from '../../constants/colors';

interface Props {
  products: Product[];
  onAdd: (product: Product) => void;
}

export default function ProductGrid({ products, onAdd }: Props) {
  const renderItem = ({ item }: { item: Product }) => {
    const outOfStock = (item.stock ?? 0) <= 0;
    return (
      <TouchableOpacity
        style={[styles.card, outOfStock && styles.cardDisabled]}
        onPress={() => !outOfStock && onAdd(item)}
        activeOpacity={outOfStock ? 1 : 0.7}
      >
        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>{item.stock ?? 0}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>
          Rp {item.price.toLocaleString('id-ID')}
        </Text>
        {outOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Habis</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={products}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      numColumns={3}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 8,
    paddingBottom: 32,
  },
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  stockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stockText: {
    fontSize: 10,
    color: Colors.gray[600],
    fontWeight: '600',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[800],
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.danger,
  },
});
