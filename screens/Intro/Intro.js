import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Gender from './Gender/Gender';
import Weight from './Weight/Weight';
import ActivityLevel from './ActivityLevel/ActivityLevelScreen';
import { GENDER_SCREEN, WEIGHT_SCREEN, ACTIVITYLEVEL_SCREEN } from '../../constants/screens';

const Intro = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params || {};
    const [page, setPage] = useState(GENDER_SCREEN);
    const [gender, setGender] = useState('');

    useEffect(() => {
        console.log('Intro initialized with userId:', userId, 'page:', page);
        if (!userId) {
            console.warn('userId is missing in Intro, attempting to fetch from AsyncStorage');
            AsyncStorage.getItem('accountId').then((storedUserId) => {
                if (storedUserId) {
                    console.log('Fetched userId from AsyncStorage:', storedUserId);
                } else {
                    console.error('No userId found in Intro or AsyncStorage');
                }
            });
        }
    }, []);

    const pageHandler = async (data, pageName) => {
        try {
            console.log('pageHandler called:', { data, pageName, userId });
            if (pageName === 'HomeOverview') {
                await AsyncStorage.setItem('onboardingCompleted', 'true');
                console.log('Onboarding completed, navigating to HomeOverview');
                navigation.navigate('HomeOverview', { userId });
            } else {
                console.log('Setting page to:', pageName);
                setPage(pageName);
                if (data && data.gender) {
                    setGender(data.gender);
                }
            }
        } catch (error) {
            console.error('Error in pageHandler:', error);
        }
    };

    return (
        <View style={styles.container}>
            {page === GENDER_SCREEN ? (
                <Gender onNextPage={pageHandler} userId={userId} />
            ) : page === WEIGHT_SCREEN ? (
                <Weight
                    onNextPage={pageHandler}
                    onPrevPage={pageHandler}
                    selectedGender={gender}
                    userId={userId}
                />
            ) : page === ACTIVITYLEVEL_SCREEN ? (
                <ActivityLevel
                    onNextPage={pageHandler}
                    onPrevPage={pageHandler}
                    selectedGender={gender}
                    userId={userId}
                />
            ) : (
                <Text style={styles.errorText}>Error: Invalid page state</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default Intro;