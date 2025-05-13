import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Alert, ToastAndroid } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { deleteShop, fetchShopById } from '../../lib/appwrite';

const ShopDetailsScreen = ({ route }) => {
  const { shop: initialShop } = route.params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [shop, setShop] = useState(initialShop);
  const [isLoading, setIsLoading] = useState(false);

  console.log('ShopDetailsScreen route params:', route.params);
  console.log('ShopDetailsScreen initial shop data:', {
    id: initialShop.$id,
    name: initialShop.name,
    isWaterBottleShop: initialShop.isWaterBottleShop,
  });

  if (!initialShop.$id || initialShop.isWaterBottleShop === undefined) {
    console.error('Invalid shop data in ShopDetailsScreen:', initialShop);
    Alert.alert('Error', 'Invalid shop data. Please try again.');
    navigation.goBack();
    return null;
  }

  useEffect(() => {
    if (isFocused) {
      const refreshShopData = async () => {
        setIsLoading(true);
        try {
          console.log('Fetching shop data for ID:', initialShop.$id, 'isWaterBottleShop:', initialShop.isWaterBottleShop);
          const updatedShop = await fetchShopById(initialShop.$id, initialShop.isWaterBottleShop);
          setShop(updatedShop);
          console.log('Updated shop data:', updatedShop);
        } catch (error) {
          console.error('Error fetching shop:', {
            message: error.message,
            code: error.code,
            shopId: initialShop.$id,
          });
          if (error.code === 404) {
            Alert.alert('Error', 'Shop not found. It may have been deleted.');
            navigation.navigate('LocationMapScreen', { refresh: true });
          } else {
            Alert.alert('Error', 'Failed to refresh shop data. Please try again.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      refreshShopData();
    }
  }, [isFocused, initialShop.$id, initialShop.isWaterBottleShop]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    const shopForEdit = {
      $id: shop.$id,
      name: shop.name,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      hours: shop.hours,
      license: shop.license,
      latitude: shop.latitude,
      longitude: shop.longitude,
      image: shop.image,
      isWaterBottleShop: shop.isWaterBottleShop,
    };
    console.log('Navigating to EditShopScreen with shop:', shopForEdit);
    navigation.navigate('EditShopScreen', { shop: shopForEdit, refresh: true });
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Shop',
      `Are you sure you want to delete ${shop.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to delete shop:', {
                id: shop.$id,
                name: shop.name,
                isWaterBottleShop: shop.isWaterBottleShop,
              });
              await deleteShop(shop.$id, shop.isWaterBottleShop);
              ToastAndroid.show('Shop deleted successfully!', ToastAndroid.SHORT);
              navigation.navigate('HomeOverview', { refresh: true });
              //navigation.goBack({ refresh: true });
            } catch (error) {
              console.error('Error deleting shop:', {
                message: error.message,
                code: error.code,
                shopId: shop.$id,
              });
              if (error.code === 404) {
                Alert.alert('Error', 'Shop not found. It may have already been deleted.');
                navigation.navigate('LocationMapScreen', { refresh: true });
              } else {
                Alert.alert('Error', 'Failed to delete shop. Please try again.');
              }
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#0A73FF" />
        </TouchableOpacity>
        <Text style={styles.header}>{shop.name}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit} disabled={isLoading}>
            <Ionicons name="pencil" size={24} color={isLoading ? '#ccc' : '#0A73FF'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete} disabled={isLoading}>
            <Ionicons name="trash" size={24} color={isLoading ? '#ccc' : '#FF3B30'} />
          </TouchableOpacity>
        </View>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          <Image source={{ uri: shop.image }} style={styles.shopImage} />
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="home-outline" size={20} color="#0A73FF" />
              <Text style={styles.shopInfo}>{shop.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>🏠</Text>
              <Text style={styles.shopInfo}>{shop.address}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(shop.address)}>
                <Ionicons name="copy-outline" size={20} color="#0A73FF" style={styles.copyIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>📞</Text>
              <Text style={styles.shopInfo}>{shop.phone}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(shop.phone)}>
                <Ionicons name="copy-outline" size={20} color="#0A73FF" style={styles.copyIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>⏰</Text>
              <Text style={styles.shopInfo}>{shop.hours || 'Not specified'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.emoji}>📄</Text>
              <Text style={styles.shopInfo}>{shop.license || 'Not specified'}</Text>
            </View>
          </View>
        </>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A73FF',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
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
    flex: 1,
  },
  copyIcon: {
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
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

export default ShopDetailsScreen;