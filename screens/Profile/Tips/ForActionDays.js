import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ForActionDays = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>For Action Days</Text>
      </View>
      <ScrollView style={styles.tipsContainer}>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Drink water 30 minutes before exercising to ensure you're hydrated from the start.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Take water breaks every 20 minutes during intense activities.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Replenish fluids lost during exercise by drinking extra water afterward.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Stay hydrated in both hot and cold weather; your body needs water in all conditions.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Drinking water during long workouts helps maintain endurance and performance.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Monitor the color of your urine—pale yellow indicates good hydration.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Carry a reusable water bottle to track your water intake during the day.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Add electrolytes to your water if you're engaging in long, sweaty workouts.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Drink water before and after meals to support digestion and metabolism.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Don't wait until you're thirsty to drink water—stay ahead of dehydration.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Drink water before bed to keep hydrated overnight, but not too much to avoid sleep disturbances.</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>Use a hydration app to set reminders for drinking water throughout the day.</Text>
          </View>
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  backButton: {
    fontSize: 24,
    color: '#00bfff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#00bfff',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tip: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  tipText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00aaff',
    marginLeft: 10,
  },
});

export default ForActionDays;
