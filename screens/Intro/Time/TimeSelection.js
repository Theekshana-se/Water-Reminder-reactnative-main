import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar } from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import Button from '../../../components/Buttons/Button';
import { GlobalStyles } from '../../../constants/styles';
import { updateWakeUpTime, updateBedtime } from '../../../lib/appwrite';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMES = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const period = i < 12 ? 'a.m.' : 'p.m.';
  return `${hour}:00 ${period}`;
});

const TimeSelection = ({ selectedGender }) => {
  const [wakeUpTime, setWakeUpTime] = useState('6:00 a.m.');
  const [bedtime, setBedtime] = useState('10:00 p.m.');
  const navigation = useNavigation(); 

  const nextPageHandler = async () => {
    try {
      await updateWakeUpTime(wakeUpTime); 
      await updateBedtime(bedtime); 
      //Alert.alert('Success', 'Times saved successfully!');
      
      // Call completeOnboarding to store the onboarding completion status
      completeOnboarding();
      
    } catch (error) {
      console.error('Failed to save times:', error);
      Alert.alert('Error', 'Failed to save times. Please try again.');
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Navigate to Home after completing onboarding
      navigation.navigate('HomeOverview');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const goBackHandler = () => {
    navigation.goBack();
  };

  const wakeUpTimeChangeHandler = ({ item }) => {
    setWakeUpTime(item.value);
  };

  const bedtimeChangeHandler = ({ item }) => {
    setBedtime(item.value);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
      <Text style={styles.title}>Select your wake up and bedtime </Text>

      {/* Horizontal layout for Wake-up Time and Bedtime */}
      <View style={styles.horizontalSection}>
        {/* Wake-up Time Section */}
        <View style={styles.timeSection}>
          <Text style={[styles.emoji, { color: '#FFD700' }]}>🌅</Text>
          <Text style={styles.timeTitle}>WakeUpTime</Text>
          <WheelPickerExpo
            backgroundColor="#F2F2F2"
            height={180}
            width={60}
            renderItem={(props) => (
              <View>
                <Text style={styles.text}>{props.label}</Text>
              </View>
            )}
            initialSelectedIndex={6}
            onChange={wakeUpTimeChangeHandler}
            items={TIMES.map((value) => ({ label: value, value: value }))}
          />
        </View>

        {/* Bedtime Section */}
        <View style={styles.timeSection}>
          <Text style={[styles.emoji, { color: '#1E90FF' }]}>🌙</Text>
          <Text style={styles.timeTitle}>BedTime</Text>
          <WheelPickerExpo
            backgroundColor="#F2F2F2"
            height={180}
            width={60}
            renderItem={(props) => (
              <View>
                <Text style={styles.text}>{props.label}</Text>
              </View>
            )}
            initialSelectedIndex={16}
            onChange={bedtimeChangeHandler}
            items={TIMES.map((value) => ({ label: value, value: value }))}
          />
        </View>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <Button
          buttonStyles={styles.button}
          icon="chevron-back-outline"
          size={24}
          color={GlobalStyles.colors.white}
          onPress={goBackHandler}
        />
        <Button buttonStyles={styles.button} onPress={nextPageHandler}>
          <Text style={styles.buttonText}>Next</Text>
        </Button>
      </View>
    </View>
  );
};

export default TimeSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: GlobalStyles.colors.primary400,
    textAlign: 'center',
    marginTop:50,
    marginBottom: 50,  // Reduced space between title and time section
  },
  horizontalSection: {
    flexDirection: 'row', // Align the time sections horizontally
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  timeSection: {
    alignItems: 'center',
    flex: 1, // Equal width for both sections
    marginHorizontal: 10, // Add some horizontal space between sections
  },
  emoji: {
    fontSize: 50, // Larger font size for emojis
    marginBottom: 5, // Reduce the space between emoji and time title
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5, // Reduce space between title and picker
    color: GlobalStyles.colors.primary400,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GlobalStyles.colors.primary400,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 'auto',
    marginBottom: 90,  // Adjusted bottom margin for better positioning
  },
  button: {
    backgroundColor: GlobalStyles.colors.primary400,
    marginTop: 10,
    paddingVertical: 10,
    width: '45%',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: GlobalStyles.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
  },
});