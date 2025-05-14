import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
  const [errors, setErrors] = useState({
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!email.includes('@')) {
      setErrors((prev) => ({ ...prev, email: 'Email must contain an @ symbol' }));
      return false;
    }
    if (!email.includes('.')) {
      setErrors((prev) => ({ ...prev, email: 'Email must contain a . symbol' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: '' }));
    return true;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number is required' }));
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, phone: '' }));
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'email') {
      validateEmail(value);
    } else if (field === 'phone') {
      // Only allow digits and limit to 10 characters
      const cleanedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: cleanedValue }));
      validatePhone(cleanedValue);
    }
  };

  const handleNext = async () => {
    const isNameValid = formData.name.trim() !== '';
    const isAddressValid = formData.address.trim() !== '';
    const isPhoneValid = validatePhone(formData.phone);
    const isEmailValid = validateEmail(formData.email);

    if (!isNameValid || !isAddressValid || !isPhoneValid || !isEmailValid) {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsLoading(true);
    try {
      navigation.navigate('ShopRegistrationScreen2', {
        shopData: formData,
        isWaterBottleShop,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to proceed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isWaterBottleShop ? 'Register Water Bottle Shop' : 'Register Filling Station'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Shop Name *</Text>
        <TextInput
          style={[styles.input, formData.name === '' && styles.inputError]}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="Enter shop name"
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, formData.address === '' && styles.inputError]}
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
          placeholder="Enter address"
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          placeholder="Enter 10-digit phone number"
          keyboardType="number-pad"
          maxLength={10}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <Text style={styles.label}>Operating Hours</Text>
        <TextInput
          style={styles.input}
          value={formData.hours}
          onChangeText={(text) => handleInputChange('hours', text)}
          placeholder="e.g., Open until 10:30 PM"
        />

        <Text style={styles.label}>License Number</Text>
        <TextInput
          style={styles.input}
          value={formData.license}
          onChangeText={(text) => handleInputChange('license', text)}
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
    </  


View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D4ED8',
    marginLeft: 12,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 12,
  },
  nextButton: {
    backgroundColor: '#1D4ED8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default ShopRegistrationScreen1;