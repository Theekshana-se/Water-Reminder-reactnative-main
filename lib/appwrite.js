import { Account, Client, ID, Databases, Query } from 'appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '66fad7d00019dfe1b467',
    databaseId: '66fad9b2001d11a7fe7c',
    userCollectionId: '66fad9dc0012ad58aa89',
    waterbottlecollectionid: '67e3791b0007897983cc',
    waterfillingcollectionid: '67e37a2f000b08b690c9',
    storageId: '66fadc270005ccc67004',
    diseasePlansCollectionId: '681fb4b50015386144ab',
    waterIntakeLogsCollectionId: '681fb505000cbd8e073d',
    hydrationReportsCollectionId: '681fb565000449dd0421',
    beveragesCollectionId: '682116d00005d4a54dd2'
};

const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const account = new Account(client);
const databases = new Databases(client);

//Create shop function

export const createShop = async (shopData, isWaterBottleShop) => {
  const collectionId = isWaterBottleShop ? config.waterbottlecollectionid : config.waterfillingcollectionid;

  const validatedShopData = {
    name: shopData.name || '',
    latitude: parseFloat(shopData.latitude) || 0,
    longitude: parseFloat(shopData.longitude) || 0,
    address: shopData.address || '',
    phone: shopData.phone || '',
    hours: shopData.hours || '',
    license: shopData.license || '',
    image: shopData.image || 'https://example.com/default-shop.jpg',
    email: shopData.email || '',
  };

  console.log('Creating shop in collection:', collectionId);
  console.log('Validated shop data:', validatedShopData);

  try {
    const response = await databases.createDocument(
      config.databaseId,
      collectionId,
      ID.unique(),
      validatedShopData
    );
    console.log('Shop created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating shop:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response,
    });
    throw error;
  }
};

//fetch shop data from db

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

export const fetchShopById = async (shopId, isWaterBottleShop) => {
  const collections = [
    isWaterBottleShop !== false ? config.waterbottlecollectionid : config.waterfillingcollectionid,
    isWaterBottleShop !== false ? config.waterfillingcollectionid : config.waterbottlecollectionid,
  ];

  for (const collectionId of collections) {
    try {
      console.log('Fetching shop with ID:', shopId, 'from collection:', collectionId);
      const response = await databases.getDocument(config.databaseId, collectionId, shopId);
      console.log('Fetched shop:', response);
      return response;
    } catch (error) {
      if (error.code !== 404) {
        console.error('Error fetching shop from collection:', {
          message: error.message,
          code: error.code,
          shopId,
          collectionId,
        });
        throw error;
      }
      console.log('Shop not found in collection:', collectionId);
    }
  }

  console.error('Shop not found in any collection:', { shopId });
  throw new Error('Document not found');
};

//update shop function

export const updateShop = async (shopId, shopData, isWaterBottleShop) => {
  const collections = [
    isWaterBottleShop !== false ? config.waterbottlecollectionid : config.waterfillingcollectionid,
    isWaterBottleShop !== false ? config.waterfillingcollectionid : config.waterbottlecollectionid,
  ];

  for (const collectionId of collections) {
    try {
      console.log('Updating shop:', { shopId, shopData, collectionId });
      const response = await databases.updateDocument(
        config.databaseId,
        collectionId,
        shopId,
        shopData
      );
      console.log('Shop updated:', response);
      return response;
    } catch (error) {
      if (error.code !== 404) {
        console.error('Error updating shop in collection:', {
          message: error.message,
          code: error.code,
          shopId,
          collectionId,
        });
        throw error;
      }
      console.log('Shop not found in collection:', collectionId);
    }
  }

  console.error('Shop not found in any collection:', { shopId });
  throw new Error('Document not found');
};

//delete shop function

