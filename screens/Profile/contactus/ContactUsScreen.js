import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons'; // Social media icons
import LottieView from 'lottie-react-native'; // Lottie for animation
import { useNavigation } from '@react-navigation/native';

const ContactUsScreen = () => {
  const navigation = useNavigation();

  const handleSocialMediaPress = (url) => {
    Linking.openURL(url); // Open the social media links
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

        {/* Animation Placeholder */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../../assets/animation/contactus.json')} // Placeholder for your animation
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

      {/* Content Section */}
      <View style={styles.content}>
            <View style={styles.content}>
        {/* Heading */}
        <Text style={styles.heading}>💧 Stay Hydrated, Stay Healthy! 💧</Text>

        {/* Description */}
        <Text style={styles.description}>
            At <Text style={{ fontWeight: 'bold' }}>Aqua Alert</Text>, we’re more than just an app – we’re your personal hydration buddy, here to keep you refreshed and energized throughout the day! 🌿✨{"\n"}
            Got any questions, suggestions, or simply want to say hi? 😄 We'd love to hear from you! Reach out to us anytime, and let’s stay connected! 🤝👋
        </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>📞 Phone: 077-1234567 / 011-2345678</Text>
          <Text style={styles.contactText}>📧 Email: contact@aquaalert.com</Text>
        </View>

      </View>

      {/* Social Media Icons at the Bottom */}
      <View style={styles.socialMediaContainer}>
        <TouchableOpacity onPress={() => handleSocialMediaPress('https://facebook.com')}>
          <FontAwesome name="facebook" size={30} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSocialMediaPress('https://twitter.com')}>
          <FontAwesome name="twitter" size={30} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSocialMediaPress('https://instagram.com')}>
          <FontAwesome name="instagram" size={30} color="#C13584" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSocialMediaPress('https://linkedin.com')}>
          <FontAwesome name="linkedin" size={30} color="#0077B5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20, // Adjust as needed for your layout
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00aaff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10, // Add padding to center the content better
  },
  description: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24, // Add line height for better readability
    marginBottom: 20,
  },
  heading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00aaff',
    textAlign: 'center', // Center the heading
    marginBottom: 10, // Add some space below the heading
  },
  contactContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  animationContainer: {
    height: 200,
    width: '100%',
    marginBottom: 10,
    marginTop: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 5,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom:50,
  },
});

export default ContactUsScreen;
