import { Account, Client, ID, Databases, Query } from 'appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '66fad7d00019dfe1b467',
    databaseId: '66fad9b2001d11a7fe7c',
    userCollectionId: '66fad9dc0012ad58aa89',
    waterbottlecollectionid: '67e3791b0007897983cc',
    waterfillingcollectionid: '67e37a2f000b08b690c9',
    storageId: '66fadc270005ccc67004'
};

const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const account = new Account(client);
const databases = new Databases(client);

export const createShop = async (shopData, isWaterBottleShop) => {
  const collectionId = isWaterBottleShop ? config.waterbottlecollectionid : config.waterfillingcollectionid;

  const validatedShopData = {
    name: shopData.name,
    latitude: parseFloat(shopData.latitude),
    longitude: parseFloat(shopData.longitude),
    address: shopData.address,
    phone: shopData.phone,
    hours: shopData.hours,
    license: shopData.license,
    image: shopData.image,
    email: shopData.email,
  };

  try {
    const response = await databases.createDocument(
      config.databaseId,
      collectionId,
      ID.unique(),
      validatedShopData
    );
    console.log('Shop created:', response);
    return response;
  } catch (error) {
    console.error('Error creating shop:', error);
    throw error;
  }
};

export const fetchShops = async (isWaterBottleShop) => {
  const collectionId = isWaterBottleShop ? config.waterbottlecollectionid : config.waterfillingcollectionid;
  try {
    const response = await databases.listDocuments(config.databaseId, collectionId);
    console.log('Fetched shops:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error fetching shops:', error);
    throw error;
  }
};

export const updateShop = async (shopId, shopData, isWaterBottleShop) => {
  const collectionId = isWaterBottleShop ? config.waterbottlecollectionid : config.waterfillingcollectionid;
  try {
    const response = await databases.updateDocument(
      config.databaseId,
      collectionId,
      shopId,
      shopData
    );
    console.log('Shop updated:', response);
    return response;
  } catch (error) {
    console.error('Error updating shop:', error);
    throw error;
  }
};

export const deleteShop = async (shopId, isWaterBottleShop) => {
  const collectionId = isWaterBottleShop ? config.waterbottlecollectionid : config.waterfillingcollectionid;
  try {
    await databases.deleteDocument(config.databaseId, collectionId, shopId);
    console.log('Shop deleted:', shopId);
  } catch (error) {
    console.error('Error deleting shop:', error);
    throw error;
  }
};

export const createUser = async (email, password, username, profilePicUrl, phoneNumber) => {
    try {
        // Validate phoneNumber
        const parsedPhoneNumber = phoneNumber ? parseInt(phoneNumber, 10) : null;
        if (phoneNumber && isNaN(parsedPhoneNumber)) {
            throw new Error('Phone number must be a valid numeric value');
        }

        // Validate profilePicUrl
        const validProfilePicUrl = profilePicUrl && /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(profilePicUrl) ? profilePicUrl : null;

        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw new Error('Failed to create account');

        const session = await account.createEmailPasswordSession(email, password);
        console.log('Session created for new user:', session);

        const newUserDocument = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountid: newAccount.$id,
                username: username,
                email: email,
                profilepic: validProfilePicUrl, // Use null if not a valid URL
                phonenumber: parsedPhoneNumber,
                waterConsumption: "0",
                dailygoal: null,
                age: null,
                weight: null,
                wakeUpTime: null,
                bedtime: null
            }
        );

        await AsyncStorage.setItem('accountId', newAccount.$id);
        console.log('Stored accountId in AsyncStorage:', newAccount.$id);

        return { userDocument: newUserDocument, session };
    } catch (error) {
        console.error('Error creating user:', error);
        // Clean up session to prevent orphaned login
        try {
            await account.deleteSession('current');
            console.log('Cleaned up orphaned session');
        } catch (cleanupError) {
            console.error('Error cleaning up session:', cleanupError);
        }
        throw new Error(error.message);
    }
};

export const loginUser = async (email, password) => {
    try {
      const currentUser = await account.get();
      if (currentUser) {
        console.log('User is already logged in:', currentUser);
        // Check if user document exists
        const userDocument = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountid', currentUser.$id)]
        );
        if (userDocument.documents.length === 0) {
          console.log('No user document found, clearing session and AsyncStorage');
          await account.deleteSession('current');
          await AsyncStorage.clear();
          throw new Error('No user document found. Please register again.');
        }
        return { session: null, accountId: currentUser.$id };
      }
    } catch (error) {
      if (error.code !== 401) {
        console.error('Unexpected error while checking user:', error);
        throw error;
      }
    }

    try {
      console.log(`Attempting to log in with email: ${email}`);
      const session = await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      const accountId = currentUser.$id;

      if (!accountId) {
        console.error("Account ID is missing.");
        throw new Error("Unable to retrieve Account ID.");
      }

      // Check if user document exists
      const userDocument = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal('accountid', accountId)]
      );
      if (userDocument.documents.length === 0) {
        console.log('No user document found, clearing session and AsyncStorage');
        await account.deleteSession('current');
        await AsyncStorage.clear();
        throw new Error('No user document found. Please register again.');
      }

      await AsyncStorage.setItem('accountId', accountId);
      console.log('Stored accountId in AsyncStorage:', accountId);

      return { session, accountId };
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error(error.message || 'Invalid email or password. Please verify your credentials.');
    }
};

export const getCurrentUser = async () => {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
    }
};

export { account };

