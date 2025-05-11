import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { appwrite } from '../../lib/appwrite';

const IntakeLogger = ({ userId, onLog }) => {
  const [amount, setAmount] = useState(250);

  const logIntake = async () => {
    try {
      await appwrite.database.createDocument('intakeLogs', 'unique()', {
        userId,
        amount,
        fluidType: 'water',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      });
      onLog();
    } catch (error) {
      console.error('Error logging intake:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Log Water Intake</Text>
      <View style={styles.buttons}>
        {[100, 250, 500].map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.button, amount === size && styles.selectedButton]}
            onPress={() => setAmount(size)}
          >
            <Text style={styles.buttonText}>{size} ml</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logButton} onPress={logIntake}>
        <Text style={styles.logButtonText}>Log Intake</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { backgroundColor: '#ddd', padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5 },
  selectedButton: { backgroundColor: '#007AFF' },
  buttonText: { textAlign: 'center', color: '#000' },
  logButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginTop: 10 },
  logButtonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});

export default IntakeLogger;