import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchShops } from '../../lib/appwrite';

const LocationMapScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [activeTab, setActiveTab] = useState('bottles');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 7.85,
    longitude: 80.75,
    latitudeDelta: 4.0,
    longitudeDelta: 2.5,
  });
  const mapRef = useRef(null);

  console.log('LocationMapScreen route params:', route.params);

  useEffect(() => {
    if (isFocused || route.params?.refresh) {
      loadShops();
      navigation.setParams({ refresh: undefined });
    }
  }, [isFocused, route.params?.refresh, activeTab]);

  const loadShops = async () => {
    setIsLoading(true);
    try {
      const isWaterBottleShop = activeTab === 'bottles';
      console.log('Fetching shops for:', isWaterBottleShop ? 'Water Bottle Shops' : 'Filling Stations');
      const fetchedShops = await fetchShops(isWaterBottleShop);
      const validShops = fetchedShops.filter(
        shop => shop.latitude && shop.longitude && !isNaN(shop.latitude) && !isNaN(shop.longitude)
      );
      setShops(validShops);
      setFilteredShops(validShops);
      console.log('Fetched shops:', validShops.map(s => ({ id: s.$id, name: s.name })));
    } catch (error) {
      console.error('Error fetching shops:', error);
      Alert.alert('Error', 'Failed to load shops. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    loadShops();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredShops(shops);
    } else {
      const filtered = shops.filter(
        shop =>
          shop.name.toLowerCase().includes(query.toLowerCase()) ||
          shop.address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredShops(filtered);
    }
  };

  const handleMarkerPress = (shop) => {
    console.log('Navigating to ShopDetails with shop:', {
      id: shop.$id,
      name: shop.name,
      isWaterBottleShop: activeTab === 'bottles',
    });
    navigation.navigate('ShopDetails', {
      shop: { ...shop, isWaterBottleShop: activeTab === 'bottles' },
    });
  };

  const handleCreateShop = () => {
    navigation.navigate('ShopRegistrationScreen1', { isWaterBottleShop: activeTab === 'bottles' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Shops</Text>
        <TouchableOpacity onPress={handleCreateShop}>
          <Ionicons name="add-circle-outline" size={28} color="#0A73FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bottles' && styles.activeTab]}
          onPress={() => handleTabChange('bottles')}
        >
          <Text style={[styles.tabText, activeTab === 'bottles' && styles.activeTabText]}>
            Water Bottle Shops
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stations' && styles.activeTab]}
          onPress={() => handleTabChange('stations')}
        >
          <Text style={[styles.tabText, activeTab === 'stations' && styles.activeTabText]}>
            Filling Stations
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or address"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading shops...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {filteredShops.map(shop => (
            <Marker
              key={shop.$id}
              coordinate={{
                latitude: parseFloat(shop.latitude),
                longitude: parseFloat(shop.longitude),
              }}
              title={shop.name}
              description={shop.address}
              pinColor={activeTab === 'bottles' ? 'red' : 'blue'}
              onPress={() => handleMarkerPress(shop)}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A73FF',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#0A73FF',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    margin: 10,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    fontSize: 16,
    color: '#0A73FF',
  },
});

export default LocationMapScreen;