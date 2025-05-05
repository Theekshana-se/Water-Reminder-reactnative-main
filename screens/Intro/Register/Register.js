import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { createUser } from '../../../lib/appwrite'; // Adjust path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for managing state
import LottieView from 'lottie-react-native'; 

const Registration = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleRegistration = async () => {
    try {
      const response = await createUser(email, password, username);
      console.log('User created successfully:', response);
      Alert.alert('Success', 'User registered successfully');
    
      // Do NOT set the onboarding flag yet
      // Navigate to Intro screens for onboarding
      navigation.navigate('Intro');
      
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Unable to create account. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />

      {/* Title Section */}
      <Text style={styles.title}>Create your Account</Text>

      {/* Lottie Animation */}
      <LottieView
        source={require('../../../assets/animation/register.json')} // Add your Lottie animation file here
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegistration}>
        <Text style={styles.buttonText}>CREATE AN ACCOUNT</Text>
      </TouchableOpacity>

      {/* Already have an account */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7', // Light background for modern look
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00aaff', // Primary color for title
    marginBottom: 20,
  },
  animation: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  button: {
    backgroundColor: '#00aaff', // Modern blue button
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    marginTop: 20,
    color: '#00aaff', // Link color
    fontSize: 16,
  },
});

export default Registration;