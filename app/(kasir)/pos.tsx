import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';

export default function KasirPOS() {
  const { profile, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Layar POS</Text>
      <Text style={styles.subtitle}>
        Kasir: {profile?.full_name}
      </Text>
      <Text style={styles.branch}>
        📍 {profile?.branch?.name}
      </Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    marginTop: 8,
  },
  branch: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 4,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
