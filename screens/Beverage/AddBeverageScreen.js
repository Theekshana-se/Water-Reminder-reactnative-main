import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { GlobalStyles } from '../../constants/styles';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AddBeverageScreen = ({ route }) => {
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const navigation = useNavigation();
  const { addBeverage, editBeverage, beverageToEdit, index } = route.params || {};

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

  // Pre-fill form if editing
  useEffect(() => {
    if (beverageToEdit) {
      setSelectedBeverage(beverageToEdit.name);
    }
  }, [beverageToEdit]);

  const handleSave = () => {
    if (selectedBeverage) {
      const selectedOption = beverageOptions.find((b) => b.name === selectedBeverage);
      const beverageData = {
        name: selectedBeverage,
        emoji: selectedOption ? selectedOption.emoji : '🥤',
      };

      if (editBeverage && beverageToEdit) {
        editBeverage(beverageData, index);
      } else {
        addBeverage(beverageData);
      }
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Please select a beverage.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subTitle}>Select Beverage Type</Text>
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

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{beverageToEdit ? 'UPDATE' : 'SAVE'}</Text>
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