export const deleteShop = async (shopId, isWaterBottleShop) => {
  const collections = [
    isWaterBottleShop !== false ? config.waterbottlecollectionid : config.waterfillingcollectionid,
    isWaterBottleShop !== false ? config.waterfillingcollectionid : config.waterbottlecollectionid,
  ];

  for (const collectionId of collections) {
    try {
      console.log('Deleting shop with ID:', shopId, 'from collection:', collectionId);
      await databases.deleteDocument(config.databaseId, collectionId, shopId);
      console.log('Shop deleted:', shopId);
      return;
    } catch (error) {
      if (error.code !== 404) {
        console.error('Error deleting shop from collection:', {
          message: error.message,
          code: error.code,
          shopId,
          collectionId,
        });
        throw error;
      }
      console.log('Shop not found in collection:', collectionId);
    }
  }

  console.error('Shop not found in any collection:', { shopId });
  throw new Error('Document not found');
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

export const updateUserGender = async (accountId, gender) => {
  try {
      if (!accountId) {
          throw new Error('accountId is required');
      }

      const userDocument = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountid', accountId)]
      );

      if (userDocument.documents.length === 0) {
          throw new Error('No user document found with the given accountid');
      }

      const documentId = userDocument.documents[0].$id;

      const updatedDocument = await databases.updateDocument(
          config.databaseId,
          config.userCollectionId,
          documentId,
          { gender }
      );

      console.log('Gender updated:', updatedDocument);
      return updatedDocument;
  } catch (error) {
      console.error('Error updating gender:', error);
      throw error;
  }
};

