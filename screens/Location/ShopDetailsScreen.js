import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Clipboard, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ShopDetailsScreen = ({ route }) => {
  const { shop } = route.params; // Receive shop details from the route
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen (Location page)
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
  };

  return (
    <View style={styles.container}>
      {/* StatusBar for visibility */}
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />

      {/* Back Button and Header Container */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#0A73FF" />
        </TouchableOpacity>
        <Text style={styles.header}>{shop.name}</Text>
      </View>

      {/* Shop Image */}
      <Image source={{ uri: shop.image }} style={styles.shopImage} />

      {/* Shop Information */}
      <View style={styles.infoContainer}>
        
        {/* Shop Name */}
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={20} color="#0A73FF" />
          <Text style={styles.shopInfo}>{shop.name}</Text>
        </View>

        <View style={styles.divider} />

        {/* Shop Address */}
        <View style={styles.infoRow}>
          <Text style={styles.emoji}>🏠</Text>
          <Text style={styles.shopInfo}>{shop.address}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(shop.address)}>
            <Ionicons name="copy-outline" size={20} color="#0A73FF" style={styles.copyIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Shop Phone Numbers */}
        <View style={styles.infoRow}>
          <Text style={styles.emoji}>📞</Text>
          <Text style={styles.shopInfo}>{shop.phone}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(shop.phone)}>
            <Ionicons name="copy-outline" size={20} color="#0A73FF" style={styles.copyIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Shop Hours */}
        <View style={styles.infoRow}>
          <Text style={styles.emoji}>⏰</Text>
          <Text style={styles.shopInfo}>{shop.hours}</Text>
        </View>

        <View style={styles.divider} />

        {/* License Number */}
        <View style={styles.infoRow}>
          <Text style={styles.emoji}>📄</Text>
          <Text style={styles.shopInfo}>{shop.license}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A73FF',
  },
  shopImage: {
    width: '90%',
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 10,
  },
  infoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  emoji: {
    fontSize: 20,
  },
  shopInfo: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1, // Makes the text take up the available space
  },
  copyIcon: {
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});

export default ShopDetailsScreen;
