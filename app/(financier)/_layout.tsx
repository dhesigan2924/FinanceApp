import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

export default function FinancierLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4CAF50',
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 16 }}
          onPress={() => router.replace('/')}
        >
          <Text style={{ color: '#F44336', fontWeight: 'bold' }}>Switch User</Text>
        </TouchableOpacity>
      )
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="borrowers"
        options={{
          title: 'Borrowers',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cash-multiple" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
