import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Dialog, Portal, TextInput, SegmentedButtons, Button, Divider } from 'react-native-paper';
import { supabase } from '@/lib/supabase';

export default function FinancierBorrowers() {
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loanType, setLoanType] = useState('daily');
  const [principal, setPrincipal] = useState('');
  const [interest, setInterest] = useState('');
  const [amountToCollect, setAmountToCollect] = useState('');

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<any>(null);
  const [borrowerHistory, setBorrowerHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [topupDialogVisible, setTopupDialogVisible] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  const [listTab, setListTab] = useState('daily');

  useEffect(() => {
    fetchBorrowers();

    const channel = supabase
      .channel('borrowers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowers' }, () => {
        fetchBorrowers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchBorrowers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchBorrowers = async () => {
    setLoading(true);
    const { data } = await supabase.from('borrowers').select('*').order('name');
    if (data) setBorrowers(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBorrowers();
    setRefreshing(false);
  };

  const handleCreateBorrower = async () => {
    if (!name || !principal || !interest || !amountToCollect) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.from('borrowers').insert([{
      name,
      phone,
      loan_type: loanType,
      principal_amount: Number(principal),
      interest_rate: Number(interest),
      amount_to_collect_per_schedule: Number(amountToCollect)
    }]);
    
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setDialogVisible(false);
      setName(''); setPhone(''); setPrincipal(''); setInterest(''); setAmountToCollect('');
      fetchBorrowers();
    }
  };

  const openBorrowerDetails = async (borrower: any) => {
    setSelectedBorrower(borrower);
    setDetailsVisible(true);
    setHistoryLoading(true);
    
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('borrower_id', borrower.id)
      .order('date', { ascending: false });
      
    if (data) setBorrowerHistory(data);
    setHistoryLoading(false);
  };

  const handleTopup = async () => {
    if (!topupAmount || isNaN(Number(topupAmount))) return;
    setHistoryLoading(true);
    
    await supabase.from('transactions').insert([{
      borrower_id: selectedBorrower.id,
      type: 'topup',
      amount: Number(topupAmount),
      payment_method: 'cash',
      is_principal: true
    }]);
    
    const newPrincipal = Number(selectedBorrower.principal_amount) + Number(topupAmount);
    await supabase.from('borrowers')
      .update({ principal_amount: newPrincipal })
      .eq('id', selectedBorrower.id);
      
    setTopupDialogVisible(false);
    setTopupAmount('');
    
    const { data: bData } = await supabase.from('borrowers').select('*').eq('id', selectedBorrower.id).single();
    if (bData) setSelectedBorrower(bData);
    
    const { data: hData } = await supabase.from('transactions').select('*').eq('borrower_id', selectedBorrower.id).order('date', { ascending: false });
    if (hData) setBorrowerHistory(hData);
    
    setHistoryLoading(false);
    fetchBorrowers();
  };

  const filteredBorrowers = borrowers.filter(b => b.loan_type === listTab);

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <SegmentedButtons
          value={listTab}
          onValueChange={setListTab}
          buttons={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
      </View>
      {loading && borrowers.length === 0 ? (
        <ActivityIndicator style={{marginTop: 20}} />
      ) : filteredBorrowers.length === 0 ? (
        <ScrollView 
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={{color: '#888'}}>No borrowers here!</Text>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredBorrowers.map(b => (
            <TouchableOpacity key={b.id} onPress={() => openBorrowerDetails(b)}>
              <Card style={styles.card}>
                <Card.Content style={styles.row}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text variant="titleMedium" style={{fontWeight:'bold', marginRight: 6}}>{b.name}</Text>
                      <Text style={{color: '#2196F3', fontSize: 13, fontWeight: 'bold'}}>(₹{b.principal_amount})</Text>
                    </View>
                    <Text style={{color:'#666', textTransform: 'capitalize'}}>{b.loan_type} Loan</Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text variant="titleMedium" style={{color:'#4CAF50', fontWeight:'bold'}}>
                      ₹{b.amount_to_collect_per_schedule}
                    </Text>
                    <Text style={{fontSize: 12, color:'#888'}}>per schedule</Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => setDialogVisible(true)} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add New Borrower</Dialog.Title>
          <Dialog.Content>
            <ScrollView>
              <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
              <TextInput label="Phone (Optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} mode="outlined" />
              <SegmentedButtons
                value={loanType}
                onValueChange={setLoanType}
                buttons={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'lumpsum', label: 'Lump' },
                ]}
                style={{marginBottom: 16}}
              />
              <TextInput label="Principal Amount (₹)" value={principal} onChangeText={setPrincipal} keyboardType="numeric" style={styles.input} mode="outlined" />
              <TextInput label="Interest Rate (%)" value={interest} onChangeText={setInterest} keyboardType="numeric" style={styles.input} mode="outlined" />
              <TextInput label="To Collect per schedule (₹)" value={amountToCollect} onChangeText={setAmountToCollect} keyboardType="numeric" style={styles.input} mode="outlined" />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleCreateBorrower} loading={loading}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Modal visible={detailsVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalHeader}>
          <Text variant="titleLarge" style={{fontWeight: 'bold'}}>{selectedBorrower?.name}</Text>
          <Button onPress={() => setDetailsVisible(false)}>Close</Button>
        </View>
        <ScrollView style={{flex: 1, padding: 16, backgroundColor: '#F5F5F5'}}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.detailRow}>
                <Text>Principal Amount</Text>
                <Text style={{fontWeight: 'bold'}}>₹{selectedBorrower?.principal_amount}</Text>
              </View>
              <Divider style={{marginVertical: 8}} />
              <View style={styles.detailRow}>
                <Text>Interest Collected</Text>
                <Text style={{fontWeight: 'bold', color: '#4CAF50'}}>₹{selectedBorrower?.total_interest_collected}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text>Principal Collected</Text>
                <Text style={{fontWeight: 'bold', color: '#2196F3'}}>₹{selectedBorrower?.total_principal_collected}</Text>
              </View>
            </Card.Content>
          </Card>
          
          {topupDialogVisible ? (
            <Card style={{marginBottom: 24, padding: 16, backgroundColor: '#E3F2FD'}}>
              <Text style={{fontWeight: 'bold', marginBottom: 8}}>Top-Up Principal</Text>
              <Text style={{marginBottom: 12, color: '#555'}}>How much extra cash are you giving to {selectedBorrower?.name}?</Text>
              <TextInput 
                label="Amount (₹)" 
                value={topupAmount} 
                onChangeText={setTopupAmount} 
                keyboardType="numeric" 
                mode="outlined"
                style={{marginBottom: 12, backgroundColor: '#fff'}}
              />
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <Button onPress={() => setTopupDialogVisible(false)}>Cancel</Button>
                <Button mode="contained" onPress={handleTopup} style={{marginLeft: 8}}>Add Top-Up</Button>
              </View>
            </Card>
          ) : (
            <Button 
              mode="contained" 
              style={{marginBottom: 24}} 
              buttonColor="#2196F3"
              onPress={() => setTopupDialogVisible(true)}
            >
              Top-Up Principal (Give More Cash)
            </Button>
          )}

          <Text variant="titleMedium" style={{fontWeight: 'bold', marginBottom: 8}}>Transaction History</Text>
          {historyLoading ? <ActivityIndicator /> : null}
          {borrowerHistory.length === 0 && !historyLoading ? <Text style={{fontStyle: 'italic', color: '#888'}}>No transactions yet.</Text> : null}
          
          {borrowerHistory.map(tx => (
            <Card key={tx.id} style={{marginBottom: 8, backgroundColor: '#fff'}}>
              <Card.Content style={styles.row}>
                <View>
                  <Text style={{fontWeight: 'bold', color: tx.type === 'repayment' ? '#4CAF50' : '#F44336'}}>
                    {tx.type.toUpperCase()}
                  </Text>
                  <Text style={{fontSize: 12, color: '#666'}}>{new Date(tx.date).toLocaleDateString()}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={{fontWeight: 'bold'}}>₹{tx.amount}</Text>
                  <Text style={{fontSize: 12, textTransform: 'capitalize'}}>{tx.payment_method.replace('_', ' ')}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  card: { marginBottom: 12, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#2196F3' },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }
});
