import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { BluetoothDevice } from 'react-native-bluetooth-classic';
import { Colors } from '../../constants/colors';
import { usePrinterStore } from '../../store/usePrinterStore';
import {
  requestBluetoothPermissions,
  getPairedPrinters,
  connectPrinter,
  sendTestPrint,
} from '../../lib/printer';

export default function PrinterSettingsScreen() {
  const {
    deviceAddress,
    deviceName,
    isConnected,
    setDevice,
    setConnected,
    loadSavedDevice,
  } = usePrinterStore();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSavedDevice();
    handleScan();
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Izin Ditolak',
          'Aplikasi butuh izin Bluetooth untuk mencari printer'
        );
        return;
      }
      const paired = await getPairedPrinters();
      setDevices(paired);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Gagal mencari printer');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevice = async (device: BluetoothDevice) => {
    setLoading(true);
    try {
      await connectPrinter(device.address);
      await setDevice(device.address, device.name ?? 'Printer');
      setConnected(true);
      Alert.alert('Berhasil', `Terhubung ke ${device.name}`);
    } catch (error: any) {
      setConnected(false);
      Alert.alert(
        'Gagal Terhubung',
        error.message || 'Pastikan printer menyala dan sudah di-pairing'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = async () => {
    if (!deviceAddress) {
      Alert.alert('Info', 'Pilih printer terlebih dahulu');
      return;
    }
    setTesting(true);
    try {
      const device = await connectPrinter(deviceAddress);
      await sendTestPrint(device);
      setConnected(true);
      Alert.alert('Berhasil', 'Cek hasil cetak di printer');
    } catch (error: any) {
      setConnected(false);
      Alert.alert(
        'Gagal Cetak',
        error.message || 'Pastikan printer menyala dan dalam jangkauan'
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan Printer</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Printer Tersimpan</Text>
        <Text style={styles.statusValue}>
          {deviceName ?? 'Belum ada printer dipilih'}
        </Text>
        {deviceName && (
          <View style={[
            styles.statusBadge,
            isConnected ? styles.statusOk : styles.statusOff,
          ]}>
            <Text style={styles.statusBadgeText}>
              {isConnected ? '● Terhubung' : '○ Belum terhubung'}
            </Text>
          </View>
        )}
        {deviceName && (
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestPrint}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.testBtnText}>🖨️ Tes Cetak</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Printer Ter-pairing</Text>
        <TouchableOpacity onPress={handleScan} disabled={loading}>
          <Text style={styles.refreshText}>
            {loading ? 'Memuat...' : '↻ Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && devices.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 32 }}
        />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.address}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.deviceCard,
                deviceAddress === item.address && styles.deviceCardActive,
              ]}
              onPress={() => handleSelectDevice(item)}
            >
              <Text style={styles.deviceIcon}>🖨️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceAddress}>{item.address}</Text>
              </View>
              {deviceAddress === item.address && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Tidak ada printer ter-pairing.{'\n'}
              Pairing dulu lewat Pengaturan Bluetooth HP.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
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
  backText: { fontSize: 14, color: Colors.primary, fontWeight: '600', width: 80 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.gray[800] },
  statusCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: { fontSize: 12, color: Colors.gray[500] },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[800],
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  statusOk: { backgroundColor: '#dcfce7' },
  statusOff: { backgroundColor: '#fee2e2' },
  statusBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.gray[700] },
  testBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  testBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 14 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  refreshText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  list: { padding: 16, paddingTop: 0, gap: 10 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  deviceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#eef2ff',
  },
  deviceIcon: { fontSize: 24 },
  deviceName: { fontSize: 14, fontWeight: '600', color: Colors.gray[800] },
  deviceAddress: { fontSize: 11, color: Colors.gray[400], marginTop: 2 },
  checkmark: { fontSize: 18, color: Colors.primary, fontWeight: 'bold' },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray[400],
    fontSize: 13,
    marginTop: 32,
    lineHeight: 20,
  },
});
