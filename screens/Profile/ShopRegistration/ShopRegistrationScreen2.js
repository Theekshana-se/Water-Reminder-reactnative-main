import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { createShop } from '../../../lib/appwrite';

const ShopRegistrationScreen2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { shopName, email, phoneNumber, address, hours, license, image, shopType } = route.params;

  const [location, setLocation] = useState({
    latitude: 7.8731, // Default centered on Sri Lanka
    longitude: 80.7718,
  });

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  const handleSubmit = async () => {
    const shopData = {
      name: shopName,
      latitude: location.latitude,
      longitude: location.longitude,
      address,
      phone: phoneNumber,
      hours,
      license,
      image,
      email, // Ensure email is passed from Screen 1
    };

    try {
      console.log('Submitting shop data:', shopData); // Log before submission
      await createShop(shopData, shopType === 'waterBottle');
      Alert.alert('Success', 'Shop registered successfully!');
      navigation.navigate('LocationMapScreen');
    } catch (error) {
      console.error('Submission failed:', error.message); // Log specific error
      console.error('Full error:', error); // Log full error details
      Alert.alert('Error', `Failed to register shop: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Registration (2/2)</Text>
      </View>

      <Text style={styles.subTitle}>Select your shop location</Text>

      <View style={styles.inputContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 7.8731,
            longitude: 80.7718,
            latitudeDelta: 2.0,
            longitudeDelta: 2.0,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={location} draggable onDragEnd={handleMapPress} />
        </MapView>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>SUBMIT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00aaff',
    marginLeft: 10,
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  map: {
    height: 400, // Larger map for better usability
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#00aaff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ShopRegistrationScreen2;