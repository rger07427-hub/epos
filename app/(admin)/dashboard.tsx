import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';

export default function AdminDashboard() {
  const { profile, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Halo, {profile?.full_name} 👋
          </Text>
          <Text style={styles.branch}>
            📍 {profile?.branch?.name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={signOut}
        >
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/inventory')}
        >
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuLabel}>Manajemen Stok</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(admin)/pos')}
        >
          <Text style={styles.menuIcon}>🛒</Text>
          <Text style={styles.menuLabel}>POS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.menuDisabled]}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuLabel}>Riwayat</Text>
          <Text style={styles.menuSoon}>Segera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.menuDisabled]}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuLabel}>Laporan</Text>
          <Text style={styles.menuSoon}>Segera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  branch: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    textAlign: 'center',
  },
  menuSoon: {
    fontSize: 11,
    color: Colors.gray[400],
    marginTop: 4,
  },
});
