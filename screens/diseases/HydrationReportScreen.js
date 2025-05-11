import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchWaterIntakeLogs } from '../../lib/appwrite';
import { Client } from 'appwrite';
import { config } from '../../lib/appwrite';

const client = new Client();
client.setEndpoint(config.endpoint).setProject(config.projectId);

const HydrationReportScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountId, userPlan } = route.params;
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [achievedMilestones, setAchievedMilestones] = useState([]);
  const [insights, setInsights] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const toDate = new Date().toISOString();
        const logs = await fetchWaterIntakeLogs(accountId, fromDate, toDate);
        setLogs(logs);
        updateChartData(logs);
        updatePieData(logs);
        updateBarData(logs);
        updateAchievedMilestones(logs);
        updateInsights(logs);
      } catch (error) {
        console.error('[HydrationReportScreen] Error fetching logs:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch data',
        });
      }
    };
    fetchLogs();
  }, [accountId]);

  const updateChartData = (logs) => {
    const last7Days = logs
      .filter((log) => new Date(log.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const labels = last7Days.map((log) => new Date(log.timestamp).toLocaleDateString());
    const data = last7Days.map((log) => parseFloat(log.amount));
    setChartData({
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{ data: data.length > 0 ? data : [0] }],
    });
  };

  const updatePieData = (logs) => {
    const dailyGoal = parseFloat(userPlan?.dailyGoal) || 0;
    if (dailyGoal === 0) {
      setPieData([
        {
          name: 'No Data',
          value: 100,
          color: '#888',
          legendFontColor: '#333',
          legendFontSize: 12,
        },
      ]);
      return;
    }

    const totalIntake = logs.reduce((sum, log) => sum + parseFloat(log.amount), 0);
    const days = [...new Set(logs.map((log) => new Date(log.timestamp).toLocaleDateString()))].length;
    const avgIntake = days > 0 ? totalIntake / days : 0;
    const adherence = dailyGoal > 0 ? (avgIntake / dailyGoal) * 100 : 0;
    const shortfall = adherence >= 100 ? 0 : 100 - adherence;

    setPieData([
      {
        name: 'Adherence',
        value: Math.min(adherence, 100),
        color: '#4CAF50',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: 'Shortfall',
        value: shortfall,
        color: '#FF5252',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
    ]);
  };

  const updateBarData = (logs) => {
    if (!userPlan?.milestones) {
      setBarData({
        labels: ['No Milestones'],
        datasets: [{ data: [0] }],
      });
      return;
    }

    const todayLogs = logs.filter(
      (log) => new Date(log.timestamp).toDateString() === new Date().toDateString()
    );
    const totalToday = todayLogs.reduce((sum, log) => sum + parseFloat(log.amount), 0);
    const dailyGoal = parseFloat(userPlan.dailyGoal) || 0;
    const progress = dailyGoal ? (totalToday / dailyGoal) * 100 : 0;

    const labels = userPlan.milestones.map((m) => `${m.goal * 100}%`);
    const data = userPlan.milestones.map((m) =>
      progress >= m.goal * 100 ? m.goal * 100 : 0
    );

    setBarData({
      labels: labels.length > 0 ? labels : ['No Milestones'],
      datasets: [{ data: data.length > 0 ? data : [0] }],
    });
  };

  const updateAchievedMilestones = (logs) => {
    if (!userPlan?.milestones) return;
    const todayLogs = logs.filter(
      (log) => new Date(log.timestamp).toDateString() === new Date().toDateString()
    );
    const totalToday = todayLogs.reduce((sum, log) => sum + parseFloat(log.amount), 0);
    const progress = userPlan.dailyGoal ? totalToday / parseFloat(userPlan.dailyGoal) : 0;
    const achieved = userPlan.milestones.filter(
      (milestone) => progress >= milestone.goal && totalToday > 0
    );
    setAchievedMilestones(achieved);
  };

  const updateInsights = (logs) => {
    const totalIntake = logs.reduce((sum, log) => sum + parseFloat(log.amount), 0);
    const dailyGoal = parseFloat(userPlan?.dailyGoal) || 0;
    const days = [...new Set(logs.map((log) => new Date(log.timestamp).toLocaleDateString()))].length;
    const avgIntake = days > 0 ? totalIntake / days : 0;
    const adherence = dailyGoal > 0 ? (avgIntake / dailyGoal) * 100 : 0;

    const insightsMap = {
      'Dengue Fever': `Your average intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal. Consistent hydration is critical for recovery.`,
      'Chronic Kidney Disease': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the restricted goal. Monitor with your doctor.`,
      'Heart Failure': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal. Controlled hydration is essential.`,
      'Gastritis': `Your intake of ${avgIntake.toFixed(2)} L/day supports gastric health at ${adherence.toFixed(0)}% of the goal.`,
      'Hypertension': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal, aiding blood pressure management.`,
      'Diabetes': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal, supporting metabolic balance.`,
      'Liver Disease': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal, promoting liver function.`,
      'Asthma': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal, aiding respiratory health.`,
      'Urinary Tract Infections': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal, crucial for flushing bacteria.`,
      'Kidney Stones': `Your intake of ${avgIntake.toFixed(2)} L/day is ${adherence.toFixed(0)}% of the goal, essential for stone prevention.`,
    };

    setInsights(insightsMap[userPlan?.selectedDisease] || 'Follow your hydration plan to support health.');
  };

  const chartConfig = {
    backgroundColor: '#e26a00',
    backgroundGradientFrom: '#fb8c00',
    backgroundGradientTo: '#ffa726',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Hydration Report</Text>

      <Text style={styles.sectionTitle}>Weekly Water Intake</Text>
      {chartData.labels.length > 1 ? (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No intake data available for the last 7 days</Text>
      )}

      <Text style={styles.sectionTitle}>Adherence to Daily Goal</Text>
      {pieData.length > 0 && pieData[0].name !== 'No Data' ? (
        <PieChart
          data={pieData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No adherence data available</Text>
      )}

      <Text style={styles.sectionTitle}>Milestone Progress</Text>
      {barData.labels.length > 1 || barData.datasets[0].data[0] !== 0 ? (
        <BarChart
          data={barData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No milestone progress available</Text>
      )}

      <Text style={styles.sectionTitle}>Achieved Milestones</Text>
      {achievedMilestones.length > 0 ? (
        achievedMilestones.map((milestone, index) => (
          <View key={index} style={styles.badge}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.badgeText}>{milestone.reward}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>No milestones achieved</Text>
      )}

      <Text style={styles.sectionTitle}>Health Insights</Text>
      <Text style={styles.insights}>
        {insights || 'No insights available for the selected disease.'}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  chart: { marginVertical: 10, borderRadius: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  badgeText: { fontSize: 16, color: '#333', marginLeft: 10 },
  noData: { fontSize: 16, color: '#888', textAlign: 'center', marginVertical: 20 },
  insights: { fontSize: 16, color: '#333', marginBottom: 20, lineHeight: 24 },
});

export default HydrationReportScreen;