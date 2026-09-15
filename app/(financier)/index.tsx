import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { supabase } from '@/lib/supabase';

export default function FinancierDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalPending, setTotalPending] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [pendingSchedules, setPendingSchedules] = useState<any[]>([]);
  const [collectedSchedules, setCollectedSchedules] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collection_schedules' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    // Fetch today's schedules
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('collection_schedules')
      .select('*, borrower:borrowers(name)')
      .eq('due_date', today);
      
    if (data) {
      const pending = data.filter(d => d.status === 'pending' || d.status === 'excused');
      const collected = data.filter(d => d.status === 'collected');
      
      setPendingSchedules(pending);
      setCollectedSchedules(collected);
      
      setTotalPending(pending.reduce((sum, item) => sum + Number(item.amount_due), 0));
      setTotalCollected(collected.reduce((sum, item) => sum + Number(item.amount_due), 0));
    }
    
    setLoading(false);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.panel}>
        <Text variant="titleLarge" style={[styles.panelTitle, { color: '#F44336' }]}>
          Pending Today: ₹{totalPending.toLocaleString()}
        </Text>
        {pendingSchedules.length === 0 ? <Text style={styles.empty}>All caught up!</Text> : null}
        {pendingSchedules.map(item => (
          <Card key={item.id} style={styles.card}>
            <Card.Content style={styles.row}>
              <Text variant="titleMedium">{item.borrower?.name}</Text>
              <Text variant="titleMedium" style={{ color: '#F44336', fontWeight: 'bold' }}>
                ₹{item.amount_due.toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.panel}>
        <Text variant="titleLarge" style={[styles.panelTitle, { color: '#4CAF50' }]}>
          Collected Today: ₹{totalCollected.toLocaleString()}
        </Text>
        {collectedSchedules.length === 0 ? <Text style={styles.empty}>Nothing collected yet.</Text> : null}
        {collectedSchedules.map(item => (
          <Card key={item.id} style={styles.card}>
            <Card.Content style={styles.row}>
              <Text variant="titleMedium">{item.borrower?.name}</Text>
              <Text variant="titleMedium" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                ₹{item.amount_due.toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  panel: { padding: 16, marginBottom: 8 },
  panelTitle: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 8, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empty: { fontStyle: 'italic', color: '#888', padding: 8 }
});
