import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'; // For handling dates

const bottles = [
  { day: 'Day 1', progress: 0 },
  { day: 'Day 2', progress: 0 },
  { day: 'Day 3', progress: 0 },
  { day: 'Day 4', progress: 0 },
  { day: 'Day 5', progress: 0 },
  { day: 'Day 6', progress: 0 },
  { day: 'Day 7', progress: 0 },
];

const WeeklyProgress = ({ drinkProgress, userId }) => {
  const [weekProgress, setWeekProgress] = useState(bottles);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Helper function to generate user-specific keys
  const getUserKey = (key) => `${userId}_${key}`;

  useEffect(() => {
    // Get start date and calculate end date on first load
    const checkDates = async () => {
      const storedStartDate = await AsyncStorage.getItem(getUserKey('startDate'));
      if (!storedStartDate) {
        const today = moment().format('YYYY-MM-DD');
        await AsyncStorage.setItem(getUserKey('startDate'), today);
        setStartDate(today);
        const nextWeek = moment(today).add(7, 'days').format('YYYY-MM-DD');
        setEndDate(nextWeek);
        await AsyncStorage.setItem(getUserKey('endDate'), nextWeek);
      } else {
        const storedEndDate = await AsyncStorage.getItem(getUserKey('endDate'));
        setStartDate(storedStartDate);
        setEndDate(storedEndDate);
      }
    };
    checkDates();
  }, [userId]);

  useEffect(() => {
    // Update daily progress for each day
    const updateDailyProgress = async () => {
      const todayIndex = moment().diff(startDate, 'days');
      console.log('Today Index:', todayIndex); // Log today's index
      console.log('Current Drink Progress:', drinkProgress); // Log current drink progress

      if (todayIndex < 7) {
        const updatedWeekProgress = [...weekProgress];
        if (drinkProgress >= 100) {
          updatedWeekProgress[todayIndex].progress = 100; // Mark as full when drinkProgress is 100%
          console.log(`Filling bottle for Day ${todayIndex + 1}:`, updatedWeekProgress); // Log filling action
          setWeekProgress(updatedWeekProgress);
          await AsyncStorage.setItem(getUserKey('weekProgress'), JSON.stringify(updatedWeekProgress)); // Save progress
        }
        setWeekProgress(updatedWeekProgress);
        console.log('Updated Week Progress:', updatedWeekProgress); // Log updated progress
      } else {
        // Reset dates and progress if the week is over (7 days have passed)
        const todayFormatted = moment().format('YYYY-MM-DD');
        await AsyncStorage.setItem(getUserKey('startDate'), todayFormatted);
        await AsyncStorage.setItem(getUserKey('endDate'), moment(todayFormatted).add(7, 'days').format('YYYY-MM-DD'));
        setStartDate(todayFormatted);
        setEndDate(moment(todayFormatted).add(7, 'days').format('YYYY-MM-DD'));
        setWeekProgress(bottles); // Reset bottles to empty
        console.log('Week reset. Bottles are now empty.'); // Log reset action
      }

      console.log('User ID:', userId); // Log the user ID for tracking
    };

    updateDailyProgress();
  }, [drinkProgress, startDate]);

  useEffect(() => {
    // Load user's progress when component is first rendered
    const loadUserProgress = async () => {
      const storedWeekProgress = await AsyncStorage.getItem(getUserKey('weekProgress'));
      if (storedWeekProgress) {
        setWeekProgress(JSON.parse(storedWeekProgress));
        console.log('Loaded Week Progress:', JSON.parse(storedWeekProgress)); // Log loaded progress
      }
    };
    loadUserProgress();
  }, [userId]);

  const daysInMonth = moment().daysInMonth(); // Get total days in the current month
  const filledDays = weekProgress.filter(item => item.progress === 100).length; // Count filled days
  const monthProgress = (filledDays / daysInMonth) * 100; // Calculate progress percentage

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
      <Text style={styles.title}></Text>

      {/* Water Bottles */}
      <View style={styles.bottleRow}>
        {weekProgress.map((item, index) => (
          <View key={index} style={styles.bottleContainer}>
            <Image
              source={item.progress === 100
                ? require('../../assets/weeklyarchive/fillwater.png') // Full bottle
                : require('../../assets/weeklyarchive/emptywater.png') // Empty bottle
              }
              style={styles.bottleImage}
            />
            <Text style={styles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>

      {/* 6 Days Challenge Section */}
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeText}>6 days Challenge</Text>
        <View style={styles.dateContainer}>
          <View style={styles.dateBlock}>
          <Text style={styles.dateEmoji}>🗓️</Text>
            <Text>Start Date</Text>
            <Text>{startDate}</Text>
          </View>
          <View style={styles.dateBlock}>
          <Text style={styles.dateEmoji}>🗓️</Text>
            <Text>End Date</Text>
            <Text>{endDate}</Text>
          </View>
        </View>
      </View>

      {/* Monthly Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${monthProgress}%` }]} />
      </View>
      <Text style={styles.progressText}>{monthProgress.toFixed(2)}% Monthly Progress</Text>

      {/* Top Performing Friends */}
      <View style={styles.friendsContainer}>
        <Text style={styles.friendsTitle}>Top performing Friends!</Text>
        <View style={styles.friendRow}>
          <Text style={styles.friendName}>Kevin</Text>
          <View style={styles.progressCircles}>
            <View style={styles.filledCircle} />
            <View style={styles.filledCircle} />
            <View style={styles.filledCircle} />
          </View>
        </View>
        <View style={styles.friendRow}>
          <Text style={styles.friendName}>Carol</Text>
          <View style={styles.progressCircles}>
            <View style={styles.filledCircle} />
            <View style={styles.filledCircle} />
            <View style={styles.emptyCircle} />
          </View>
        </View>
        <View style={styles.friendRow}>
          <Text style={styles.friendName}>Larry</Text>
          <View style={styles.progressCircles}>
            <View style={styles.filledCircle} />
            <View style={styles.emptyCircle} />
            <View style={styles.emptyCircle} />
          </View>
        </View>
      </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  scrollContainer: {
    paddingBottom: 20, // To avoid content being cut off at the bottom
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#00aaff',
  },
  bottleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  bottleContainer: {
    alignItems: 'center',
  },
  bottleImage: {
    width: 50,
    height: 100,
  },
  dayLabel: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  challengeContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dateBlock: {
    alignItems: 'center',
  },
  dateEmoji: {
    fontSize: 50, // Size for the emoji
  },
  friendsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressCircles: {
    flexDirection: 'row',
  },
  filledCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00aaff',
    marginRight: 5,
  },
  emptyCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginRight: 5,
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00aaff',
  },
  progressText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default WeeklyProgress;
