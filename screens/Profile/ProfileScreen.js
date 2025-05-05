import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { account } from '../../lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';


import {
  fetchUserWaterConsumption,
  fetchUserWeight,
  fetchUserAge,
  fetchUserEmailAndPhone,
  fetchUserWakeUpTime,
  fetchUserBedtime,
} from '../../lib/appwrite';

const defaultProfilePic = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg';

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [profile, setProfile] = useState({
    name: 'Loading...',
    intakeGoal: 'Loading...',
    wakeUpTime: 'Loading...',
    bedtime: 'Loading...',
    email: 'Loading...',
    mobile: 'Loading...',
    weight: 'Loading...',
    age: 'Loading...',
    profilePic: defaultProfilePic,
  });

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Get the current user's account ID from AsyncStorage or Appwrite
        const accountId = await AsyncStorage.getItem('accountId');
        if (!accountId) {
          throw new Error('No account ID found. Please log in again.');
        }

        // Fetch current user data from Appwrite to ensure session is valid
        const currentUser = await account.get();
        if (!currentUser) {
          throw new Error('No active session found.');
        }

        // Fetch profile data using custom functions
        const waterConsumption = await fetchUserWaterConsumption(accountId);
        const weight = await fetchUserWeight(accountId);
        const age = await fetchUserAge(accountId);
        const wakeUpTime = await fetchUserWakeUpTime(accountId);
        const bedtime = await fetchUserBedtime(accountId);
        const { email, phoneNumber, profilePic, username } = await fetchUserEmailAndPhone(accountId);

        setProfile({
          intakeGoal: `${waterConsumption || 0} ml`,
          weight: `${weight || 'N/A'} kg`,
          age: `${age || 'N/A'}`,
          email: email || 'N/A',
          mobile: phoneNumber || 'N/A',
          username: username || currentUser.name || 'N/A',
          wakeUpTime: wakeUpTime || 'N/A',
          bedtime: bedtime || 'N/A',
          profilePic: profilePic || defaultProfilePic,
        });
      } catch (error) {
        console.error('Failed to load profile data:', error);
        Alert.alert('Error', 'Failed to load profile data. Please log in again.');
        navigation.navigate('Login'); // Redirect to login on failure
      }
    };

    loadProfileData();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      // Clear Appwrite session
      await account.deleteSession('current');
      // Clear AsyncStorage
      await AsyncStorage.clear();
      Alert.alert('Success', 'Logged out successfully');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleModal}>
          <Text style={styles.threeDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0}
        animationInTiming={200}
        animationOutTiming={200}
        style={styles.modalStyle}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => { navigation.navigate('DailyTips'); toggleModal(); }}>
            <Text style={styles.modalText}>Daily Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { navigation.navigate('ShopRegistrationScreen1'); toggleModal(); }}>
            <Text style={styles.modalText}>Join with Us</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { navigation.navigate('ContactUsScreen'); toggleModal(); }}>
            <Text style={styles.modalText}>Contact Us</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { navigation.navigate('ChatScreen'); toggleModal(); }}>
            <Text style={styles.modalText}>Aqua ring</Text>
          </TouchableOpacity>
          
        </View>
      </Modal>

      <View style={styles.profileContainer}>
        <Image source={{ uri: profile.profilePic }} style={styles.profileImage} />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile', { profile })}
        >
          <Text style={styles.editText}>EDIT PROFILE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>💧 Intake Goal:</Text>
          <Text style={styles.value}>{profile.intakeGoal}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>👤 Username:</Text>
          <Text style={styles.value}>{profile.username}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>📧 Email:</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>⚖️ Weight:</Text>
          <Text style={styles.value}>{profile.weight}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>🎂 Age:</Text>
          <Text style={styles.value}>{profile.age}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>⏰ Wake-up Time:</Text>
          <Text style={styles.value}>{profile.wakeUpTime}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>🌙 Bedtime:</Text>
          <Text style={styles.value}>{profile.bedtime}</Text>
        </View>
      </View>

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  threeDots: {
    fontSize: 30,
  },
  modalStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    margin: 0,
    paddingTop: 60,
    paddingRight: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: 'transparent',
    elevation: 0,
    width: 150,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#00aaff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editText: {
    color: '#fff',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  value: {
    fontSize: 18,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#d3d3d3',
    marginVertical: 10,
  },
  logoutButtonContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 2,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;