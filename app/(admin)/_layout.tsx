import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Text } from 'react-native';
import { useCartStore } from '../../store/useCartStore';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icon}
    </Text>
  );
}

export default function AdminLayout() {
  const totalItems = useCartStore(s => s.getTotalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[100],
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: totalItems > 0 ? `POS (${totalItems})` : 'POS',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛒" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory/index"
        options={{
          title: 'Stok',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📦" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="inventory/edit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports/daily"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports/monthly"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
