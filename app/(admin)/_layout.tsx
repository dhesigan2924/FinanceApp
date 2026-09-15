import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 16 }}
          onPress={() => router.replace('/')}
        >
          <Text style={{ color: '#F44336', fontWeight: 'bold' }}>Switch User</Text>
        </TouchableOpacity>
      )
    }}>
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
    </Stack>
  );
}
