import { useState } from "react";
import { Image, StyleSheet, View, Text, StatusBar } from "react-native";
import Button from "../../../components/Buttons/Button";
import { WEIGHT_SCREEN } from "../../../constants/screens";
import { GENDER_KEY } from "../../../constants/storage";
import { GlobalStyles } from "../../../constants/styles";
import { getItem, setItem } from "../../../storage/database";
import { updateUserGender } from "../../../lib/appwrite";

const Gender = ({ onNextPage, userId }) => {
    const [maleImageSelected, setMaleImageSelected] = useState(true);
    const [femaleImageSelected, setFemaleImageSelected] = useState(false);

    console.log('Gender screen userId:', userId);

    const maleSelectedHandler = async () => {
        setMaleImageSelected(true);
        setFemaleImageSelected(false);
        try {
            await setItem(GENDER_KEY, "male");
            if (userId) {
                await updateUserGender(userId, "male");
            } else {
                console.warn('userId is missing in Gender screen');
            }
            console.log('Gender set to male');
        } catch (error) {
            console.error('Error setting gender:', error);
        }
    };

    const femaleSelectedHandler = async () => {
        setMaleImageSelected(false);
        setFemaleImageSelected(true);
        try {
            await setItem(GENDER_KEY, "female");
            if (userId) {
                await updateUserGender(userId, "female");
            } else {
                console.warn('userId is missing in Gender screen');
            }
            console.log('Gender set to female');
        } catch (error) {
            console.error('Error setting gender:', error);
        }
    };

    const nextPageHandler = async () => {
        try {
            const gender = (await getItem(GENDER_KEY)) || "male";
            console.log('Navigating to:', WEIGHT_SCREEN, 'with gender:', gender, 'userId:', userId);
            onNextPage({ gender, userId }, WEIGHT_SCREEN);
        } catch (error) {
            console.error('Error navigating to Weight screen:', error);
        }
    };

    const maleImageSource = maleImageSelected
        ? require("../../../assets/male1select.png")
        : require("../../../assets/male1.png");

    const femaleImageSource = femaleImageSelected
        ? require("../../../assets/femaleselect.png")
        : require("../../../assets/female.png");

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#fff" />
            <Text style={styles.title}>Let’s personalize your Daily Hydration Goal</Text>
            <Text style={styles.subtitle}>
                Gender influences how much water your body requires. Let’s ensure you’re meeting the right hydration goals.
            </Text>
            <View style={styles.genderContainer}>
                <View style={styles.genderImageContainer}>
                    <Button
                        onPress={maleSelectedHandler}
                        buttonStyles={styles.maleButton}
                    >
                        <Image source={maleImageSource} />
                        <Text
                            style={[
                                styles.textCenter,
                                maleImageSelected
                                    ? styles.maleActiveTextColor
                                    : { color: GlobalStyles.colors.primary200 },
                            ]}
                        >
                            Male
                        </Text>
                    </Button>

                    <Button
                        onPress={femaleSelectedHandler}
                        buttonStyles={styles.femaleButton}
                    >
                        <Image source={femaleImageSource} />
                        <Text
                            style={[
                                styles.textCenter,
                                femaleImageSelected
                                    ? styles.femaleActiveTextColor
                                    : { color: "#fa94bf" },
                            ]}
                        >
                            Female
                        </Text>
                    </Button>
                </View>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    width: "100%",
                    marginTop: "auto",
                }}
            >
                <Button buttonStyles={styles.button} onPress={nextPageHandler}>
                    <Text style={styles.buttonText}>Next</Text>
                </Button>
            </View>
        </View>
    );
};

export default Gender;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00aaff',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    genderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    genderImageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 400,
    },
    maleButton: {
        alignItems: 'center',
        padding: 10,
    },
    femaleButton: {
        alignItems: 'center',
        padding: 10,
    },
    textCenter: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 10,
    },
    maleActiveTextColor: {
        color: GlobalStyles.colors.primary500,
    },
    femaleActiveTextColor: {
        color: '#ff69b4',
    },
    button: {
        backgroundColor: '#00aaff',
        padding: 15,
        borderRadius: 10,
        width: 120,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});