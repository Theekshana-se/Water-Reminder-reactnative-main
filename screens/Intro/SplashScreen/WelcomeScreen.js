import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../../../assets/splash/details.jpeg')} // Replace with your actual image path
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.topContainer}>
        <Text style={styles.title}>Welcome to Aqua Alert!</Text>
        <Text style={styles.subtitle}>Helping you reach your hydration goals every day.</Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.buttonText}>CREATE AN ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Adjust transparency as needed
  },
  topContainer: {
    marginTop: 100, // Adjust to push the title and subtitle higher
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 50, // Adjust to position the buttons near the bottom
  },
  button: {
    backgroundColor: '#00bfff',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 5,
    marginBottom: 20,
    width: '80%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    backgroundColor: '#00bfff',
    paddingVertical: 15,
    paddingHorizontal: 110,
    borderRadius: 5,
    marginBottom: 20,
    width: '80%',
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
