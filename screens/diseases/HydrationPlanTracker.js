import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { getCurrentUser, fetchDiseasePlans, selectDiseasePlan, fetchUserDiseasePlan, logWaterIntake, fetchWaterIntakeLogs, fetchUserWakeUpTime, fetchUserBedtime } from '../../lib/appwrite';

const HydrationPlanTracker = () => {
  const navigation = useNavigation();
  const [accountId, setAccountId] = useState(null);
  const [diseasePlans, setDiseasePlans] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [waterIntake, setWaterIntake] = useState('');
  const [todayIntake, setTodayIntake] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [wakeUpTime, setWakeUpTime] = useState(null);
  const [bedtime, setBedtime] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        console.log('[HydrationPlanTracker] Fetched accountId:', user.$id);
        setAccountId(user.$id);

        const wakeUp = await fetchUserWakeUpTime();
        const bed = await fetchUserBedtime();
        setWakeUpTime(wakeUp || '08:00');
        setBedtime(bed || '22:00');

        const plans = await fetchDiseasePlans();
        setDiseasePlans(plans);

        const plan = await fetchUserDiseasePlan(user.$id);
        setUserPlan(plan);

        if (plan.usesDiseasePlan) {
          await fetchTodayIntake(user.$id);
          generateSchedule(plan, wakeUp || '08:00', bed || '22:00');
        }
      } catch (error) {
        console.error('[HydrationPlanTracker] Initialization error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
      }
    };
    init();

    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const fetchTodayIntake = async (userId) => {
    try {
      console.log('[fetchTodayIntake] Fetching intake for userId:', userId);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const logs = await fetchWaterIntakeLogs(
        userId,
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      const total = logs.reduce((sum, log) => sum + parseFloat(log.amount), 0);
      setTodayIntake(total);
    } catch (error) {
      console.error('[fetchTodayIntake] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  const validateTimeFormat = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const generateSchedule = (plan, wakeUp, bed) => {
    if (!plan.schedule) {
      console.log('[generateSchedule] No schedule provided in plan');
      return;
    }

    if (!validateTimeFormat(wakeUp)) {
      console.error('[generateSchedule] Invalid wakeUp time:', wakeUp);
      wakeUp = '08:00';
    }
    if (!validateTimeFormat(bed)) {
      console.error('[generateSchedule] Invalid bed time:', bed);
      bed = '22:00';
    }

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const wakeUpDate = new Date(`${dateString}T${wakeUp}:00`);
    const bedDate = new Date(`${dateString}T${bed}:00`);

    if (isNaN(wakeUpDate.getTime())) {
      console.error('[generateSchedule] Invalid wakeUpDate:', wakeUp);
      return;
    }
    if (isNaN(bedDate.getTime())) {
      console.error('[generateSchedule] Invalid bedDate:', bed);
      return;
    }

    if (bedDate <= wakeUpDate) {
      bedDate.setDate(bedDate.getDate() + 1);
    }

    const totalMinutes = (bedDate - wakeUpDate) / 1000 / 60;
    if (totalMinutes <= 0) {
      console.error('[generateSchedule] Invalid time range: totalMinutes <= 0');
      return;
    }

    const intervalMinutes = totalMinutes / plan.schedule.intervals;
    const schedule = [];
    for (let i = 0; i < plan.schedule.intervals; i++) {
      const time = new Date(wakeUpDate.getTime() + intervalMinutes * i * 60 * 1000);
      if (isNaN(time.getTime())) {
        console.error('[generateSchedule] Invalid schedule time at index:', i);
        continue;
      }
      schedule.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: plan.schedule.amountPerInterval,
      });
    }

    console.log('[generateSchedule] Generated schedule:', schedule);
    setSchedule(schedule);
  };

  const handleSelectDisease = async (diseaseName) => {
    try {
      console.log('[handleSelectDisease] Selecting disease:', diseaseName, 'for accountId:', accountId);
      await selectDiseasePlan(accountId, diseaseName);
      const plan = await fetchUserDiseasePlan(accountId);
      setUserPlan(plan);
      await fetchTodayIntake(accountId);
      generateSchedule(plan, wakeUpTime, bedtime);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Selected ${diseaseName} plan`,
      });
    } catch (error) {
      console.error('[handleSelectDisease] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  const handleLogWater = async () => {
    if (!waterIntake || isNaN(waterIntake) || parseFloat(waterIntake) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid positive amount',
      });
      return;
    }
    try {
      const amount = parseFloat(waterIntake);
      console.log('[handleLogWater] Logging water for accountId:', accountId, 'amount:', amount);
      await logWaterIntake(accountId, amount, userPlan?.selectedDisease || null);
      await fetchTodayIntake(accountId);
      setWaterIntake('');
      checkMilestones();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Water intake logged',
      });
    } catch (error) {
      console.error('[handleLogWater] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  const checkMilestones = () => {
    if (!userPlan?.milestones) return;
    const progress = userPlan.dailygoal ? todayIntake / parseFloat(userPlan.dailygoal) : 0;
    userPlan.milestones.forEach((milestone) => {
      if (progress >= milestone.goal && todayIntake > 0) {
        Toast.show({
          type: 'success',
          text1: 'Achievement Unlocked!',
          text2: milestone.reward,
        });
      }
    });
  };

  const progress = userPlan?.dailyGoal ? (todayIntake / parseFloat(userPlan.dailyGoal)) * 100 : 0;

  const renderPlanItem = ({ item }) => (
    <View style={styles.planItem}>
      <Text style={styles.planName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>Base Intake: {item.recommendedIntake} liters/day</Text>
      <Text style={styles.sectionTitle}>Tips:</Text>
      {item.tips.map((tip, index) => (
        <Text key={index} style={styles.tip}>• {tip}</Text>
      ))}
      <Text style={styles.sectionTitle}>Milestones:</Text>
      {item.milestones.map((milestone, index) => (
        <Text key={index} style={styles.tip}>
          • {milestone.goal * 100}% by {milestone.time}: {milestone.reward}
        </Text>
      ))}
      <Text style={styles.notes}>{item.notes}</Text>
      <Button
        title="Select Plan"
        onPress={() => handleSelectDisease(item.name)}
        color="#007AFF"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate('HydrationReportScreen', { accountId, userPlan })}
      >
        <Icon name="assessment" size={30} color="#fff" />
      </TouchableOpacity>
      {!userPlan?.usesDiseasePlan ? (
        <View style={styles.selectionContainer}>
          <Text style={styles.title}>Select a Hydration Plan</Text>
          <Text style={styles.subtitle}>
            Choose a disease-specific plan for a tailored hydration experience.
          </Text>
          <FlatList
            data={diseasePlans}
            keyExtractor={(item) => item.$id}
            renderItem={renderPlanItem}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{userPlan.selectedDisease} Plan</Text>
          <Text style={styles.info}>
            Daily Goal: {userPlan.dailygoal ? parseFloat(userPlan.dailygoal).toFixed(2) : '0.00'} liters
          </Text>
          <Text style={styles.info}>
            Today's Intake: {todayIntake.toFixed(2)} liters ({progress.toFixed(0)}%)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter water intake (liters)"
            keyboardType="numeric"
            value={waterIntake}
            onChangeText={setWaterIntake}
          />
          <Button title="Log Water Intake" onPress={handleLogWater} color="#007AFF" />
          <Text style={styles.sectionTitle}>Hydration Schedule:</Text>
          {schedule.length > 0 ? (
            schedule.map((entry, index) => (
              <Text key={index} style={styles.scheduleItem}>
                {entry.time}: {entry.amount.toFixed(2)} liters
              </Text>
            ))
          ) : (
            <Text style={styles.scheduleItem}>No schedule available</Text>
          )}
          <Text style={styles.sectionTitle}>Tips:</Text>
          {userPlan.tips.map((tip, index) => (
            <Text key={index} style={styles.tip}>• {tip}</Text>
          ))}
          <Text style={styles.disclaimer}>
            Consult your doctor before following this plan.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    marginLeft: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 5,
  },
  reportButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  selectionContainer: { flex: 1, padding: 20 },
  detailsContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, marginBottom: 15, color: '#666' },
  planItem: { padding: 15, marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  planName: { fontSize: 18, fontWeight: '600', color: '#007AFF' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#333' },
  tip: { fontSize: 14, color: '#555', marginBottom: 3 },
  notes: { fontSize: 14, color: '#888', marginTop: 10, marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 10, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 8, backgroundColor: '#fff' },
  scheduleItem: { fontSize: 14, color: '#555', marginBottom: 5 },
  disclaimer: { fontSize: 14, color: '#888', marginTop: 20, textAlign: 'center' },
  flatListContent: { paddingBottom: 20 },
});

export default HydrationPlanTracker;