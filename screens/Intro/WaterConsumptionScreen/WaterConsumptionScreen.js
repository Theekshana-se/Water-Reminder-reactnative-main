import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateUserWaterConsumption } from '../../../lib/appwrite';
import { GlobalStyles } from '../../../constants/styles';
import Button from '../../../components/Buttons/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WaterConsumptionScreen = ({ userId: propUserId }) => {
    const route = useRoute();
    const navigation = useNavigation();
    const { age, weight, activityLevel, selectedGender } = route.params || {};
    const [waterIntake, setWaterIntake] = useState(0);
    const [error, setError] = useState(null);

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
        console.log('WaterConsumptionScreen params:', { age, weight, activityLevel, selectedGender, propUserId });
        if (!age || !weight || !activityLevel) {
            console.error('Missing params:', { age, weight, activityLevel });
            setError('Missing required profile information.');
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
        let effectiveUserId = propUserId;
        if (!effectiveUserId) {
            console.warn('propUserId missing, fetching from AsyncStorage');
            effectiveUserId = await AsyncStorage.getItem('accountId');
            if (!effectiveUserId) {
                console.error('No userId found in WaterConsumptionScreen');
                setError('User not logged in. Please log in again.');
                navigation.navigate('Login');
                return;
            }
        }

        try {
            console.log('Updating water consumption for userId:', effectiveUserId);
            await updateUserWaterConsumption(0, waterIntake, effectiveUserId);
            console.log('Water consumption saved successfully:', { waterIntake, userId: effectiveUserId });
            navigation.navigate('TimeSelection', { age, weight, selectedGender, activityLevel, userId: effectiveUserId });
        } catch (err) {
            console.error('Failed to save water consumption:', err);
            setError('Failed to save water intake. Please try again.');
        }
    };

    const goBackHandler = () => {
        navigation.navigate('ActivityLevelScreen', { age, weight, selectedGender, userId: propUserId });
    };

    const backgroundImage = require('../../../assets/waterlevelscreen.png');

    return (
        <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
                <Text style={styles.title}>Set Your Daily Water Goal</Text>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <Text style={styles.waterIntakeText}>{waterIntake}ml</Text>
                )}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: 300,
        height: 300,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -140 }, { translateY: -120 }],
        opacity: 0.7,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
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
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
        marginBottom: 20,
    },
});