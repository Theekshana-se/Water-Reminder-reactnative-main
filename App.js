import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { StatusBar } from 'expo-status-bar';
import Navigation from './navigation/Navigation';


import AsyncStorage from '@react-native-async-storage/async-storage'; // For session persistence
import { View, Text } from 'react-native'; // For handling loading state



console.log('Start');

const trigger = new Date(Date.now() + 60 * 60 * 1000);
trigger.setMinutes(0);
trigger.setSeconds(0);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginSession();
  }, []);

  const checkLoginSession = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession'); // Check session
      if (session) {
        setIsLoggedIn(true); // Session exists, so keep the user logged in
      }
    } catch (error) {
      console.error('Failed to retrieve session:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar translucent style="auto" />
      <Navigation isLoggedIn={isLoggedIn} />
    </Provider>
  );
}
