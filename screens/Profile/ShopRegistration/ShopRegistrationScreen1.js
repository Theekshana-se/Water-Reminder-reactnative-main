import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Storage, Account, ID } from 'appwrite';
import { config, client } from '../../../lib/appwrite';

const ShopRegistrationScreen1 = () => {
  const navigation = useNavigation();
  const storage = new Storage(client);
  const account = new Account(client);

  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [license, setLicense] = useState('');
  const [image, setImage] = useState('');
  const [verificationImage, setVerificationImage] = useState(null);
  const [shopType, setShopType] = useState('waterBottle');
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVerificationImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const user = await checkUserSession();
      if (!user) {
        throw new Error('Please log in to upload images.');
      }
      const response = await storage.createFile(config.storageId, ID.unique(), uri);
      const fileUrl = `${config.endpoint}/storage/buckets/${config.storageId}/files/${response.$id}/view?project=${config.projectId}`;
      return fileUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  };

  const handleNext = async () => {
    if (!shopName || !email || !phoneNumber || !address) {
      Alert.alert('Error', 'Please fill in all required fields (Shop Name, Email, Phone Number, Address).');
      return;
    }

    const user = await checkUserSession();
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to continue.', [
        { text: 'OK', onPress: () => navigation.navigate('ShopRegistrationScreen2') }, // Adjust to your login screen
      ]);
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = image || 'https://example.com/default-shop.jpg';
      if (verificationImage) {
        imageUrl = await uploadImage(verificationImage);
      }
      navigation.navigate('ShopRegistrationScreen2', {
        shopName,
        email,
        phoneNumber,
        address,
        hours,
        license,
        image: imageUrl,
        shopType,
        owner: user.$id, // Pass user ID for relationship (optional)
      });
    } catch (error) {
      Alert.alert('Error', `Failed to process image: ${error.message}`);
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
        <Text style={styles.headerTitle}>Shop Registration (1/2)</Text>
      </View>

      <Text style={styles.subTitle}>Please fill in your shop details</Text>

      <View style={styles.inputContainer}>
        <Text>Shop Name *</Text>
        <TextInput
          style={styles.input}
          value={shopName}
          onChangeText={setShopName}
          placeholder="Water Shop Matara"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="shop@example.com"
          keyboardType="email-address"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="0772811676"
          keyboardType="phone-pad"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Address *</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="No 12, Galle Rd, Matara"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Operating Hours</Text>
        <TextInput
          style={styles.input}
          value={hours}
          onChangeText={setHours}
          placeholder="Open until 10:30 PM"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>License Number</Text>
        <TextInput
          style={styles.input}
          value={license}
          onChangeText={setLicense}
          placeholder="CFA/BW/01/2021-01"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Shop Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          value={image}
          onChangeText={setImage}
          placeholder="https://example.com/shop.jpg"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Select Shop Type</Text>
        <View style={styles.shopTypeContainer}>
          <TouchableOpacity
            style={[styles.shopTypeButton, shopType === 'waterBottle' && styles.activeShopType]}
            onPress={() => setShopType('waterBottle')}
            disabled={isLoading}
          >
            <Text style={styles.shopTypeText}>Water Bottle Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shopTypeButton, shopType === 'fillingStation' && styles.activeShopType]}
            onPress={() => setShopType('fillingStation')}
            disabled={isLoading}
          >
            <Text style={styles.shopTypeText}>Filling Station</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text>Upload Verification Image (optional)</Text>
        <TouchableOpacity style={styles.uploadContainer} onPress={pickImage} disabled={isLoading}>
          {verificationImage ? (
            <Image source={{ uri: verificationImage }} style={styles.uploadIcon} />
          ) : (
            <Image source={require('../../../assets/upload.jpeg')} style={styles.uploadIcon} />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'PROCESSING...' : 'NEXT'}</Text>
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
    marginTop: 5,
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
    opacity: (props) => (props.disabled ? 0.6 : 1),
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ShopRegistrationScreen1;