import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
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

  if (!initialShop.$id || initialShop.isWaterBottleShop === undefined) {
    Alert.alert('Error', 'Invalid shop data. Please try again.');
    navigation.goBack();
    return null;
  }

  useEffect(() => {
    if (isFocused) {
      const refreshShopData = async () => {
        setIsLoading(true);
        try {
          const updatedShop = await fetchShopById(initialShop.$id, initialShop.isWaterBottleShop);
          setShop(updatedShop);
        } catch (error) {
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
    navigation.navigate('EditShopScreen', { shop, refresh: true });
  };

  const handleDelete = () => {
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
              await deleteShop(shop.$id, shop.isWaterBottleShop);
              navigation.navigate('HomeOverview', { refresh: true });
            } catch (error) {
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

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setString(text);
      Alert.alert('Success', 'Copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  const handleDownload = async () => {
    try {
      const shopDetails = `
Shop Details:
Name: ${shop.name}
Address: ${shop.address}
Phone: ${shop.phone}
Email: ${shop.email || 'Not specified'}
Hours: ${shop.hours || 'Not specified'}
License: ${shop.license || 'Not specified'}
Type: ${shop.isWaterBottleShop ? 'Water Bottle Shop' : 'Water Filling Shop'}
Location: (${shop.latitude}, ${shop.longitude})
      `.trim();
      await Clipboard.setString(shopDetails);
      Alert.alert('Success', 'Shop details copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy shop details.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shop.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} disabled={isLoading} style={styles.actionButton}>
            <Ionicons name="pencil" size={20} color={isLoading ? '#9CA3AF' : '#1D4ED8'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} disabled={isLoading} style={styles.actionButton}>
            <Ionicons name="trash" size={20} color={isLoading ? '#9CA3AF' : '#EF4444'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} disabled={isLoading} style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color={isLoading ? '#9CA3AF' : '#1D4ED8'} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Image source={{ uri: shop.image }} style={styles.shopImage} resizeMode="cover" />
          <View style={styles.infoCard}>
            <InfoItem
              icon="store-outline"
              label="Shop Name"
              value={shop.name}
            />
            <InfoItem
              icon="location-outline"
              label="Address"
              value={shop.address}
              onCopy={() => copyToClipboard(shop.address)}
            />
            <InfoItem
              icon="call-outline"
              label="Phone"
              value={shop.phone}
              onCopy={() => copyToClipboard(shop.phone)}
            />
            <InfoItem
              icon="time-outline"
              label="Hours"
              value={shop.hours || 'Not specified'}
            />
            <InfoItem
              icon="document-text-outline"
              label="License"
              value={shop.license || 'Not specified'}
            />
            <InfoItem
              icon="water-outline"
              label="Type"
              value={shop.isWaterBottleShop ? 'Water Bottle Shop' : 'Water Filling Shop'}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const InfoItem = ({ icon, label, value, onCopy }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoContent}>
      <Ionicons name={icon} size={20} color="#1D4ED8" style={styles.infoIcon} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
    {onCopy && (
      <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
        <Ionicons name="copy-outline" size={20} color="#1D4ED8" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  shopImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  copyButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#1D4ED8',
  },
});

export default ShopDetailsScreen;