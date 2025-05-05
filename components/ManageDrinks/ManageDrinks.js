import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Animated, Dimensions } from "react-native";
import { ACTIVITY_KEY, WEIGHT_KEY } from "../../constants/storage";
import { calcDailyGoal } from "../../utils/Drinks";
import UIModal from "../UI/UIModal";
import { useNavigation } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import NotificationScreen from '../../screens/NotificationScreen/NotificationScreen'; 
import WeeklyProgress from '../../screens/WeeklyProgress/WeeklyProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { fetchUserWaterConsumption } from '../../lib/appwrite';
import LottieView from 'lottie-react-native'; // Added for celebration animation

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

const ManageDrinks = ({ userId }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [drinkProgress, setDrinkProgress] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedBeverage, setSelectedBeverage] = useState('Coffee');
  const [beverageOptions, setBeverageOptions] = useState(['Coffee', 'Yogurt', 'Tea']);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [isFullAnimationPlaying, setIsFullAnimationPlaying] = useState(false); // Added for animation
  const celebrationAnimation = useRef(null); // Ref for Lottie animation
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

  useEffect(() => {
    const fetchUserDailyGoal = async () => {
      try {
        const accountId = await AsyncStorage.getItem('accountId');
        if (!accountId) {
          console.error('No account ID found in AsyncStorage');
          setDailyGoal(2000);
          return;
        }

        const waterConsumption = await fetchUserWaterConsumption(accountId);
        if (waterConsumption !== null && waterConsumption !== undefined) {
          setDailyGoal(waterConsumption);
        } else {
          const weight = await getItem(WEIGHT_KEY);
          const activity = await getItem(ACTIVITY_KEY);
          const calcDailyIntake = calcDailyGoal(weight, activity) || 2000;
          setDailyGoal(calcDailyIntake);
        }
      } catch (error) {
        console.error('Error fetching daily goal:', error);
        const weight = await getItem(WEIGHT_KEY);
        const activity = await getItem(ACTIVITY_KEY);
        const calcDailyIntake = calcDailyGoal(weight, activity) || 2000;
        setDailyGoal(calcDailyIntake);
      }
    };

    fetchUserDailyGoal();
  }, []);

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

  const resetWaterProgress = () => {
    setDrinkProgress(0);
    setIsFullAnimationPlaying(false); // Reset animation state
  };

  const currentIntake = dailyGoal ? Math.round((drinkProgress / 100) * dailyGoal) : 0;

  return (
    <View style={styles.container}>
      {dailyGoal ? (
        <WaterProgress percentage={drinkProgress} goal={dailyGoal} current={currentIntake} />
      ) : (
        <Text style={styles.loadingText}>Loading daily goal...</Text>
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

      {/* Full-Screen Celebration Animation */}
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  waterProgressContainer: {
    alignItems: 'center',
    marginTop: 30,
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
  percentageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#62C4FF',
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 30,
  },
  fullScreenCelebration: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 10, // Ensure it’s on top of all elements
  },
});

export default ManageDrinks;