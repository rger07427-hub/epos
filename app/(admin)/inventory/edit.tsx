import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';

export default function EditProductScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Produk</Text>
      <Text style={styles.subtitle}>Tahap 4c</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 8,
  },
});
