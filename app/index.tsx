import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import { router, Redirect } from 'expo-router';

export default function Index() {
  const [role, setRole] = useState<string | null>(null);

  const handleSelectRole = (selectedRole: string) => {
    setRole(selectedRole);
  };

  if (role === 'admin') {
    return <Redirect href="/(admin)" />;
  }

  if (role === 'financier') {
    return <Redirect href="/(financier)" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who is using this app?</Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#4CAF50' }]} 
        onPress={() => handleSelectRole('financier')}
      >
        <Text style={styles.buttonText}>I am the Financier (Dad)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#2196F3' }]} 
        onPress={() => handleSelectRole('admin')}
      >
        <Text style={styles.buttonText}>I am the Admin (Son)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
    color: '#333',
  },
  button: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
