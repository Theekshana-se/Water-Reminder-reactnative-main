import { useState } from "react";
import { Image, StyleSheet, Text, View, StatusBar, ImageBackground } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from "../../../components/Buttons/Button";
import Icon from 'react-native-vector-icons/Ionicons';
import { GlobalStyles } from "../../../constants/styles";
import { updateUserAge } from '../../../lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AGES = Array.from({ length: 83 }, (_, i) => i + 18);

const Age = () => {
    const [age, setAge] = useState(25);
    const navigation = useNavigation();
    const route = useRoute();
    const { weight, selectedGender, userId } = route.params || {};

    const nextPageHandler = async () => {
        try {
            let effectiveUserId = userId;
            if (!effectiveUserId) {
                console.warn('userId is missing in route.params, attempting to fetch from AsyncStorage');
                effectiveUserId = await AsyncStorage.getItem('accountId');
                if (!effectiveUserId) {
                    console.error('userId is missing in Age screen and AsyncStorage');
                    return;
                }
            }
            console.log('Saving age:', age, 'for userId:', effectiveUserId);
            await updateUserAge(age, effectiveUserId);
            console.log('Age saved successfully, navigating to ActivityLevelScreen with userId:', effectiveUserId);
            navigation.navigate("ActivityLevelScreen", { age, weight, selectedGender, userId: effectiveUserId });
        } catch (error) {
            console.error('Failed to save age:', error);
        }
    };

    const goBackHandler = () => {
        navigation.navigate('Weight', { selectedGender, userId });
    };

    const ageChangeHandler = ({ item }) => {
        setAge(item.value);
    };

    const ageImage =
        selectedGender === "male"
            ? require("../../../assets/weights/weight-male.png")
            : require("../../../assets/weights/weight-female.png");

    const textColorAge =
        selectedGender === "male"
            ? styles.maleActiveTextColor
            : styles.femaleActiveTextColor;

    const backgroundImage = require("../../../assets/splash.png");

    return (
        <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
                <Text style={styles.title}>Age</Text>
                <Text style={styles.subtitle}>
                    Your water needs change with age. Let’s make sure you’re staying hydrated at every stage.
                </Text>
                <Text style={styles.subtitle}>
                    Accurate age information helps us customize your water intake recommendations.
                </Text>

                <View style={styles.ageContainer}>
                    <Text style={styles.ageText}>{age}</Text>
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
                        initialSelectedIndex={6}
                        onChange={ageChangeHandler}
                        items={AGES.map((value) => ({ label: value, value: value }))}
                    />
                </View>

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

export default Age;
    
    const styles = StyleSheet.create({
      background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
      backgroundImage: {
        opacity: 0.1, // Reduce opacity of the background image
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
      ageContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginVertical: 20,
      },
      ageText: {
        fontSize: 48, // Larger font size for the age number
        fontWeight: "bold",
        color: GlobalStyles.colors.primary400,
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