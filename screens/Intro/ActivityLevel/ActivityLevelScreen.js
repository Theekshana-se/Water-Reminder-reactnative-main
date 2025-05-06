import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlobalStyles } from "../../../constants/styles";
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../../components/Buttons/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const activityLevels = [
    'Sedentary',
    'Light Active',
    'Moderate Active',
    'Very Active',
    'Extra Active'
];

const ActivityLevelScreen = () => {
    const [selectedLevel, setSelectedLevel] = useState(0);
    const navigation = useNavigation();
    const route = useRoute();
    const { age, weight, selectedGender, userId } = route.params || {};

    console.log('ActivityLevelScreen params:', { age, weight, selectedGender, userId });

    const continueHandler = async () => {
        let effectiveUserId = userId;
        if (!effectiveUserId) {
            console.warn('userId is missing in route.params, attempting to fetch from AsyncStorage');
            effectiveUserId = await AsyncStorage.getItem('accountId');
            if (!effectiveUserId) {
                console.error('userId is missing in ActivityLevelScreen and AsyncStorage');
                return;
            }
        }
        console.log('Navigating to WaterConsumption with userId:', effectiveUserId);
        navigation.navigate('WaterConsumptionScreen', { age, weight, selectedGender, activityLevel: activityLevels[selectedLevel], userId: effectiveUserId });
    };

    const goBackHandler = () => {
        navigation.navigate('Age', { weight, selectedGender, userId });
    };

    const backgroundImage = require("../../../assets/splash.png");

    return (
        <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
                <Text style={styles.title}>Activity Level</Text>
                <Text style={styles.subtitle}>
                    Your activity level affects your water intake. Whether you're an athlete or have a more relaxed lifestyle, we've got you covered.
                </Text>
                <View style={styles.optionsWrapper}>
                    {activityLevels.map((level, index) => (
                        <TouchableOpacity
                            key={level}
                            style={styles.optionContainer}
                            onPress={() => setSelectedLevel(index)}
                        >
                            <View style={[styles.radio, selectedLevel === index && styles.radioSelected]} />
                            <Text style={styles.optionText}>{level}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    <Button buttonStyles={styles.button} onPress={goBackHandler}>
                        <Icon name="chevron-back-outline" size={24} color={GlobalStyles.colors.white} />
                    </Button>

                    <Button buttonStyles={styles.button} onPress={continueHandler}>
                        <Text style={styles.buttonText}>NEXT</Text>
                    </Button>
                </View>
            </View>
        </ImageBackground>
    );
};

export default ActivityLevelScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    opacity: 0.1, // Reduce opacity of the background image
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
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 30,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 20
  },
  radio: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GlobalStyles.colors.primary400,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: GlobalStyles.colors.primary400,
  },
  optionText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    marginTop: 40,
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
});