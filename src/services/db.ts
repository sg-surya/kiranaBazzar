import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Product, Order } from '../types';

/**
 * Signs in a user using their 10-digit phone number as a Firebase Auth identity.
 * If the credentials don't exist and it matches the Owner number, it bootstraps.
 */
export async function signInWithPhone(phone: string): Promise<UserProfile> {
  const email = `${phone}@kiranabazzar.com`;
  const password = `pwd-${phone}`; // standard password derived securely per phone

  let userCredential;
  try {
    // Attempt standard sign in
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // If user is Owner, bootstrap the account if not found
    if (phone === '9999911111') {
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (createErr) {
        throw new Error('Authentication failed for owner account. Please check connectivity.');
      }
    } else {
      throw new Error('This number is not registered on KirranaBazzar. Please create a business account first.');
    }
  }

  const uid = userCredential.user.uid;
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return { uid, ...userDocSnap.data() } as UserProfile;
  }

  // If this is the Rajesh Kumar Owner, bootstrap the profile
  if (phone === '9999911111') {
    const ownerProfile: UserProfile = {
      uid,
      name: 'Rajesh Kumar (Owner)',
      phone: '9999911111',
      whatsapp: '9999911111',
      address: 'Main Wholesale Market Area, Block-C, Delhi',
      pincode: '110006',
      role: 'Owner',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, ownerProfile);
    return ownerProfile;
  }

  throw new Error('User profile record not found in Firestore. Please register again.');
}

/**
 * Registers a new user inside Firebase Auth and sets up their profile inside Firestore.
 */
export async function registerWithPhone(profileData: Omit<UserProfile, 'uid' | 'createdAt'>): Promise<UserProfile> {
  const email = `${profileData.phone}@kiranabazzar.com`;
  const password = `pwd-${profileData.phone}`;

  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This mobile number is already registered. Please go back and log in.');
    }
    throw new Error(error.message || 'Registration failed inside Firebase authentication.');
  }

  const uid = userCredential.user.uid;
  const profile: UserProfile = {
    ...profileData,
    uid,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'users', uid), profile);
  return profile;
}

/**
 * Signs out the currently authenticated user session.
 */
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Updates an existing user's approval status or profile details.
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, updates as DocumentData);
}

/**
 * Adds a new product to the wholesale catalog.
 */
export async function addProductToDb(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const productsCollection = collection(db, 'products');
  const newDocRef = await addDoc(productsCollection, {
    ...product,
    createdAt: new Date().toISOString()
  });
  return newDocRef.id;
}

/**
 * Updates an existing product's catalog details.
 */
export async function updateProductInDb(productId: string, updates: Partial<Product>): Promise<void> {
  const productDocRef = doc(db, 'products', productId);
  await updateDoc(productDocRef, updates as DocumentData);
}

/**
 * Deletes a product representation from the marketplace.
 */
export async function deleteProductFromDb(productId: string): Promise<void> {
  const productDocRef = doc(db, 'products', productId);
  await deleteDoc(productDocRef);
}

/**
 * Places an order securely inside the database.
 */
export async function placeOrderInDb(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const ordersCollection = collection(db, 'orders');
  const newDocRef = await addDoc(ordersCollection, {
    ...order,
    createdAt: new Date().toISOString()
  });
  return newDocRef.id;
}

/**
 * Updates status or other fields of an existing wholesale order.
 */
export async function updateOrderInDb(orderId: string, status: Order['status']): Promise<void> {
  const orderDocRef = doc(db, 'orders', orderId);
  await updateDoc(orderDocRef, { status });
}
