import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Dimensions, StatusBar, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

const LocationMapScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('bottles'); // Set default active tab to "Water Bottles"

  // Initial region centered on Sri Lanka
  const [region, setRegion] = useState({
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 2.0,
    longitudeDelta: 2.0,
  });

  // Water bottle collection locations
  const waterBottleLocations = [
    {
      id: 1,
      name: 'Water Shop Kagalle',
      latitude: 7.2508,
      longitude: 80.3451,
      address: 'No 24, Main Rd, Kagalle',
      phone: '0761234567',
      hours: 'Open until 9:00 PM',
      license: 'CFA/BW/01/2021-05',
      image: 'https://www.perfectwater.co.za/wp-content/uploads/2014/03/P1080148.jpg',
    },
    {
      id: 2,
      name: 'Water Shop Galle',
      latitude: 6.0535,
      longitude: 80.221,
      address: 'No 45, Galle Rd, Galle',
      phone: '0777654321',
      hours: 'Open until 8:30 PM',
      license: 'CFA/BW/01/2021-07',
      image: 'https://www.perfectwater.co.za/wp-content/uploads/2010/03/middelburg14.jpg',
    },
    {
      id: 3,
      name: 'Water Shop Kurunegala',
      latitude: 7.4866,
      longitude: 80.3657,
      address: 'No 56, Kandy Rd, Kurunegala',
      phone: '0711239876',
      hours: 'Open until 7:30 PM',
      license: 'CFA/BW/01/2021-09',
      image: 'https://images.neventum.com/2012/290/expo-min-2_05115ffd.jpg',
    },
    {
      id: 4,
      name: 'Water Shop Monaragala',
      latitude: 6.8724,
      longitude: 81.3501,
      address: 'No 10, Monaragala Town, Monaragala',
      phone: '0757894561',
      hours: 'Open until 9:30 PM',
      license: 'CFA/BW/01/2021-11',
      image: 'https://www.puricentric.co.za/wp-content/uploads/2018/04/Water-Shop-Set-Up-3.jpg',
    },
    {
      id: 5,
      name: 'Water Shop Matara',
      latitude: 5.9485,
      longitude: 80.5484,
      address: 'No 12, Galle Rd, Matara',
      phone: '0772811676',
      hours: 'Open until 10:30 PM',
      license: 'CFA/BW/01/2021-01',
      image: 'https://pr1.nicelocal.com/akocHGIlD_k9arSLIWCG-w/2400x1500,q75/4px-BW84_n3lJhgQGe6caI1vAfZfD8yOKqS4dO4Py5dVeCDAtW6xSbL9ejGiq2i59SeIQ1wxKSLsvzMmsExmz8g9qRacW2q1NDltTQl9M_JkZU90_E3zXhE5oQsHEAFOMg4uCPB-3aM',
    },
  ];

  // Water filling station locations
  const waterFillingStations = [
    {
      id: 1,
      name: 'Filling Station Colombo',
      latitude: 6.9271,
      longitude: 79.8612,
      address: 'No 123, Station Rd, Colombo',
      phone: '0721234567',
      hours: 'Open until 9:00 PM',
      image: 'https://example.com/colombo.jpg',
    },
    {
      id: 2,
      name: 'Filling Station Negombo',
      latitude: 7.2083,
      longitude: 79.8355,
      address: 'No 78, Beach Rd, Negombo',
      phone: '0727654321',
      hours: 'Open until 8:30 PM',
      image: 'https://example.com/negombo.jpg',
    },
    {
      id: 3,
      name: 'Filling Station Kandy',
      latitude: 7.2906,
      longitude: 80.6337,
      address: 'No 56, Station Rd, Kandy',
      phone: '0711239876',
      hours: 'Open until 7:30 PM',
      image: 'https://example.com/kandy.jpg',
    },
    {
      id: 4,
      name: 'Filling Station Jaffna',
      latitude: 9.6615,
      longitude: 80.0255,
      address: 'No 12, Main Rd, Jaffna',
      phone: '0757894561',
      hours: 'Open until 9:30 PM',
      image: 'https://example.com/jaffna.jpg',
    },
    {
      id: 5,
      name: 'Filling Station Galle',
      latitude: 6.0535,
      longitude: 80.211,
      address: 'No 34, Station Rd, Galle',
      phone: '0772811676',
      hours: 'Open until 10:30 PM',
      image: 'https://example.com/galle.jpg',
    },
  ];

  const onMarkerPress = (shop) => {
    // Navigate to shop details when a marker is clicked
    navigation.navigate('ShopDetails', { shop });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />

      {/* Map with markers */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {(activeTab === 'bottles' ? waterBottleLocations : waterFillingStations).map((shop) => (
          <Marker
            key={shop.id}
            coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
            title={shop.name}
            pinColor={activeTab === 'bottles' ? 'red' : 'blue'} // Red for water bottles, blue for filling stations
            onPress={() => onMarkerPress(shop)}
          />
        ))}
      </MapView>

      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Find Location"
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bottles' && styles.activeTab]}
          onPress={() => setActiveTab('bottles')}
        >
          <Text style={[styles.tabText, activeTab === 'bottles' && styles.activeTabText]}>Water Bottle Collection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stations' && styles.activeTab]}
          onPress={() => setActiveTab('stations')}
        >
          <Text style={[styles.tabText, activeTab === 'stations' && styles.activeTabText]}>Water Filling Stations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  tabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#00aaff',
    borderRadius: 20,
    zIndex: 2,
    padding: 5,
    marginBottom: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#fff', // Active tab background is white
  },
  tabText: {
    fontSize: 16,
    color: '#fff', // Inactive tab text color is white
  },
  activeTabText: {
    color: '#000', // Active tab text color is black
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Map fills the entire screen
  },
});

export default LocationMapScreen;
