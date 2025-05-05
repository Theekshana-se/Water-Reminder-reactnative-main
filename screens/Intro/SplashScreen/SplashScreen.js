import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const blueCircleScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  const startNextAnimation = () => {
    // Animate the blue circle to fill the screen
    Animated.timing(blueCircleScale, {
      toValue: Math.max(width, height) * 2, // Large enough to cover the screen
      duration: 1000,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      // Fade in the logo and text after the circle fills the screen
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        // Hold the splash screen for 3 seconds
        const timer = setTimeout(() => {
          navigation.replace('OnboardingScreen1'); // Navigate after 3 seconds
        }, 3000);

        return () => clearTimeout(timer);
      });
    });
  };

  return (
    <View style={styles.container}>
      {/* Lottie animation */}
      <LottieView
        ref={animationRef}
        source={require('../../../assets/splash/wateranimation.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        onAnimationFinish={startNextAnimation}
      />
      
      {/* Blue circle animation */}
      <Animated.View 
        style={[
          styles.blueCircle,
          {
            transform: [{ scale: blueCircleScale }],
          }
        ]}
      />

      {/* Content with fading in effect */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Image
          source={require('../../../assets/splash/logo1.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Aqua Alert</Text>
        <Text style={styles.subtitle}>Your Daily Hydration Buddy</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  animation: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  blueCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00bfff',
  },
  contentContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
  },
});

export default SplashScreen;
