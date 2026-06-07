import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import AppHeader from '../../components/shared/AppHeader';

export default function AdminDashboard() {
  const { profile, signOut } = useAuthStore();
  const [todayStats, setTodayStats] = useState({
    revenue: 0,
    transactions: 0,
    lowStock: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!profile?.branch_id) return;

    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;

    const [trxRes, stockRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('total')
        .eq('branch_id', profile.branch_id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay),
      supabase
        .from('branch_stocks')
        .select('stock')
        .eq('branch_id', profile.branch_id)
        .lte('stock', 5),
    ]);

    const revenue = trxRes.data?.reduce((s, t) => s + t.total, 0) ?? 0;
    const transactions = trxRes.data?.length ?? 0;
    const lowStock = stockRes.data?.length ?? 0;

    setTodayStats({ revenue, transactions, lowStock });
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, [profile]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Dashboard"
        subtitle={profile?.branch?.name}
        rightAction={{
          label: 'Keluar',
          onPress: signOut,
          color: '#fca5a5',
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStats();
            }}
            colors={[Colors.primary]}
          />
        }
      >
        <Text style={styles.greeting}>
          Halo, {profile?.full_name} 👋
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <Text style={styles.sectionTitle}>Ringkasan Hari Ini</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>
              Rp {todayStats.revenue.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.statLabel}>Total Omzet</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🧾</Text>
            <Text style={styles.statValue}>
              {todayStats.transactions}
            </Text>
            <Text style={styles.statLabel}>Transaksi</Text>
          </View>
          <View style={[
            styles.statCard,
            todayStats.lowStock > 0 && styles.statCardWarning,
          ]}>
            <Text style={styles.statIcon}>⚠️</Text>
            <Text style={[
              styles.statValue,
              todayStats.lowStock > 0 && styles.statValueWarning,
            ]}>
              {todayStats.lowStock}
            </Text>
            <Text style={styles.statLabel}>Stok Menipis</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Gunakan tab bar di bawah untuk navigasi ke POS,
            Stok, Riwayat, dan Laporan.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: Colors.gray[500],
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[700],
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardWarning: {
    borderWidth: 1.5,
    borderColor: Colors.warning,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  statValueWarning: {
    color: Colors.warning,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 20,
  },
});