export const updateUserAge = async (age, accountId) => {
  try {
      if (!accountId) {
          throw new Error('accountId is required');
      }
      console.log('Updating age for accountId:', accountId);
      const userDocument = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountid', accountId)]
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

export const updateUserWeight = async (weight, accountId) => {
  try {
      if (!accountId) {
          throw new Error('accountId is required');
      }
      console.log('Updating weight for accountId:', accountId);
      const userDocument = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountid', accountId)]
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

export const updateWakeUpTime = async (wakeUpTime, accountId) => {
  try {
      if (!accountId) {
          throw new Error('accountId is required');
      }

      const userDocument = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountid', accountId)]
      );

      if (userDocument.documents.length === 0) {
          throw new Error('No user document found with the given accountid');
      }

      const documentId = userDocument.documents[0].$id;

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

export const updateBedtime = async (bedtime, accountId) => {
  try {
      if (!accountId) {
          throw new Error('accountId is required');
      }

      const userDocument = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountid', accountId)]
      );

      if (userDocument.documents.length === 0) {
          throw new Error('No user document found with the given accountid');
      }

      const documentId = userDocument.documents[0].$id;

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


//disease plans  


// Fetch all disease plans
export const fetchDiseasePlans = async () => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.diseasePlansCollectionId
    );
    const plans = response.documents.map((plan) => {
      try {
        return {
          ...plan,
          schedule: plan.schedule ? JSON.parse(plan.schedule) : {},
          tips: plan.tips ? JSON.parse(plan.tips) : [],
          milestones: plan.milestones ? JSON.parse(plan.milestones) : []
        };
      } catch (parseError) {
        console.error(`[fetchDiseasePlans] Error parsing JSON for plan ${plan.name} (ID: ${plan.$id}):`, parseError.message);
        console.error('[fetchDiseasePlans] Invalid fields:', {
          schedule: plan.schedule,
          tips: plan.tips,
          milestones: plan.milestones
        });
        return null;
      }
    }).filter(plan => plan !== null);
    console.log('[fetchDiseasePlans] Fetched disease plans:', plans);
    return plans;
  } catch (error) {
    console.error('[fetchDiseasePlans] Error fetching disease plans:', error);
    throw error;
  }
};

// Select a disease plan
export const selectDiseasePlan = async (accountId, diseaseName) => {
  try {
    // Validate accountId
    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Invalid accountId provided');
    }
    console.log('[selectDiseasePlan] Selecting plan for accountId:', accountId);

    // Verify authenticated user
    const currentUser = await account.get();
    if (currentUser.$id !== accountId) {
      throw new Error('AccountId does not match authenticated user');
    }

    const userDocument = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountid', accountId)]
    );

    if (userDocument.documents.length === 0) {
      throw new Error('No user document found with the given accountid');
    }

    const diseasePlan = await databases.listDocuments(
      config.databaseId,
      config.diseasePlansCollectionId,
      [Query.equal('name', diseaseName)]
    );

    if (diseasePlan.documents.length === 0) {
      throw new Error('No disease plan found with the given name');
    }

    const user = userDocument.documents[0];
    const plan = diseasePlan.documents[0];
    let recommendedIntake = parseFloat(String(plan.recommendedIntake));

    const weight = parseFloat(user.weight) || 60;
    if (diseaseName === 'Dengue Fever' && weight > 50) {
      recommendedIntake += 0.02 * (weight - 50);
    } else if (diseaseName === 'Chronic Kidney Disease' && weight > 70) {
      recommendedIntake -= 0.01 * (weight - 70);
    } else if (diseaseName === 'Heart Failure' && weight > 80) {
      recommendedIntake -= 0.01 * (weight - 80);
    } else if (['Gastritis', 'Hypertension', 'Diabetes', 'Liver Disease', 'Asthma'].includes(diseaseName) && weight > 60) {
      recommendedIntake += 0.01 * (weight - 60);
    } else if (['Urinary Tract Infections', 'Kidney Stones'].includes(diseaseName) && weight > 50) {
      recommendedIntake += 0.02 * (weight - 50);
    }

    const documentId = user.$id;
    const updatedDocument = await databases.updateDocument(
      config.databaseId,
      config.userCollectionId,
      documentId,
      {
        selectedDisease: diseaseName,
        usesDiseasePlan: true,
        diseaseWaterGoal: recommendedIntake, // Changed to Float
        lastDiseaseUpdate: new Date().toISOString(),
        dailygoal: recommendedIntake.toString() // Kept as String
      }
    );
    console.log('[selectDiseasePlan] Disease plan selected:', updatedDocument);
    return updatedDocument;
  } catch (error) {
    console.error('[selectDiseasePlan] Error selecting disease plan:', error);
    throw error;
  }
};

// Fetch user disease plan details
export const fetchUserDiseasePlan = async (accountId) => {
  try {
    // Validate accountId
    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Invalid accountId provided');
    }

    const userDocument = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountid', accountId)]
    );

    if (userDocument.documents.length === 0) {
      throw new Error('No user document found with the given accountid');
    }

    const userData = userDocument.documents[0];
    if (!userData.usesDiseasePlan) {
      return {
        selectedDisease: null,
        usesDiseasePlan: false,
        diseaseWaterGoal: null,
        lastDiseaseUpdate: null,
        dailygoal: userData.dailygoal ? parseFloat(userData.dailygoal) : null
      };
    }

    const plan = await databases.listDocuments(
      config.databaseId,
      config.diseasePlansCollectionId,
      [Query.equal('name', userData.selectedDisease)]
    );

    if (plan.documents.length === 0) {
      throw new Error('Selected disease plan not found');
    }

    const planData = plan.documents[0];
    return {
      selectedDisease: userData.selectedDisease,
      usesDiseasePlan: userData.usesDiseasePlan,
      diseaseWaterGoal: userData.diseaseWaterGoal, // Already a Float
      lastDiseaseUpdate: userData.lastDiseaseUpdate,
      dailygoal: userData.dailygoal ? parseFloat(userData.dailygoal) : null,
      schedule: planData.schedule ? JSON.parse(planData.schedule) : {},
      tips: planData.tips ? JSON.parse(planData.tips) : [],
      milestones: planData.milestones ? JSON.parse(planData.milestones) : []
    };
  } catch (error) {
    console.error('[fetchUserDiseasePlan] Error fetching user disease plan:', error);
    throw error;
  }
};

