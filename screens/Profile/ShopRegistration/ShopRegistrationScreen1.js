import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ShopRegistrationScreen1 = () => {
  const navigation = useNavigation();

  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [license, setLicense] = useState('');
  const [image, setImage] = useState('');
  const [verificationImage, setVerificationImage] = useState(null);
  const [shopType, setShopType] = useState('waterBottle'); // Default to water bottle shop

  const handleNext = () => {
    navigation.navigate('ShopRegistrationScreen2', {
      shopName,
      email,
      phoneNumber,
      address,
      hours,
      license,
      image: image || 'https://example.com/default-shop.jpg', // Default image if none provided
      shopType,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Registration (1/2)</Text>
      </View>

      <Text style={styles.subTitle}>Please fill in your shop details</Text>

      <View style={styles.inputContainer}>
        <Text>Shop Name</Text>
        <TextInput
          style={styles.input}
          value={shopName}
          onChangeText={setShopName}
          placeholder="Water Shop Matara"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="shop@example.com"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="0772811676"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="No 12, Galle Rd, Matara"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Operating Hours</Text>
        <TextInput
          style={styles.input}
          value={hours}
          onChangeText={setHours}
          placeholder="Open until 10:30 PM"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>License Number</Text>
        <TextInput
          style={styles.input}
          value={license}
          onChangeText={setLicense}
          placeholder="CFA/BW/01/2021-01"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Shop Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          value={image}
          onChangeText={setImage}
          placeholder="https://example.com/shop.jpg"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Select Shop Type</Text>
        <View style={styles.shopTypeContainer}>
          <TouchableOpacity
            style={[styles.shopTypeButton, shopType === 'waterBottle' && styles.activeShopType]}
            onPress={() => setShopType('waterBottle')}
          >
            <Text style={styles.shopTypeText}>Water Bottle Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shopTypeButton, shopType === 'fillingStation' && styles.activeShopType]}
            onPress={() => setShopType('fillingStation')}
          >
            <Text style={styles.shopTypeText}>Filling Station</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text>Upload Verification</Text>
        <TouchableOpacity style={styles.uploadContainer}>
          <Image source={require('../../../assets/upload.jpeg')} style={styles.uploadIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>NEXT</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  shopTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  shopTypeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeShopType: {
    backgroundColor: '#00aaff',
    borderColor: '#00aaff',
  },
  shopTypeText: {
    color: '#000',
  },
  uploadContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  uploadIcon: {
    width: 50,
    height: 50,
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

export default ShopRegistrationScreen1;