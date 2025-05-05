import React, { useState } from 'react';
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

  const pageHandler = async (data, pageName) => {
    try {
      console.log('pageHandler called:', { data, pageName, userId });
      if (pageName === 'HomeOverview') {
        // Complete onboarding
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        console.log('Onboarding completed, navigating to HomeOverview');
        navigation.navigate('HomeOverview', { userId });
      } else {
        setPage(pageName);
        if (data) {
          setGender(data);
        }
      }
    } catch (error) {
      console.error('Error in pageHandler:', error);
    }
  };

  return (
    <View style={styles.container}>
      {page === GENDER_SCREEN && <Gender onNextPage={pageHandler} userId={userId} />}
      {page === WEIGHT_SCREEN && (
        <Weight
          onNextPage={pageHandler}
          onPrevPage={pageHandler}
          selectedGender={gender}
          userId={userId}
        />
      )}
      {page === ACTIVITYLEVEL_SCREEN && (
        <ActivityLevel
          onNextPage={pageHandler}
          onPrevPage={pageHandler}
          selectedGender={gender}
          userId={userId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
});

export default Intro;