// Log water intake
export const logWaterIntake = async (accountId, amount, diseasePlanName) => {
  try {
    // Validate accountId
    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Invalid accountId provided');
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a valid positive number');
    }

    const userDocument = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountid', accountId)]
    );

    if (userDocument.documents.length === 0) {
      throw new Error('No user document found with the given accountid');
    }

    const log = await databases.createDocument(
      config.databaseId,
      config.waterIntakeLogsCollectionId,
      ID.unique(),
      {
        userId: accountId,
        amount: parseFloat(amount), // Changed to Float
        timestamp: new Date().toISOString(),
        diseasePlanName: diseasePlanName || null
      }
    );

    const currentConsumption = parseFloat(userDocument.documents[0].waterConsumption) || 0;
    const newConsumption = currentConsumption + parseFloat(amount);
    await databases.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userDocument.documents[0].$id,
      {
        waterConsumption: newConsumption.toString()
      }
    );

    console.log('[logWaterIntake] Water intake logged:', log);
    return log;
  } catch (error) {
    console.error('[logWaterIntake] Error logging water intake:', error);
    throw error;
  }
};

// Fetch water intake logs
export const fetchWaterIntakeLogs = async (accountId, fromDate, toDate) => {
  try {
    // Validate accountId
    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Invalid accountId provided');
    }

    const queries = [Query.equal('userId', accountId)];
    if (fromDate && toDate) {
      queries.push(Query.between('timestamp', fromDate, toDate));
    }
    const response = await databases.listDocuments(
      config.databaseId,
      config.waterIntakeLogsCollectionId,
      queries
    );
    console.log('[fetchWaterIntakeLogs] Fetched water intake logs:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('[fetchWaterIntakeLogs] Error fetching water intake logs:', error);
    throw error;
  }
};

// Generate hydration report
export const generateHydrationReport = async (accountId, fromDate, toDate, fileId) => {
  try {
    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Invalid accountId provided');
    }
    if (!fileId) {
      throw new Error('Invalid fileId provided');
    }

    const report = await databases.createDocument(
      config.databaseId,
      config.hydrationReportsCollectionId,
      ID.unique(),
      {
        userId: accountId,
        fromDate,
        toDate,
        fileId,
        createdAt: new Date().toISOString()
      }
    );
    console.log('[generateHydrationReport] Report created:', report);
    return report;
  } catch (error) {
    console.error('[generateHydrationReport] Error creating report:', error);
    throw error;
  }
};

//beveragers   


export const createBeverage = async (userId, name, emoji, hydrationLevel) => {
  try {
    const response = await databases.createDocument(
      config.databaseId,
      config.beveragesCollectionId,
      ID.unique(),
      {
        userId,
        name,
        emoji,
        hydrationLevel: parseFloat(hydrationLevel),
      }
    );
    return response;
  } catch (error) {
    throw new Error('Failed to create beverage: ' + error.message);
  }
};

export const fetchBeverages = async (userId) => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.beveragesCollectionId,
      [Query.equal('userId', userId)]
    );
    return response.documents;
  } catch (error) {
    throw new Error('Failed to fetch beverages: ' + error.message);
  }
};

export const updateBeverage = async (beverageId, name, emoji, hydrationLevel) => {
  try {
    const response = await databases.updateDocument(
      config.databaseId,
      config.beveragesCollectionId,
      beverageId,
      {
        name,
        emoji,
        hydrationLevel: parseFloat(hydrationLevel),
      }
    );
    return response;
  } catch (error) {
    throw new Error('Failed to update beverage: ' + error.message);
  }
};

export const deleteBeverage = async (beverageId) => {
  try {
    await databases.deleteDocument(
      config.databaseId,
      config.beveragesCollectionId,
      beverageId
    );
  } catch (error) {
    throw new Error('Failed to delete beverage: ' + error.message);
  }
};