import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../../constants/styles';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AddBeverageScreen = ({ route }) => {
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const [hydrationLevel, setHydrationLevel] = useState('');
  const navigation = useNavigation();
  const { addBeverage } = route.params; // Callback to update the beverage list

  const beverageOptions = [
    { name: 'Water', emoji: '💧' },
    { name: 'Tea', emoji: '🍵' },
    { name: 'Orange Juice', emoji: '🍊' },
    { name: 'Red Wine', emoji: '🍷' },
    { name: 'Coffee', emoji: '☕' },
    { name: 'Milk', emoji: '🥛' },
    { name: 'Soda', emoji: '🥤' },
    { name: 'Yogurt', emoji: '🍶' },
  ];

  const handleSave = () => {
    if (selectedBeverage && hydrationLevel) {
      addBeverage(selectedBeverage); // Call the function passed from the main screen
      navigation.goBack(); // Navigate back to the main screen
    } else {
      alert('Please select a beverage and enter the hydration level.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={30} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add your Beverages</Text>
      </View>

      <Text style={styles.subTitle}>Enter Beverage Type</Text>
      <View style={styles.beverageGrid}>
        {beverageOptions.map((beverage, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.beverageItem,
              selectedBeverage === beverage.name && styles.selectedBeverage,
            ]}
            onPress={() => setSelectedBeverage(beverage.name)}
          >
            <Text style={styles.beverageEmoji}>{beverage.emoji}</Text>
            <Text style={styles.beverageText}>{beverage.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subTitle}>Enter Hydration Level</Text>
      <TextInput
        style={styles.input}
        value={hydrationLevel}
        onChangeText={setHydrationLevel}
        placeholder="Enter hydration level"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddBeverageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00aaff',
    marginLeft: 10,
  },
  subTitle: {
    fontSize: 18,
    color: 'black',
    marginTop: 20,
    marginBottom: 10,
  },
  beverageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  beverageItem: {
    width: '22%',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    padding: 5,
  },
  selectedBeverage: {
    borderColor: GlobalStyles.colors.primary300,
  },
  beverageEmoji: {
    fontSize: 24,
  },
  beverageText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: GlobalStyles.colors.primary400,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: GlobalStyles.colors.primary400,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
