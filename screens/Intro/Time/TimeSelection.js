import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar } from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import Button from '../../../components/Buttons/Button';
import { GlobalStyles } from '../../../constants/styles';
import { updateWakeUpTime, updateBedtime } from '../../../lib/appwrite';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMES = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? 'a.m.' : 'p.m.';
    return `${hour}:00 ${period}`;
});

const TimeSelection = () => {
    const [wakeUpTime, setWakeUpTime] = useState('6:00 a.m.');
    const [bedtime, setBedtime] = useState('10:00 p.m.');
    const navigation = useNavigation();
    const route = useRoute();
    const { age, weight, selectedGender, activityLevel, userId } = route.params || {};

    console.log('TimeSelection params:', { age, weight, selectedGender, activityLevel, userId });

    const nextPageHandler = async () => {
        let effectiveUserId = userId;
        if (!effectiveUserId) {
            console.warn('userId missing in route.params, fetching from AsyncStorage');
            effectiveUserId = await AsyncStorage.getItem('accountId');
            if (!effectiveUserId) {
                console.error('No userId found in TimeSelection screen');
                Alert.alert('Error', 'User not logged in. Please log in again.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
                return;
            }
        }

        try {
            console.log('Saving time preferences for userId:', effectiveUserId);
            await updateWakeUpTime(wakeUpTime, effectiveUserId);
            await updateBedtime(bedtime, effectiveUserId);
            await AsyncStorage.setItem('onboardingCompleted', 'true');
            console.log('Onboarding completed, navigating to HomeOverview');
            navigation.navigate('HomeOverview', { userId: effectiveUserId });
        } catch (error) {
            console.error('Failed to save times:', error);
            Alert.alert('Error', 'Failed to save times. Please try again.');
        }
    };

    const goBackHandler = () => {
        navigation.navigate('WaterConsumption', { age, weight, selectedGender, activityLevel, userId });
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
            <Text style={styles.title}>Select your wake up and bedtime</Text>

            <View style={styles.horizontalSection}>
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
        fontWeight: 'bold',
        color: GlobalStyles.colors.primary400,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50,
    },
    horizontalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    timeSection: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    emoji: {
        fontSize: 50,
        marginBottom: 5,
    },
    timeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
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
        marginBottom: 90,
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