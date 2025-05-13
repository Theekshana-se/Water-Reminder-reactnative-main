import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const ShopRegistrationScreen1 = ({ route }) => {
  const { isWaterBottleShop } = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    license: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  console.log('ShopRegistrationScreen1 params:', { isWaterBottleShop });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (!formData.name || !formData.address || !formData.phone || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    navigation.navigate('ShopRegistrationScreen2', {
      shopData: formData,
      isWaterBottleShop,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A73FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isWaterBottleShop ? 'Register Water Bottle Shop' : 'Register Filling Station'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Shop Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={text => handleInputChange('name', text)}
          placeholder="Enter shop name"
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={text => handleInputChange('address', text)}
          placeholder="Enter address"
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={text => handleInputChange('email', text)}
          placeholder="Enter email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Operating Hours</Text>
        <TextInput
          style={styles.input}
          value={formData.hours}
          onChangeText={text => handleInputChange('hours', text)}
          placeholder="e.g., Open until 10:30 PM"
        />

        <Text style={styles.label}>License Number</Text>
        <TextInput
          style={styles.input}
          value={formData.license}
          onChangeText={text => handleInputChange('license', text)}
          placeholder="e.g., CFA/BW/01/2021-01"
        />

        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A73FF',
    marginLeft: 10,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#0A73FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ShopRegistrationScreen1;