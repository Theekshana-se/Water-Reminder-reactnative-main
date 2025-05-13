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
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { createShop } from '../../../lib/appwrite';

const ShopRegistrationScreen2 = ({ route }) => {
  const { shopData, isWaterBottleShop } = route.params;
  const navigation = useNavigation();
  const [coords, setCoords] = useState({
    latitude: 7.85,
    longitude: 80.75,
  });
  const [formData, setFormData] = useState({
    latitude: coords.latitude.toString(),
    longitude: coords.longitude.toString(),
    image: 'https://example.com/default-shop.jpg',
  });
  const [isLoading, setIsLoading] = useState(false);

  console.log('ShopRegistrationScreen2 params:', { shopData, isWaterBottleShop });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoords({ latitude, longitude });
    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }));
  };

  const handleSubmit = async () => {
    const finalShopData = {
      ...shopData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      image: formData.image,
    };

    setIsLoading(true);
    try {
      console.log('Creating shop:', { finalShopData, isWaterBottleShop });
      const newShop = await createShop(finalShopData, isWaterBottleShop);
      ToastAndroid.show('Shop created successfully!', ToastAndroid.SHORT);
      navigation.navigate('LocationMapScreen', { refresh: true });
      //navigation.goBack({ refresh: true });
    } catch (error) {
      console.error('Error creating shop:', error);
      Alert.alert('Error', 'Failed to create shop. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A73FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 4.0,
          longitudeDelta: 2.5,
        }}
        onPress={handleMapPress}
      >
        <Marker coordinate={coords} />
      </MapView>

      <View style={styles.form}>
        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          value={formData.latitude}
          onChangeText={text => handleInputChange('latitude', text)}
          placeholder="Latitude"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          value={formData.longitude}
          onChangeText={text => handleInputChange('longitude', text)}
          placeholder="Longitude"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Creating...' : 'Create Shop'}
          </Text>
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
  map: {
    height: 300,
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

export default ShopRegistrationScreen2;