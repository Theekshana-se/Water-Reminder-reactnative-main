import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const DailyTips = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Tips</Text>
      </View>

      <Text style={styles.subtitle}>Hydration is the key to energy and focus—drink up!</Text>

      <View style={styles.tipsWrapper}>
  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.tipsContainer}>
    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Begin your day by drinking a glass of water right after waking up.</Text>
    </View>
    
    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Drink a small amount of water every hour to maintain hydration.</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Keep a water bottle with you throughout the day as a reminder to drink.</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Add lemon or cucumber slices for a refreshing flavor boost to your water.</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Try to drink at least 8 glasses (about 2 liters) of water every day.</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Sip water before, during, and after exercise to stay hydrated.</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Stay hydrated while traveling, especially on long flights or car trips.</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Eat water-rich foods like cucumbers, oranges, and watermelons for extra hydration.</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>If you feel thirsty, you're already slightly dehydrated. Drink water often!</Text>
    </View>

    <View style={styles.tip}>
      <Text style={styles.avatarEmoji}>💧</Text>
      <Text style={styles.tipText}>Drink water before meals to help with digestion and control appetite.</Text>
    </View>
  </ScrollView>
</View>

      <View style={styles.suggestionsContainer}>
        <TouchableOpacity style={styles.suggestionButton} onPress={() => navigation.navigate('ForActionDays')}>
          <Text style={styles.suggestionText}>For Action Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.suggestionButton} onPress={() => navigation.navigate('HotWeatherTips')}>
          <Text style={styles.suggestionText}>Hot Weather Tips</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.suggestionButton} onPress={() => navigation.navigate('HealthWellness')}>
          <Text style={styles.suggestionText}>Health & Wellness</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#00bfff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    marginTop:5,
  },
  avatarEmoji: {
    fontSize: 40, // Adjust the size of the emoji
    marginRight: 10,
  },
  tipsWrapper: {
    marginBottom: 20,
  },
  tipsContainer: {
    flexDirection: 'row',
  },
  tip: {
    backgroundColor: '#e0f7fa',
    padding: 25,
    marginHorizontal: 10,
    borderRadius: 10,
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  tipText: {
    fontSize: 16,
    flexShrink: 1,
  },
  suggestionsContainer: {
    marginTop: 170,
  },
  suggestionButton: {
    backgroundColor: '#00bfff',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  suggestionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default DailyTips;
