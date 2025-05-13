import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { updateShop } from '../../../lib/appwrite';

const EditShopScreen = ({ route }) => {
  const { shop } = route.params;
  const navigation = useNavigation();

  console.log('EditShopScreen route params:', route.params);
  console.log('EditShopScreen shop data:', {
    id: shop?.$id,
    name: shop?.name,
    isWaterBottleShop: shop?.isWaterBottleShop,
  });

  // Fallback for isWaterBottleShop
  const isWaterBottleShop = shop?.isWaterBottleShop ?? true;

  if (!shop?.$id) {
    console.error('Invalid shop data in EditShopScreen:', shop);
    Alert.alert('Error', 'Invalid shop data. Please try again.');
    navigation.goBack();
    return null;
  }

  const [formData, setFormData] = useState({
    name: shop.name || '',
    address: shop.address || '',
    phone: shop.phone || '',
    email: shop.email || '',
    hours: shop.hours || '',
    license: shop.license || '',
    latitude: shop.latitude?.toString() || '',
    longitude: shop.longitude?.toString() || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectLocation = () => {
    Alert.alert(
      'Select Location',
      'Enter coordinates manually or integrate a map for selection.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.phone || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const updatedShopData = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      hours: formData.hours,
      license: formData.license,
      latitude: parseFloat(formData.latitude) || shop.latitude,
      longitude: parseFloat(formData.longitude) || shop.longitude,
      image: shop.image,
    };

    setIsLoading(true);
    try {
      console.log('Calling updateShop with:', {
        shopId: shop.$id,
        shopData: updatedShopData,
        isWaterBottleShop,
      });
      await updateShop(shop.$id, updatedShopData, isWaterBottleShop);
      ToastAndroid.show('Shop updated successfully!', ToastAndroid.SHORT);
      navigation.navigate('ShopDetails', {
        shop: { ...shop, ...updatedShopData, isWaterBottleShop },
        refresh: true,
      });
    } catch (error) {
      console.error('Error updating shop:', {
        message: error.message,
        code: error.code,
        shopId: shop.$id,
      });
      if (error.code === 404) {
        Alert.alert('Error', 'Shop not found. It may have been deleted.');
        navigation.navigate('LocationMapScreen', { refresh: true });
      } else {
        Alert.alert('Error', 'Failed to update shop. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A73FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shop</Text>
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

        <Text style={styles.label}>Coordinates</Text>
        <View style={styles.coordinateContainer}>
          <TextInput
            style={[styles.input, styles.coordinateInput]}
            value={formData.latitude}
            onChangeText={text => handleInputChange('latitude', text)}
            placeholder="Latitude"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.coordinateInput]}
            value={formData.longitude}
            onChangeText={text => handleInputChange('longitude', text)}
            placeholder="Longitude"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.mapButton} onPress={handleSelectLocation}>
          <Text style={styles.mapButtonText}>Select Location on Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Updating...' : 'Update Shop'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  coordinateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateInput: {
    flex: 1,
    marginRight: 10,
  },
  mapButton: {
    backgroundColor: '#0A73FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#0A73FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default EditShopScreen;