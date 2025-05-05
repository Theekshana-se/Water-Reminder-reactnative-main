import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { updateShop } from '../../../lib/appwrite';

const EditShopScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { shop, isWaterBottle } = route.params;

  const [shopName, setShopName] = useState(shop.name);
  const [address, setAddress] = useState(shop.address);
  const [phone, setPhone] = useState(shop.phone);
  const [hours, setHours] = useState(shop.hours);
  const [license, setLicense] = useState(shop.license);
  const [image, setImage] = useState(shop.image);
  const [location, setLocation] = useState({
    latitude: shop.latitude,
    longitude: shop.longitude,
  });

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  const handleSave = async () => {
    const updatedShopData = {
      name: shopName,
      latitude: location.latitude,
      longitude: location.longitude,
      address,
      phone,
      hours,
      license,
      image,
    };

    try {
      await updateShop(shop.$id, updatedShopData, isWaterBottle);
      Alert.alert('Success', 'Shop updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update shop.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shop</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text>Shop Name</Text>
        <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />
      </View>

      <View style={styles.inputContainer}>
        <Text>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />
      </View>

      <View style={styles.inputContainer}>
        <Text>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </View>

      <View style={styles.inputContainer}>
        <Text>Operating Hours</Text>
        <TextInput style={styles.input} value={hours} onChangeText={setHours} />
      </View>

      <View style={styles.inputContainer}>
        <Text>License Number</Text>
        <TextInput style={styles.input} value={license} onChangeText={setLicense} />
      </View>

      <View style={styles.inputContainer}>
        <Text>Shop Image URL</Text>
        <TextInput style={styles.input} value={image} onChangeText={setImage} />
      </View>

      <View style={styles.inputContainer}>
        <Text>Shop Location</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: shop.latitude,
            longitude: shop.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={location} draggable onDragEnd={handleMapPress} />
        </MapView>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>SAVE</Text>
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
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  map: {
    height: 200,
    marginTop: 5,
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

export default EditShopScreen;