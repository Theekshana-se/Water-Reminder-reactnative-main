import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Platform } from 'react-native';
import { GlobalStyles } from '../../constants/styles';

const UIModal = ({ isVisible, onSelect, onClose, onConfirm }) => {
  const quantities = [
    { id: 1, value: 150, text: '150ml' },
    { id: 2, value: 200, text: '200ml' },
    { id: 3, value: 250, text: '250ml' },
    { id: 4, value: 300, text: '300ml' },
    { id: 5, value: 350, text: '350ml' },
    { id: 6, value: 400, text: '400ml' },
  ];

  const scaleValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Debug: Log the quantities array to ensure data is correct
    console.log('Quantities:', quantities);

    if (isVisible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const renderQuantityItem = ({ item }) => {
    // Debug: Log each item being rendered
    console.log('Rendering quantity item:', item);

    return (
      <TouchableOpacity
        style={styles.quantityButton}
        onPress={() => {
          onSelect(item.value);
          onConfirm(item.value);
        }}
      >
        <Text style={styles.quantityButtonText}>{item.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <Text style={styles.modalTitle}>Select Hydration Level</Text>
          {quantities.length === 0 ? (
            <Text style={styles.errorText}>No quantities available</Text>
          ) : (
            <FlatList
              data={quantities}
              renderItem={renderQuantityItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.quantityGrid}
              columnWrapperStyle={styles.columnWrapper} // Add column wrapper style
              extraData={quantities} // Ensure re-render if quantities change
            />
          )}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  quantityGrid: {
    width: '100%',
    paddingHorizontal: 5,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Ensure even spacing between columns
  },
  quantityButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0, // Remove flex to let dimensions control size
    minHeight: 50,
    minWidth: 120, // Increased width to ensure text fits
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      android: {
        lineHeight: 20, // Adjust for Android text alignment
      },
    }),
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 10,
  },
});

export default UIModal;