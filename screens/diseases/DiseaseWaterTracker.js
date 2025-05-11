import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {
  fetchDiseasePlans,
  selectDiseasePlan,
  logWaterIntake,
  fetchWaterIntakeLogs,
  generateHydrationReport,
  fetchUserDiseasePlan,
  getCurrentUser
} from '../../lib/appwrite'; // Adjust path to your appwrite.js

const DiseaseWaterTracker = () => {
  const [accountId, setAccountId] = useState(null);
  const [diseasePlans, setDiseasePlans] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [waterIntake, setWaterIntake] = useState('');
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });

  // Initialize user and fetch data
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setAccountId(user.$id);

        // Fetch disease plans
        const plans = await fetchDiseasePlans();
        setDiseasePlans(plans);

        // Fetch user disease plan
        const plan = await fetchUserDiseasePlan(user.$id);
        setUserPlan(plan);

        // Fetch water intake logs
        if (plan.usesDiseasePlan) {
          await fetchLogs(user.$id);
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };
    init();
  }, []);

  // Fetch water intake logs
  const fetchLogs = async (userId) => {
    try {
      const logs = await fetchWaterIntakeLogs(userId);
      setLogs(logs);
      updateChartData(logs);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Update chart data
  const updateChartData = (logs) => {
    const last7Days = logs
      .filter((log) => new Date(log.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const labels = last7Days.map((log) => new Date(log.timestamp).toLocaleDateString());
    const data = last7Days.map((log) => parseFloat(log.amount));
    setChartData({
      labels,
      datasets: [{ data }],
    });
  };

  // Handle disease selection
  const handleSelectDisease = async (diseaseName) => {
    try {
      await selectDiseasePlan(accountId, diseaseName);
      const plan = await fetchUserDiseasePlan(accountId);
      setUserPlan(plan);
      await fetchLogs(accountId);
      Alert.alert('Success', `Selected ${diseaseName} plan`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Log water intake
  const handleLogWater = async () => {
    if (!waterIntake || isNaN(waterIntake)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    try {
      const amount = parseFloat(waterIntake);
      await logWaterIntake(accountId, amount, userPlan?.selectedDisease || null);
      await fetchLogs(accountId);
      setWaterIntake('');
      Alert.alert('Success', 'Water intake logged');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Generate PDF report
  const generateReport = async () => {
    try {
      const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = new Date().toISOString();
      const logs = await fetchWaterIntakeLogs(accountId, fromDate, toDate);

      const htmlContent = `
        <h1>Hydration Report</h1>
        <p>User ID: ${accountId}</p>
        <p>Disease: ${userPlan?.selectedDisease || 'None'}</p>
        <p>Water Goal: ${userPlan?.diseaseWaterGoal || 'N/A'} liters/day</p>
        <h2>Water Intake Log</h2>
        <table border="1">
          <tr><th>Date</th><th>Amount (liters)</th></tr>
          ${logs.map((log) => `<tr><td>${new Date(log.timestamp).toLocaleDateString()}</td><td>${log.amount}</td></tr>`).join('')}
        </table>
      `;
      const options = {
        html: htmlContent,
        fileName: `HydrationReport_${Date.now()}`,
        directory: 'Documents',
      };
      const file = await RNHTMLtoPDF.convert(options);

      // Store report in Appwrite storage
      const formData = new FormData();
      formData.append('file', {
        uri: file.filePath,
        type: 'application/pdf',
        name: options.fileName + '.pdf',
      });
      const storage = new Storage(client); // Ensure Storage is imported from appwrite
      const uploadedFile = await storage.createFile(config.storageId, ID.unique(), formData);

      // Save report metadata
      await generateHydrationReport(accountId, fromDate, toDate, uploadedFile.$id);
      Alert.alert('Success', `Report generated at: ${file.filePath}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Calculate daily progress
  const todayLogs = logs.filter(
    (log) => new Date(log.timestamp).toDateString() === new Date().toDateString()
  );
  const totalToday = todayLogs.reduce((sum, log) => sum + parseFloat(log.amount), 0);
  const progress = userPlan?.diseaseWaterGoal
    ? (totalToday / userPlan.diseaseWaterGoal) * 100
    : 0;

  return (
    <View style={styles.container}>
      {!userPlan?.usesDiseasePlan ? (
        <View>
          <Text style={styles.title}>Select a Disease Plan</Text>
          <FlatList
            data={diseasePlans}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <Button
                title={item.name}
                onPress={() => handleSelectDisease(item.name)}
              />
            )}
          />
        </View>
      ) : (
        <View>
          <Text style={styles.title}>{userPlan.selectedDisease}</Text>
          <Text>Daily Goal: {userPlan.diseaseWaterGoal} liters</Text>
          <Text>
            Today's Intake: {totalToday.toFixed(2)} liters ({progress.toFixed(0)}%)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter water intake (liters)"
            keyboardType="numeric"
            value={waterIntake}
            onChangeText={setWaterIntake}
          />
          <Button title="Log Water" onPress={handleLogWater} />

          {chartData.labels.length > 0 && (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          )}

          <Button title="Generate Report" onPress={generateReport} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  chart: { marginVertical: 20, borderRadius: 16 },
});

export default DiseaseWaterTracker;