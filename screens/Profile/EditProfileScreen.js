import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateProfilePicture, updateUserWeight, updateUserAge, updateWakeUpTime, updateBedtime, updateUserEmailAndPhone, updateUserName } from '../../lib/appwrite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons for back button

const EditProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { profile } = route.params; // Receive the passed profile data

  const [profilePic, setProfilePic] = useState(profile.profilePic);
  const [name, setName] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [weight, setWeight] = useState(profile.weight);
  const [age, setAge] = useState(profile.age);
  const [wakeUpTime, setWakeUpTime] = useState(profile.wakeUpTime);
  const [bedtime, setBedtime] = useState(profile.bedtime);

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const { uri } = response.assets[0];
        setProfilePic(uri);
      }
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Save all updated fields to Appwrite
      if (profilePic) await updateProfilePicture(profilePic);
      await updateUserName(name);
      await updateUserEmailAndPhone(email);
      await updateUserWeight(weight);
      await updateUserAge(age);
      await updateWakeUpTime(wakeUpTime);
      await updateBedtime(bedtime);

      Alert.alert('Success', 'Profile updated successfully');
      navigation.navigate('ProfileScreen'); // Navigate back to profile page
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Back Arrow and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00aaff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Profile Image */}
      <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
        <Image source={{ uri: profilePic }} style={styles.profileImage} />
        <Text style={styles.editText}>Tap to select image</Text>
      </TouchableOpacity>

      {/* Form Inputs in Card with Dividers */}
      <View style={styles.cardContainer}>
        {/* Name Field */}
        <Text style={styles.label}>👤 Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <View style={styles.divider} />

        {/* Email Field */}
        <Text style={styles.label}>📧 Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />
        <View style={styles.divider} />

        {/* Weight Field */}
        <Text style={styles.label}>⚖️ Weight (kg)</Text>
        <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <View style={styles.divider} />

        {/* Age Field */}
        <Text style={styles.label}>🎂 Age</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
        <View style={styles.divider} />

        {/* Wake-up Time Field */}
        <Text style={styles.label}>⏰ Wake-up Time</Text>
        <TextInput style={styles.input} value={wakeUpTime} onChangeText={setWakeUpTime} />
        <View style={styles.divider} />

        {/* Bedtime Field */}
        <Text style={styles.label}>🌙 Bedtime</Text>
        <TextInput style={styles.input} value={bedtime} onChangeText={setBedtime} />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the title
    paddingTop:0, // Ensure it is at the top
  },
  backButton: {
    position: 'absolute',
    left: 0,
    paddingLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00aaff',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    marginTop:30,
  },
  editText: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#d3d3d3', // Ash color for divider
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#00aaff',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom:60,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditProfileScreen;
