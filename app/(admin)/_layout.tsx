import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Text, View, StyleSheet } from 'react-native';

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={tabStyles.container}>
      <Text style={tabStyles.icon}>{icon}</Text>
      <Text style={[
        tabStyles.label,
        { color: focused ? Colors.primary : Colors.gray[400] },
      ]}>
        {label}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          height: 64,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Beranda" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛒" label="POS" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📦" label="Stok" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Riwayat" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports/daily"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" label="Laporan" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory/add"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="inventory/edit"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="reports/monthly"
        options={{ href: null }}
      />
    </Tabs>
  );
}