export const updateUserWaterConsumption = async (waterConsumption, dailyGoal, accountId) => {
    try {
        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', accountId)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        const documentId = userDocument.documents[0].$id;
        const waterConsumptionStr = waterConsumption.toString();
        const dailyGoalStr = dailyGoal.toString();

        console.log('Updating water consumption:', { waterConsumptionStr, dailyGoalStr });

        const updatedDocument = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            documentId,
            {
                waterConsumption: waterConsumptionStr,
                dailygoal: dailyGoalStr
            }
        );
        console.log('Water consumption updated:', updatedDocument);
        return updatedDocument;
    } catch (error) {
        console.error('Error updating water consumption:', error);
        throw error;
    }
};

export const fetchUserWaterConsumption = async (accountId) => {
    try {
        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', accountId)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        const userData = userDocument.documents[0];
        return {
            waterConsumption: parseFloat(userData.waterConsumption) || 0,
            dailyGoal: parseFloat(userData.dailygoal) || null
        };
    } catch (error) {
        console.error('Error fetching user water consumption:', error);
        throw error;
    }
};

export const updateUserAge = async (age) => {
    try {
        const user = await account.get();
        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', user.$id)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        const documentId = userDocument.documents[0].$id;
        const ageStr = age.toString();

        const updatedDocument = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            documentId,
            { age: ageStr }
        );

        console.log('Age updated:', updatedDocument);
        return updatedDocument;
    } catch (error) {
        console.error('Error updating age:', error);
        throw error;
    }
};

export const fetchUserAge = async () => {
    try {
        const user = await account.get();
        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', user.$id)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        return userDocument.documents[0].age;
    } catch (error) {
        console.error('Error fetching user age:', error);
        throw error;
    }
};

export const updateUserWeight = async (weight) => {
    try {
        const user = await account.get();
        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', user.$id)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        const documentId = userDocument.documents[0].$id;
        const weightStr = weight.toString();

        const updatedDocument = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            documentId,
            { weight: weightStr }
        );

        console.log('Weight updated:', updatedDocument);
        return updatedDocument;
    } catch (error) {
        console.error('Error updating weight:', error);
        throw error;
    }
};

export const fetchUserWeight = async () => {
    try {
        const user = await account.get();
        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', user.$id)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        return userDocument.documents[0].weight;
    } catch (error) {
        console.error('Error fetching user weight:', error);
        throw error;
    }
};

export const fetchUserEmailAndPhone = async () => {
    try {
        const user = await account.get();
        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', user.$id)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        const userData = userDocument.documents[0];
        return {
            email: userData.email,
            phoneNumber: userData.phonenumber,
            username: userData.username
        };
    } catch (error) {
        console.error('Error fetching user email and phone:', error);
        throw error;
    }
};

export const updateProfilePicture = async (imageUri) => {
    try {
      const user = await account.get();
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const file = await storage.createFile(config.storageId, ID.unique(), formData);

      const userDocument = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal('accountid', user.$id)]
      );

      if (userDocument.documents.length > 0) {
        const documentId = userDocument.documents[0].$id;
        await databases.updateDocument(config.databaseId, config.userCollectionId, documentId, {
          profilepic: file.$id
        });
      }

      console.log('Profile picture updated:', file.$id);
      return file.$id;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
};

export const updateWakeUpTime = async (wakeUpTime) => {
    try {
        const user = await account.get();
        console.log('Current User:', user.$id);

        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', user.$id)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        const documentId = userDocument.documents[0].$id;
        console.log('User Document Found:', documentId);

        const updatedDocument = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            documentId,
            { wakeUpTime }
        );

        console.log('Wake-up time updated:', updatedDocument);
        return updatedDocument;
    } catch (error) {
        console.error('Error updating wake-up time:', error);
        throw error;
    }
};

export const fetchUserWakeUpTime = async () => {
    try {
      const user = await account.get();
      const userDocument = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal('accountid', user.$id)]
      );

      if (userDocument.documents.length === 0) {
        throw new Error('No user document found with the given accountid');
      }

      return userDocument.documents[0].wakeUpTime;
    } catch (error) {
      console.error('Error fetching user wake-up time:', error);
      throw error;
    }
};

export const updateBedtime = async (bedtime) => {
    try {
        const user = await account.get();
        console.log('Current User:', user.$id);

        const userDocument = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountid', user.$id)]
        );

        if (userDocument.documents.length === 0) {
            throw new Error('No user document found with the given accountid');
        }

        const documentId = userDocument.documents[0].$id;
        console.log('User Document Found:', documentId);

        const updatedDocument = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            documentId,
            { bedtime }
        );

        console.log('Bedtime updated:', updatedDocument);
        return updatedDocument;
    } catch (error) {
        console.error('Error updating bedtime:', error);
        throw error;
    }
};

export const fetchUserBedtime = async () => {
    try {
      const user = await account.get();
      const userDocument = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal('accountid', user.$id)]
      );

      if (userDocument.documents.length === 0) {
        throw new Error('No user document found with the given accountid');
      }

      return userDocument.documents[0].bedtime;
    } catch (error) {
      console.error('Error fetching user bedtime:', error);
      throw error;
    }
};

export const updateUserEmailAndPhone = async ({ email, phoneNumber }) => {
    try {
      const user = await account.get();
      const userDocument = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal('accountid', user.$id)]
      );

      if (userDocument.documents.length === 0) {
        throw new Error('No user document found with the given accountid');
      }

      const documentId = userDocument.documents[0].$id;
      const parsedPhoneNumber = phoneNumber ? parseInt(phoneNumber, 10) : null;

      const updatedDocument = await databases.updateDocument(
        config.databaseId,
        config.userCollectionId,
        documentId,
        { email, phonenumber: parsedPhoneNumber }
      );

      console.log('Email and phone number updated:', updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error('Error updating email and phone:', error);
      throw error;
    }
};