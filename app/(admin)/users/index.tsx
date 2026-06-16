import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { CashierUser } from '../../../types';
import { Colors } from '../../../constants/colors';
import EmptyState from '../../../components/shared/EmptyState';
import Badge from '../../../components/shared/Badge';

export default function UsersScreen() {
  const { profile } = useAuthStore();
  const [users, setUsers] = useState<CashierUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!profile?.branch_id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*, branch:branches(*)')
      .eq('branch_id', profile.branch_id)
      .order('role')
      .order('full_name');

    if (!error && data) setUsers(data);
    setLoading(false);
    setRefreshing(false);
  }, [profile]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = (user: CashierUser) => {
    if (user.id === profile?.id) {
      Alert.alert('Tidak Bisa', 'Anda tidak bisa menonaktifkan akun sendiri');
      return;
    }
    Alert.alert(
      'Info',
      'Untuk menonaktifkan akun kasir, hapus atau nonaktifkan user di dashboard Supabase Authentication.',
      [{ text: 'OK' }]
    );
  };

  const renderUser = ({ item }: { item: CashierUser }) => {
    const isMe = item.id === profile?.id;
    return (
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.full_name}</Text>
            {isMe && (
              <Badge label="Anda" type="info" />
            )}
          </View>
          <Badge
            label={item.role === 'admin' ? '👑 Admin' : '💼 Kasir'}
            type={item.role === 'admin' ? 'warning' : 'default'}
          />
          <Text style={styles.joinDate}>
            Bergabung:{' '}
            {new Date(item.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        {!isMe && item.role !== 'admin' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleToggleActive(item)}
          >
            <Text style={styles.actionText}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manajemen Kasir</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            Alert.alert(
              'Tambah Kasir',
              'Untuk menambah kasir baru:\n\n1. Buka dashboard Supabase\n2. Masuk ke Authentication → Users\n3. Klik "Add user"\n4. Isi email & password kasir\n5. Centang Auto Confirm\n6. Jalankan SQL:\n\nINSERT INTO profiles (id, full_name, role, branch_id)\nVALUES (\'UID\', \'Nama Kasir\', \'kasir\', \'BRANCH_ID\');',
              [{ text: 'Mengerti' }]
            )
          }
        >
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          📍 Menampilkan pengguna cabang{' '}
          <Text style={styles.infoBold}>{profile?.branch?.name}</Text>
        </Text>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderUser}
          ListEmptyComponent={
            <EmptyState
              icon="👥"
              title="Belum ada pengguna"
              subtitle="Tambah kasir melalui dashboard Supabase"
            />
          }
          contentContainerStyle={
            users.length === 0 ? styles.emptyContainer : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchUsers();
              }}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Panduan */}
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>📋 Cara Tambah Kasir Baru</Text>
        <Text style={styles.guideStep}>
          1. Buka Supabase Dashboard
        </Text>
        <Text style={styles.guideStep}>
          2. Authentication → Users → Add user
        </Text>
        <Text style={styles.guideStep}>
          3. Isi email & password → Auto Confirm
        </Text>
        <Text style={styles.guideStep}>
          4. Jalankan SQL insert ke tabel profiles
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoBanner: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary,
  },
  infoBold: {
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 48,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  joinDate: {
    fontSize: 11,
    color: Colors.gray[400],
    marginTop: 4,
  },
  actionBtn: {
    padding: 8,
  },
  actionText: {
    fontSize: 20,
  },
  guide: {
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  guideStep: {
    fontSize: 13,
    color: Colors.gray[500],
    marginBottom: 4,
    lineHeight: 20,
  },
});
