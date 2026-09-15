import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowers' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchStats = async () => {
    // 1. Fetch total borrowers count & principal
    const { data: borrowers } = await supabase.from('borrowers').select('*');
    
    // 2. Fetch all transactions to sum by payment method
    const { data: txData } = await supabase
      .from('transactions')
      .select('*, borrower:borrowers(name)')
      .order('date', { ascending: false });
    
    if (txData) {
      setTransactions(txData);
    }
    
    let totalPrincipal = 0;
    if (borrowers) {
      totalPrincipal = borrowers.reduce((acc, curr) => acc + Number(curr.principal_amount), 0);
    }
    
    const bank1 = txData?.filter(t => t.payment_method === 'bank_1').reduce((a,c) => a + Number(c.amount), 0) || 0;
    const bank2 = txData?.filter(t => t.payment_method === 'bank_2').reduce((a,c) => a + Number(c.amount), 0) || 0;
    const bank3 = txData?.filter(t => t.payment_method === 'bank_3').reduce((a,c) => a + Number(c.amount), 0) || 0;
    const bank4 = txData?.filter(t => t.payment_method === 'bank_4').reduce((a,c) => a + Number(c.amount), 0) || 0;
    const cash = txData?.filter(t => t.payment_method === 'cash').reduce((a,c) => a + Number(c.amount), 0) || 0;
    const totalCollected = bank1 + bank2 + bank3 + bank4 + cash;
    
    setStats({
      totalBorrowers: borrowers?.length || 0,
      totalPrincipal,
      total: totalCollected,
      totalCollected,
      bank1, bank2, bank3, bank4, cash
    });
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return <ActivityIndicator style={{marginTop: 50}} />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium">Bank Tracking</Text>
        <Text style={{color: '#666'}}>Total Collected: ₹{stats.total.toLocaleString()}</Text>
      </View>

      <View style={styles.statsGrid}>
        {Object.entries(stats).filter(([k]) => k !== 'total').map(([key, val]) => (
          <Card key={key} style={styles.statCard}>
            <Card.Content>
              <Text style={{textTransform: 'capitalize', color: '#666'}}>{key.replace('_', ' ')}</Text>
              <Text variant="titleMedium" style={{fontWeight: 'bold'}}>₹{val.toLocaleString()}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Divider style={{marginVertical: 16}} />

      <Text variant="titleLarge" style={{paddingHorizontal: 16, marginBottom: 8}}>Recent Transactions</Text>
      {transactions.map(t => (
        <Card key={t.id} style={styles.txCard}>
          <Card.Content style={styles.row}>
            <View>
              <Text variant="titleMedium">{t.borrower?.name}</Text>
              <Text style={{fontSize: 12, color: '#666'}}>{new Date(t.date).toLocaleString()}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text variant="titleMedium" style={{color: t.type === 'repayment' ? '#4CAF50' : '#F44336', fontWeight: 'bold'}}>
                {t.type === 'repayment' ? '+' : '-'} ₹{t.amount}
              </Text>
              <Text style={{fontSize: 12, textTransform: 'capitalize', color: '#2196F3'}}>{t.payment_method.replace('_', ' ')}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#fff', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  statCard: { width: '45%', margin: '2.5%', backgroundColor: '#fff' },
  txCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
