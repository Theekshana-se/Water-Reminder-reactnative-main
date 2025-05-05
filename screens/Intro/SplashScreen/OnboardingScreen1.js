import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import { GlobalStyles } from "../../../constants/styles";

const OnboardingScreen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
      <Image source={require('../../../assets/splash/onbording1.png')} style={styles.image} />
      <Text style={styles.title}>Track and Improve Your Hydration Every Day</Text>
      <Text style={styles.description}>Achieve your hydration goals with a simple tap!</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '33%' }]} />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OnboardingScreen2')}>
        <Text style={styles.buttonText}>NEXT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: GlobalStyles.colors.primary400,
    paddingVertical: 10,
    width: "45%",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", // Center content vertically
  },
  buttonText: {
    color: GlobalStyles.colors.white,
    fontWeight: "bold",
    fontSize: 18,
    textTransform: "uppercase",
    textAlign: 'center', // Ensure the text is centered
  },
  progressBar: {
    height: 10,
    width: '80%', // Make sure the width is set
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: '#00bfff',
  },
});

export default OnboardingScreen1;
