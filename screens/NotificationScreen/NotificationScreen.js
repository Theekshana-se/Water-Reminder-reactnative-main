import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,TouchableOpacity, Alert, Switch, Image } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { fetchUserWakeUpTime, fetchUserBedtime } from '../../lib/appwrite';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Array of messages to send as notifications
const messages = [
  "It's time to drink water! 💧",
  "Stay hydrated! Grab a glass of water.",
  "Don't forget to drink water! 🌊",
  "Water is life! Take a sip now.",
  "Feeling thirsty? Drink some water! 💦",
];

// Randomly select a message from the messages array
const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

const NotificationScreen = ({ drinkProgress }) => {
  const [wakeUpTime, setWakeUpTime] = useState('Loading...');
  const [bedtime, setBedtime] = useState('Loading...');
  const [interval, setInterval] = useState(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isWaterProgressNotificationEnabled, setIsWaterProgressNotificationEnabled] = useState(false);
  const [hasTriggeredWaterNotification, setHasTriggeredWaterNotification] = useState(false); // Track if water progress notification has been sent

  useEffect(() => {
    const loadTimes = async () => {
      try {
        const fetchedWakeUpTime = await fetchUserWakeUpTime();
        const fetchedBedtime = await fetchUserBedtime();
        setWakeUpTime(fetchedWakeUpTime);
        setBedtime(fetchedBedtime);
      } catch (error) {
        console.error('Failed to fetch times:', error);
      }
    };

    loadTimes();

  }, []);

  // Request notification permissions on mount
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to send notifications.');
        return false;
      }

      return true;
    };

    requestNotificationPermissions();
  }, []);



  // Handle enabling/disabling notifications for water progress
  const toggleWaterProgressNotification = () => {
    setIsWaterProgressNotificationEnabled((previousState) => {
      const newState = !previousState;
      console.log('Toggling Water Progress Notifications:', newState);
      return newState;
    });
  };
  

  const handleWaterProgressNotification = () => {
    console.log(`Current drinkProgress: ${drinkProgress}`);
    console.log(`Water Progress Notifications Enabled: ${isWaterProgressNotificationEnabled}`);
  
    // Trigger the water progress notification only if the toggle is enabled (true) and drinkProgress >= 60
    if ( drinkProgress >= 70 && !hasTriggeredWaterNotification) {
      console.log('Triggering water progress notification');
      sendWaterProgressNotification();
      setHasTriggeredWaterNotification(true); // Prevent multiple notifications for the same threshold
    } 
    
    // Reset the notification trigger if the progress goes below 60 or toggle is disabled
    else if (drinkProgress < 70 || !isWaterProgressNotificationEnabled) {
      setHasTriggeredWaterNotification(false); // Reset if progress drops below 60 or notifications are disabled
    }
  };

  useEffect(() => {
    handleWaterProgressNotification();
  }, [drinkProgress, isWaterProgressNotificationEnabled]);

  const sendWaterProgressNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Water Progress Alert 🚰',
        body: `You have reached ${drinkProgress}% of your water goal!`,
        sound: true,
      },
      trigger: { seconds: 2 }, // Send notification immediately
    });
    console.log('Water progress notification sent');
  };

  // Cancel existing notifications before scheduling new ones
  const cancelExistingNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Schedule notification based on selected interval
  const scheduleNotification = async (interval) => {
    // Schedule notification only if notifications are enabled
    if (isNotificationEnabled) {
      await cancelExistingNotifications(); // Cancel any existing notifications

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Drink Water Reminder 💧',
          body: getRandomMessage(), // Pick a random message
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH, // High priority for Android devices
          android: {
            visibility: Notifications.AndroidNotificationVisibility.PUBLIC, // Show on lock screen
          },
        },
        trigger: {
          seconds: interval * 60, // Convert interval to seconds
          repeats: true, // Repeat this notification at the specified interval
        },
      });
      Alert.alert('Notification scheduled', `Every ${interval} minutes`);
    } else {
      // If notifications are disabled, cancel all notifications
      await cancelExistingNotifications();
    }
  };

  // Handle enabling/disabling notifications
  const toggleNotification = async () => {
    setIsNotificationEnabled((previousState) => !previousState);

    if (!isNotificationEnabled) {
      Alert.alert('Notifications Enabled', 'You will receive notifications at the selected interval.');
    } else {
      await cancelExistingNotifications(); // Cancel any scheduled notifications
      Alert.alert('Notifications Disabled', 'Notifications have been turned off.');
    }
  };

  // Handle selecting a notification interval
  const handleIntervalSelect = (selectedInterval) => {
    setInterval(selectedInterval);
    scheduleNotification(selectedInterval);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}></Text>

      <View style={styles.timeContainer}>
        <View style={styles.timeBlock}>
        <Image source={require('../../assets/reminder/sun.png')} style={styles.timeIcon} />
          <Text style={styles.timeLabel}>From</Text>
          <Text style={styles.timeValue}>{wakeUpTime}</Text>
        </View>
        <View style={styles.timeBlock}>
        <Image source={require('../../assets/reminder/moon.png')} style={styles.timeIcon} />
          <Text style={styles.timeLabel}>To</Text>
          <Text style={styles.timeValue}>{bedtime}</Text>
        </View>
      </View>

      <Text style={styles.subheading}>Notification Interval</Text>
      <View style={styles.intervalContainer}>
        {[30, 45, 60, 90, 120, 180, 240, 300, 2, 0.5].map((intervalOption) => (
          <TouchableOpacity
            key={intervalOption}
            style={[styles.intervalButton, interval === intervalOption ? styles.intervalSelected : {}]}
            onPress={() => handleIntervalSelect(intervalOption)}
          >
            <Text style={styles.intervalButtonText}>{intervalOption < 60 ? `${intervalOption} minutes` : `${intervalOption / 60} hours`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.toggleContainer}>
        <Text>Enable Notifications</Text>
        <Switch value={isNotificationEnabled} onValueChange={toggleNotification} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#999',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  intervalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20, // Adjust for spacing
  },
  intervalButton: {
    backgroundColor: '#00aaff',
    borderRadius: 30, // More rounded to match the image
    paddingVertical: 10,
    paddingHorizontal: 25,
    margin: 8, // Adjust margin for proper spacing
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  intervalSelected: {
    backgroundColor: '#99ccff', // Lighter version of blue when selected
  },
  intervalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  timeIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
});

export default NotificationScreen;
