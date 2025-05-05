import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateUserWaterConsumption } from '../../../lib/appwrite';
import { GlobalStyles } from "../../../constants/styles";
import Button from '../../../components/Buttons/Button';
import Icon from 'react-native-vector-icons/Ionicons';

const WaterConsumptionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { age, weight, activityLevel, userId } = route.params || {};
  const [waterIntake, setWaterIntake] = useState(0);

  const activityModifiers = {
    Sedentary: 0,
    'Light Active': 0.1,
    'Moderate Active': 0.2,
    'Very Active': 0.3,
    'Extra Active': 0.4,
  };

  const getAgeModifier = (age) => {
    if (age >= 18 && age <= 30) {
      return 0;
    } else if (age >= 31 && age <= 55) {
      return 0.1;
    } else {
      return 0.2;
    }
  };

  useEffect(() => {
    if (!age || !weight || !activityLevel) {
      console.error('Missing params:', { age, weight, activityLevel });
      return;
    }
    const baseIntake = weight * 35;
    const ageModifier = getAgeModifier(age);
    const activityModifier = activityModifiers[activityLevel];

    const finalIntake = baseIntake * (1 - ageModifier) * (1 + activityModifier);
    const roundedIntake = Math.round(finalIntake);
    setWaterIntake(roundedIntake);
    console.log('Calculated water intake:', roundedIntake);
  }, [age, weight, activityLevel]);

  const continueHandler = async () => {
    if (!userId) {
      console.error('Missing userId for water consumption update');
      return;
    }
    try {
      await updateUserWaterConsumption(0, waterIntake, userId);
      console.log('Water consumption saved successfully:', { waterIntake, userId });
      navigation.navigate('TimeSelection', { userId });
    } catch (error) {
      console.error('Failed to save water consumption:', error);
    }
  };

  const goBackHandler = () => {
    navigation.goBack();
  };

  const backgroundImage = require("../../../assets/waterlevelscreen.png");

  return (
    <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
        <Text style={styles.title}>Set Your Daily Water Goal</Text>

        <Text style={styles.waterIntakeText}>{waterIntake}ml</Text>
        
        <View style={styles.buttonContainer}>
          <Button buttonStyles={styles.button} onPress={goBackHandler}>
            <Icon name="chevron-back-outline" size={24} color={GlobalStyles.colors.white} />
          </Button>

          <Button buttonStyles={styles.button} onPress={continueHandler}>
            <Text style={styles.buttonText}>Next</Text>
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

export default WaterConsumptionScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width: 300,
    height: 300,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -140 }, { translateY: -120 }],
    opacity: 0.7,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: GlobalStyles.colors.primary400,
    marginBottom: 20,
    textAlign: 'center',
  },
  waterIntakeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    marginTop: 350,
    backgroundColor: GlobalStyles.colors.primary400,
    paddingVertical: 10,
    width: "45%",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: GlobalStyles.colors.white,
    fontWeight: "bold",
    fontSize: 18,
    textTransform: "uppercase",
    textAlign: 'center',
  },
});