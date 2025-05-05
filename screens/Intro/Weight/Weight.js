import { useState } from "react";
import { Image, StyleSheet, Text, View, StatusBar, ImageBackground } from "react-native";
import { useNavigation } from '@react-navigation/native';
import WheelPickerExpo from "react-native-wheel-picker-expo";
import Button from "../../../components/Buttons/Button";
import Icon from 'react-native-vector-icons/Ionicons';
import { GlobalStyles } from "../../../constants/styles";
import { updateUserWeight } from '../../../lib/appwrite'; // Import the function
import Navigation from "../../../navigation/Navigation";

const WEIGHTS = Array.from({ length: 81 }, (_, i) => i + 40); // Generates weights from 40kg to 120kg

const Weight = ({ selectedGender }) => {
  const [weight, setWeight] = useState(48); // Start with 48kg as in the example image
  const navigation = useNavigation();

  const nextPageHandler = async () => {
    try {
      await updateUserWeight(weight);
      console.log('Weight saved successfully');
      navigation.navigate('Age', { weight, selectedGender });
    } catch (error) {
      console.error('Failed to save weight:', error);
    }
  };

  const goBackHandler = () => {
    navigation.navigate('GenderScreen');
  };

  const weightChangeHandler = ({ item }) => {
    setWeight(item.value);
  };

  //const backgroundImage = require("../../../assets/weightscreen.png"); // Background image path

  return (
    <ImageBackground style={styles.background} imageStyle={styles.backgroundImage}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
        <Text style={styles.title}>Weight</Text>
        <Text style={styles.subtitle}>
          Our weight plays a key role in determining how much water your body needs daily.
        </Text>
        <Text style={styles.subtitle}>
          Accurate weight information helps us customize your water intake recommendations.
        </Text>

        <View style={styles.weightContainer}>
          <Text style={styles.weightText}>{weight}</Text>
          <Text style={styles.kgText}>KG</Text>
        </View>

        <View style={styles.imageContainer}>
          <WheelPickerExpo
            backgroundColor="#F2F2F2"
            height={180}
            width={60}
            renderItem={(props) => (
              <View>
                <Text style={styles.pickerText}>{props.label}</Text>
              </View>
            )}
            initialSelectedIndex={8} // Start with the 48kg as the selected value
            onChange={weightChangeHandler}
            items={WEIGHTS.map((value) => ({ label: value, value: value }))}
          />
        </View>

        {/* Button container with back and next buttons */}
        <View style={styles.buttonContainer}>
          <Button buttonStyles={styles.button} onPress={goBackHandler}>
            <Icon name="chevron-back-outline" size={24} color={GlobalStyles.colors.white} />
          </Button>

          <Button buttonStyles={styles.button} onPress={nextPageHandler}>
            <Text style={styles.buttonText}>Next</Text>
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Weight;

const styles = StyleSheet.create({
   background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    //position: "relative", // Ensure the image stays within the container
  },
  backgroundImage: {
    width: 300, // Adjusted width for larger image
    height: 300, // Adjusted height for larger image
    position: "absolute", // Keep the image centered relative to the screen
    top: "50%", // Center it vertically
    left: "50%", // Center it horizontally
    transform: [{ translateX: -130 }, { translateY: -100 }], // Half of the width and height (200px), centers the image properly
    opacity: 0.5, // Control the opacity as needed
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: GlobalStyles.colors.primary400,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 30,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 20,
  },
  weightText: {
    fontSize: 48, // Larger font size for the weight number
    fontWeight: "bold",
    color: GlobalStyles.colors.primary400,
  },
  kgText: {
    fontSize: 24,
    color: "#555",
    marginLeft: 10,
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  pickerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: GlobalStyles.colors.primary400,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    backgroundColor: GlobalStyles.colors.primary400,
    paddingVertical: 10,
    width: "45%",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", // Center content vertically
  },
  buttonText: {
    color: GlobalStyles.colors.white,
    fontWeight: "bold",
    fontSize: 18,
    textTransform: "uppercase",
    textAlign: 'center', // Ensure the text is centered
  },
});