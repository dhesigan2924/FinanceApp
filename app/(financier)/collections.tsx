import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Dialog, Portal, TextInput, SegmentedButtons, Button, IconButton } from 'react-native-paper';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';

export default function FinancierCollections() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('daily');
  
  const [collectDialogVisible, setCollectDialogVisible] = useState(false);
  const [excuseDialogVisible, setExcuseDialogVisible] = useState(false);
  const [viewExcuseDialogVisible, setViewExcuseDialogVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const openViewExcuse = (schedule: any) => {
    setSelectedSchedule(schedule);
    setViewExcuseDialogVisible(true);
  };
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const [excuseNote, setExcuseNote] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();

    const channel = supabase
      .channel('collections-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collection_schedules' }, () => {
        fetchSchedules();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase
      .from('collection_schedules')
      .select('*, borrower:borrowers(*)')
      .in('status', ['pending', 'excused']);
      
    if (data) setSchedules(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  };

  const getFilteredSchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (tab === 'overdue') {
      return schedules.filter(s => s.due_date < today);
    }
    
    return schedules.filter(s => 
      s.due_date >= today && s.borrower?.loan_type === tab
    );
  };

  const openCollectDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    setPaymentMethod('cash');
    setCollectDialogVisible(true);
  };

  const openExcuseDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    setExcuseNote('');
    setRecordingUri(null);
    setExcuseDialogVisible(true);
  };

  const handleMarkCollected = async () => {
    if (!selectedSchedule) return;
    setLoading(true);
    
    await supabase
      .from('collection_schedules')
      .update({ status: 'collected' })
      .eq('id', selectedSchedule.id);
      
    await supabase.from('transactions').insert([{
      borrower_id: selectedSchedule.borrower_id,
      type: 'repayment',
      amount: selectedSchedule.amount_due,
      payment_method: paymentMethod,
      is_principal: false
    }]);
    
    const { data: bData } = await supabase.from('borrowers').select('total_interest_collected').eq('id', selectedSchedule.borrower_id).single();
    if (bData) {
      await supabase.from('borrowers').update({
        total_interest_collected: Number(bData.total_interest_collected) + Number(selectedSchedule.amount_due)
      }).eq('id', selectedSchedule.borrower_id);
    }

    setCollectDialogVisible(false);
    fetchSchedules();
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingUri(uri);
    setRecording(null);
  };

  const handleSaveExcuse = async () => {
    if (!selectedSchedule) return;
    setLoading(true);
    
    let audioUrl = null;
    if (recordingUri) {
      // In production: Upload to supabase storage bucket
      // const response = await fetch(recordingUri);
      // const blob = await response.blob();
      // await supabase.storage.from('excuses').upload(`audio_${Date.now()}.m4a`, blob);
      audioUrl = 'dummy-audio-url.m4a'; // mock for demo until user hooks up real upload
    }
    
    await supabase
      .from('collection_schedules')
      .update({ 
        status: 'excused',
        excuse_note: excuseNote,
        excuse_audio_url: audioUrl
      })
      .eq('id', selectedSchedule.id);

    setExcuseDialogVisible(false);
    fetchSchedules();
  };

  const filtered = getFilteredSchedules();

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'overdue', label: 'Overdue' },
          ]}
        />
      </View>
      
      {loading && schedules.length === 0 ? (
        <ActivityIndicator style={{marginTop: 20}} />
      ) : filtered.length === 0 ? (
        <ScrollView 
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={{color: '#888'}}>No collections due right now!</Text>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filtered.map(item => (
            <Card key={item.id} style={styles.card}>
              <Card.Content>
                <View style={styles.row}>
                  <View>
                    <Text variant="titleMedium" style={{fontWeight:'bold'}}>{item.borrower?.name}</Text>
                    <Text style={{color:'#666'}}>Due: {item.due_date}</Text>
                  </View>
                  <Text variant="titleMedium" style={{color:'#4CAF50', fontWeight:'bold'}}>
                    ₹{item.amount_due}
                  </Text>
                </View>
                
                <View style={[styles.row, {marginTop: 16}]}>
                  {item.status === 'excused' ? (
                    <Button 
                      mode="outlined" 
                      textColor="#F9A825"
                      style={{flex: 1, marginRight: 8, borderColor: '#F9A825'}}
                      onPress={() => openViewExcuse(item)}
                    >
                      Excused (View)
                    </Button>
                  ) : (
                    <Button 
                      mode="contained" 
                      buttonColor="#F44336" 
                      onPress={() => openExcuseDialog(item)}
                      style={{flex: 1, marginRight: 8}}
                    >
                      Not Collected
                    </Button>
                  )}
                  <Button 
                    mode="contained" 
                    buttonColor="#4CAF50" 
                    onPress={() => openCollectDialog(item)}
                    style={{flex: 1, marginLeft: 8}}
                  >
                    Collected
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* View Excuse Dialog */}
      <Portal>
        <Dialog visible={viewExcuseDialogVisible} onDismiss={() => setViewExcuseDialogVisible(false)}>
          <Dialog.Title>Excuse Details</Dialog.Title>
          <Dialog.Content>
            <Text style={{fontWeight: 'bold', marginBottom: 8}}>Written Note:</Text>
            <Text style={{marginBottom: 16, color: '#666', fontStyle: 'italic'}}>
              {selectedSchedule?.excuse_note || 'No note written.'}
            </Text>
            
            {selectedSchedule?.excuse_audio_url && (
              <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', padding: 8, borderRadius: 8}}>
                <IconButton icon="play-circle" iconColor="#2196F3" size={32} />
                <Text style={{color: '#2196F3', fontWeight: 'bold'}}>Play Audio Excuse</Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setViewExcuseDialogVisible(false)}>Close</Button>
            <Button textColor="#F44336" onPress={() => openExcuseDialog(selectedSchedule)}>Edit Excuse</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Collect Dialog */}
      <Portal>
        <Dialog visible={collectDialogVisible} onDismiss={() => setCollectDialogVisible(false)}>
          <Dialog.Title>Where did money go?</Dialog.Title>
          <Dialog.Content>
            <Text style={{marginBottom: 16}}>How did {selectedSchedule?.borrower?.name} pay ₹{selectedSchedule?.amount_due}?</Text>
            <SegmentedButtons
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              buttons={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank_1', label: 'Bank 1' },
                { value: 'bank_2', label: 'Bank 2' },
              ]}
              style={{marginBottom: 8}}
            />
            <SegmentedButtons
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              buttons={[
                { value: 'bank_3', label: 'Bank 3' },
                { value: 'bank_4', label: 'Bank 4' },
              ]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCollectDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleMarkCollected}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Excuse Dialog */}
      <Portal>
        <Dialog visible={excuseDialogVisible} onDismiss={() => setExcuseDialogVisible(false)}>
          <Dialog.Title>Record Excuse</Dialog.Title>
          <Dialog.Content>
            <TextInput 
              label="Type excuse (optional)" 
              value={excuseNote} 
              onChangeText={setExcuseNote} 
              mode="outlined" 
              multiline 
              numberOfLines={3} 
              style={{marginBottom: 16}}
            />
            
            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 8}}>
              <IconButton 
                icon={recording ? "stop-circle" : "microphone"} 
                iconColor={recording ? "#F44336" : "#2196F3"}
                size={32}
                onPress={recording ? stopRecording : startRecording}
              />
              <Text style={{flex: 1}}>
                {recording ? "Recording... Tap to stop" : (recordingUri ? "Audio saved!" : "Tap to record audio excuse")}
              </Text>
              {recordingUri && !recording && (
                <IconButton icon="delete" iconColor="#F44336" onPress={() => setRecordingUri(null)} />
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExcuseDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSaveExcuse}>Save Excuse</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  card: { marginBottom: 12, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
