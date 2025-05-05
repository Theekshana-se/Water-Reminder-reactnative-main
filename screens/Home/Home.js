import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Animated, Dimensions, BackHandler, PanResponder, ActivityIndicator } from "react-native";
import { ACTIVITY_KEY, WEIGHT_KEY } from "../../constants/storage";
import { calcDailyGoal } from "../../utils/Drinks";
import UIModal from "../../components/UI/UIModal";
import { useNavigation } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import NotificationScreen from '../../screens/NotificationScreen/NotificationScreen'; 
import WeeklyProgress from '../../screens/WeeklyProgress/WeeklyProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { fetchUserWaterConsumption, updateUserWaterConsumption, getCurrentUser } from '../../lib/appwrite';
import LottieView from 'lottie-react-native';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const WaterProgress = ({ percentage, goal, current }) => {
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.waterProgressContainer}>
      <Svg width="160" height="160" viewBox="0 0 160 160" style={styles.svg}>
        <Circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#E2F4FF"
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#62C4FF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={styles.progressTextContainer}>
        <LottieView
          source={require('../../assets/water-glass.json')}
          style={styles.waterGlassAnimation}
          autoPlay
          loop
        />
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
      </View>
      <View style={styles.progressDetails}>
        <Text style={styles.progressLabel}>Today's Progress</Text>
        <Text style={styles.progressValue}>
          <Text style={styles.currentValue}>{current} </Text>
          <Text style={styles.goalValue}>/ {goal} ml</Text>
        </Text>
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Home = ({ userId }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [drinkProgress, setDrinkProgress] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedBeverage, setSelectedBeverage] = useState('Coffee');
  const [beverageOptions, setBeverageOptions] = useState(['Coffee', 'Yogurt', 'Tea']);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [baseDailyGoal, setBaseDailyGoal] = useState(null);
  const [isFullAnimationPlaying, setIsFullAnimationPlaying] = useState(false);
  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const celebrationAnimation = useRef(null);
  const navigation = useNavigation();

  const quantities = [
    { id: 1, value: 150, text: "150ml" },
    { id: 2, value: 200, text: "200ml" },
    { id: 3, value: 250, text: "250ml" },
    { id: 4, value: 300, text: "300ml" },
    { id: 5, value: 350, text: "350ml" },
    { id: 6, value: 400, text: "400ml" },
  ];

  const getItem = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return null;
    }
  };

  const fetchWeatherData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log('Location:', latitude, longitude);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;
      console.log('Fetching from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${await response.text()}`);
      }
      const data = await response.json();
      console.log('Weather Response:', data);

      return data.current.temperature_2m;
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
      return null;
    }
  };

  const adjustDailyGoalBasedOnTemperature = (baseGoal, temp) => {
    if (temp === null) return baseGoal;

    const LOW_TEMP_THRESHOLD = 20;
    const HIGH_TEMP_THRESHOLD = 35;
    const ADJUSTMENT_PERCENTAGE = 0.1;

    if (temp < LOW_TEMP_THRESHOLD) {
      return Math.round(baseGoal * (1 - ADJUSTMENT_PERCENTAGE));
    } else if (temp > HIGH_TEMP_THRESHOLD) {
      return Math.round(baseGoal * (1 + ADJUSTMENT_PERCENTAGE));
    } else {
      return baseGoal;
    }
  };

  const setBaseDailyGoalOnRegistration = async (goal) => {
    try {
      await AsyncStorage.setItem('baseDailyGoal', goal.toString());
      console.log('Base daily goal set in AsyncStorage:', goal);
    } catch (error) {
      console.error('Error setting base daily goal:', error);
    }
  };

  useEffect(() => {
    const fetchUserDailyGoal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let accountId = userId || (await AsyncStorage.getItem('accountId'));
        if (!accountId) {
          const user = await getCurrentUser();
          accountId = user.$id;
          await AsyncStorage.setItem('accountId', accountId);
          console.log('Fetched accountId from current user:', accountId);
        }

        if (!accountId) {
          console.error('No account ID found');
          setError('User not logged in. Please log in again.');
          setIsLoading(false);
          navigation.navigate('Login');
          return;
        }

        const waterData = await fetchUserWaterConsumption(accountId);
        let baseGoal = waterData.dailyGoal;
        let currentConsumption = waterData.waterConsumption;

        if (!waterData || !waterData.dailyGoal) {
          const weight = await getItem(WEIGHT_KEY);
          const activity = await getItem(ACTIVITY_KEY);
          baseGoal = calcDailyGoal(weight, activity);
          if (!baseGoal) {
            console.error('Failed to calculate daily goal');
            setError('Please set your daily water goal.');
            setIsLoading(false);
            navigation.navigate('WaterConsumption');
            return;
          }
          await setBaseDailyGoalOnRegistration(baseGoal);
        }

        setBaseDailyGoal(baseGoal);

        const temp = await fetchWeatherData();
        setCurrentTemperature(temp);
        const adjustedGoal = adjustDailyGoalBasedOnTemperature(baseGoal, temp);

        setDailyGoal(adjustedGoal);
        setDrinkProgress((currentConsumption / adjustedGoal) * 100);
        await updateUserWaterConsumption(currentConsumption, adjustedGoal, accountId);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching daily goal:', error);
        setError('Failed to load daily goal. Please try again.');
        setIsLoading(false);
        if (error.message.includes('No user document found') || error.code === 401) {
          navigation.navigate('Login');
        }
      }
    };

    fetchUserDailyGoal();
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => backHandler.remove();
  }, [userId, navigation]);

  useEffect(() => {
    if (drinkProgress >= 100 && !isFullAnimationPlaying) {
      setIsFullAnimationPlaying(true);
      celebrationAnimation.current?.play();
    }
  }, [drinkProgress]);

  const openModalHandler = () => {
    setModalVisible(true);
  };

  const closeModalHandler = () => {
    setModalVisible(false);
  };

  const confirmModalHandler = async (selectedQuantity) => {
    if (selectedQuantity && dailyGoal) {
      setModalVisible(false);
      const newProgress = drinkProgress + (selectedQuantity / dailyGoal) * 100;
      const clampedProgress = Math.min(newProgress, 100);
      setDrinkProgress(clampedProgress);
      const newConsumption = Math.round((clampedProgress / 100) * dailyGoal);
      const accountId = userId || (await AsyncStorage.getItem('accountId'));
      if (accountId) {
        await updateUserWaterConsumption(newConsumption, dailyGoal, accountId);
      } else {
        console.error('No accountId for updating water consumption');
        setError('Failed to update water intake. Please log in again.');
      }
    }
  };

  const selectQuantityHandler = (selectedItem) => {
    setSelectedQuantity(selectedItem);
    confirmModalHandler(selectedItem);
  };

  const addBeverageHandler = () => {
    navigation.navigate('AddBeverageScreen', {
      addBeverage: (newBeverage) => {
        setBeverageOptions((prevBeverages) => {
          if (prevBeverages.length >= 3) {
            return [...prevBeverages.slice(1), newBeverage];
          } else {
            return [...prevBeverages, newBeverage];
          }
        });
      }
    });
  };

  const selectBeverageHandler = (beverage) => {
    setSelectedBeverage(beverage);
    openModalHandler();
  };

  const renderQuantityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.quantityButton}
      onPress={() => selectQuantityHandler(item.value)}
    >
      <Text style={styles.quantityButtonText}>{item.text}</Text>
    </TouchableOpacity>
  );

  const resetWaterProgress = async () => {
    setDrinkProgress(0);
    setIsFullAnimationPlaying(false);
    const accountId = userId || (await AsyncStorage.getItem('accountId'));
    if (accountId) {
      await updateUserWaterConsumption(0, dailyGoal, accountId);
    } else {
      console.error('No accountId for resetting water consumption');
      setError('Failed to reset water intake. Please log in again.');
    }
  };

  const currentIntake = dailyGoal ? Math.round((drinkProgress / 100) * dailyGoal) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.temperatureContainer}>
        <Text style={styles.temperatureText}>
          {currentTemperature !== null ? `Current Temp: ${currentTemperature}°C` : 'Fetching temperature...'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#62C4FF" />
          <Text style={styles.loadingText}>Loading daily goal...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.setGoalButton}
            onPress={() => navigation.navigate('WaterConsumption')}
          >
            <Text style={styles.setGoalButtonText}>Set Daily Goal</Text>
          </TouchableOpacity>
        </View>
      ) : dailyGoal ? (
        <WaterProgress percentage={drinkProgress} goal={dailyGoal} current={currentIntake} />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No daily goal set. Please set your goal.</Text>
          <TouchableOpacity
            style={styles.setGoalButton}
            onPress={() => navigation.navigate('WaterConsumption')}
          >
            <Text style={styles.setGoalButtonText}>Set Daily Goal</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.beveragePrompt}>How much {selectedBeverage.toLowerCase()} do you want to drink?</Text>
      
      <View style={styles.beverageSelection}>
        {beverageOptions.map((beverage, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.beverageButton}
            onPress={() => selectBeverageHandler(beverage)}
          >
            <View style={[styles.beverageIcon, selectedBeverage === beverage && styles.selectedBeverageIcon]}>
              <Text style={styles.beverageEmoji}>
                {beverage === 'Coffee' ? '☕' : beverage === 'Yogurt' ? '🍶' : beverage === 'Milk' ? '🥛' : beverage === 'Tea' ? '🍵' : beverage === 'Orange Juice' ? '🍊' : beverage === 'Red Wine' ? '🍷' : '🥤'}
              </Text>
            </View>
            <Text style={styles.beverageText}>{beverage}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={styles.beverageButton}
          onPress={addBeverageHandler}
        >
          <View style={styles.addBeverageIcon}>
            <Feather name="plus" size={24} color="white" />
          </View>
          <Text style={styles.beverageText}>Add Beverage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quantityContainer}>
        <FlatList
          data={quantities}
          renderItem={renderQuantityItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
      </View>
      
      <TouchableOpacity style={styles.resetButton} onPress={resetWaterProgress}>
        <Feather name="refresh-cw" size={24} color="white" />
      </TouchableOpacity>

      <NotificationScreen drinkProgress={drinkProgress} /> 
      <WeeklyProgress drinkProgress={drinkProgress} userId={userId} /> 

      <UIModal
        isVisible={isModalVisible}
        onSelect={selectQuantityHandler}
        onClose={closeModalHandler}
        onConfirm={confirmModalHandler}
      />

      {isFullAnimationPlaying && (
        <LottieView
          ref={celebrationAnimation}
          source={require('../../assets/celebration/celebration-animation2.json')}
          style={styles.fullScreenCelebration}
          autoPlay
          loop={false}
          onAnimationFinish={() => setIsFullAnimationPlaying(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 2000,
  },
  buttonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00aaff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  temperatureContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  temperatureText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  waterProgressContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlassAnimation: {
    width: 100,
    height: 100,
  },
  percentageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#62C4FF',
    marginTop: 10,
  },
  progressDetails: {
    marginTop: 15,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressValue: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: 'medium',
  },
  currentValue: {
    color: '#62C4FF',
  },
  goalValue: {
    color: '#999',
  },
  beveragePrompt: {
    fontSize: 16,
    color: 'black',
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  beverageSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  beverageButton: {
    alignItems: "center",
  },
  beverageIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBeverageIcon: {
    backgroundColor: '#2196F3',
  },
  beverageEmoji: {
    fontSize: 24,
  },
  addBeverageIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beverageText: {
    fontSize: 14,
    color: 'black',
    marginTop: 5,
  },
  quantityContainer: {
    marginTop: 20,
    width: '90%',
  },
  quantityButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 25,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  quantityButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resetButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 10,
  },
  setGoalButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  setGoalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullScreenCelebration: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 10,
  },
});

export default Home;