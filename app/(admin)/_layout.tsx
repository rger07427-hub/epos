import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useCartStore } from '../../store/useCartStore';
import AdminDrawer from '../../components/shared/AdminDrawer';
import AppIcon, { IconName } from '../../components/shared/AppIcon';

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return <AppIcon name={name} size={22} color={focused ? Colors.primary : Colors.gray[400]} />;
}

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray[400],
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.gray[100],
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="inventory"
          options={{
            title: 'Stok',
            tabBarIcon: ({ focused }) => <TabIcon name="stok" focused={focused} />,
            href: '/(admin)/inventory',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Riwayat',
            tabBarIcon: ({ focused }) => <TabIcon name="riwayat" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Laporan',
            tabBarIcon: ({ focused }) => <TabIcon name="laporan" focused={focused} />,
            href: '/(admin)/reports/daily',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ focused }) => <TabIcon name="profil" focused={focused} />,
          }}
        />

        {/* Route ini tetap ada & bisa diakses, TAPI disembunyikan dari tab bar */}
        <Tabs.Screen name="dashboard" options={{ href: null }} />
        <Tabs.Screen name="pos" options={{ href: null }} />
        <Tabs.Screen name="categories" options={{ href: null }} />
        <Tabs.Screen name="users" options={{ href: null }} />
        <Tabs.Screen name="printer-settings" options={{ href: null }} />
        <Tabs.Screen name="store-settings" options={{ href: null }} />
      </Tabs>

      <AdminDrawer />
    </View>
  );
}
