import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { Account } from 'appwrite';
import { createShop, client } from '../../../lib/appwrite';

const ShopRegistrationScreen2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const account = new Account(client);
  const { shopName, email, phoneNumber, address, hours, license, image, shopType, owner } = route.params;

  const [location, setLocation] = useState({
    latitude: 7.8731, // Default centered on Sri Lanka
    longitude: 80.7718,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkUserSession = async () => {
    try {
      const session = await account.get();
      console.log('User session:', session);
      return session;
    } catch (error) {
      console.error('No active session:', error);
      return null;
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  const handleSubmit = async () => {
    if (isNaN(location.latitude) || isNaN(location.longitude)) {
      Alert.alert('Error', 'Please select a valid location on the map.');
      return;
    }

    const user = await checkUserSession();
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to register a shop.', [
        { text: 'OK', onPress: () => navigation.navigate('LoginScreen') }, // Adjust to your login screen
      ]);
      return;
    }

    const shopData = {
      name: shopName,
      latitude: location.latitude,
      longitude: location.longitude,
      address,
      phone: phoneNumber,
      hours,
      license,
      image,
      email,
      owner, // Include owner for relationship (optional)
    };

    setIsLoading(true);
    try {
      console.log('Submitting shop data:', shopData);
      await createShop(shopData, shopType === 'waterBottle');
      Alert.alert('Success', 'Shop registered successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('LocationMapScreen') },
      ]);
    } catch (error) {
      console.error('Submission error:', {
        message: error.message,
        code: error.code,
        response: error.response,
      });
      let errorMessage = error.message || 'Unknown error';
      if (error.message.includes('not authorized')) {
        errorMessage = 'You do not have permission to register a shop. Please check your account permissions or contact support.';
      }
      Alert.alert('Error', `Failed to register shop: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
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

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'SUBMITTING...' : 'SUBMIT'}</Text>
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
    height: 400,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#00aaff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    opacity: (props) => (props.disabled ? 0.6 : 1),
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ShopRegistrationScreen2;