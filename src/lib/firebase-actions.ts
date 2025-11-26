'use client';

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  orderBy,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import type { Country, InfoItem, Reservation, InfoCategory, Feedback } from './definitions';
import { slugify } from './utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// --- Test Action ---

export function testFirestoreWrite(db: Firestore): Promise<any> {
  const testCol = collection(db, 'test');
  const testData = {
    message: 'Hello from the app!',
    createdAt: serverTimestamp(),
  };
  
  // Return the promise chain
  return addDoc(testCol, testData).catch(error => {
    // On failure, create and emit the contextual permission error
    const permissionError = new FirestorePermissionError({
      path: testCol.path,
      operation: 'create',
      requestResourceData: testData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // It's important to re-throw the error to allow for local error handling if needed,
    // and to ensure the promise chain remains in a rejected state.
    throw error;
  });
}


// --- Country Actions ---

export async function fetchCountries(db: Firestore): Promise<Country[]> {
  const countriesCol = collection(db, 'countries');
  const countrySnapshot = await getDocs(query(countriesCol, orderBy('name', 'asc')));
  const countryList = countrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
  return countryList;
}

export async function getCountryData(db: Firestore, countrySlug: string): Promise<Country | null> {
    const q = query(collection(db, "countries"), where("slug", "==", countrySlug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Country;
}

export async function getCountryBySlug(db: Firestore, slug: string): Promise<Country | null> {
    const q = query(collection(db, "countries"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const countryDoc = querySnapshot.docs[0];
    return { id: countryDoc.id, ...countryDoc.data() } as Country;
}


export async function createOrUpdateCountry(db: Firestore, country: Omit<Country, 'id' | 'slug'>, id?: string): Promise<void> {
  const countrySlug = slugify(country.name);
  const countryData: Partial<Country> = { 
      ...country, 
      slug: countrySlug,
  };
  
  Object.keys(countryData).forEach(key => {
      const itemKey = key as keyof typeof countryData;
      if (countryData[itemKey] === '' || countryData[itemKey] === undefined || countryData[itemKey] === null) {
          delete countryData[itemKey];
      }
  });


  if (id) {
    const countryDoc = doc(db, 'countries', id);
    updateDoc(countryDoc, countryData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: countryDoc.path,
            operation: 'update',
            requestResourceData: countryData
        }))
    });
  } else {
    const countriesCol = collection(db, 'countries');
    addDoc(countriesCol, countryData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: countriesCol.path,
            operation: 'create',
            requestResourceData: countryData
        }))
    });
  }
}

export async function deleteCountry(db: Firestore, id: string): Promise<void> {
  const countryDoc = doc(db, 'countries', id);
  deleteDoc(countryDoc).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: countryDoc.path,
        operation: 'delete'
    }))
  });
  // Note: Deleting subcollections this way from the client is not recommended for large collections.
  // A batched write or a cloud function would be better.
  const infoItemsSnapshot = await getDocs(query(collection(db, 'infoItems'), where('countryId', '==', id)));
  const deletePromises = infoItemsSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

// --- Info Item Actions ---

export async function fetchAllInfoItems(db: Firestore): Promise<InfoItem[]> {
  const infoItemsCol = collection(db, 'infoItems');
  const infoItemSnapshot = await getDocs(infoItemsCol);
  const infoItemList = infoItemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InfoItem));
  return infoItemList;
}

export async function getItemsForCountry(db: Firestore, countrySlug: string): Promise<InfoItem[]> {
  const q = query(collection(db, 'infoItems'), where('countrySlug', '==', countrySlug));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InfoItem));
}

export async function getInfoItems(db: Firestore, countrySlug: string, category: InfoCategory): Promise<InfoItem[]> {
  const q = query(collection(db, 'infoItems'), where('countrySlug', '==', countrySlug), where('category', '==', category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InfoItem));
}

export async function getInfoItemById(db: Firestore, itemId: string): Promise<InfoItem | null> {
  const itemDocRef = doc(db, 'infoItems', itemId);
  const itemDoc = await getDoc(itemDocRef);
  if (itemDoc.exists()) {
    const data = itemDoc.data();
    return { id: itemDoc.id, ...data } as InfoItem;
  }
  return null;
}

export async function getInfoItemByName(db: Firestore, name: string): Promise<InfoItem | null> {
    const q = query(collection(db, "infoItems"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as InfoItem;
}

export async function createOrUpdateInfoItem(db: Firestore, item: Partial<InfoItem>, id?: string): Promise<string> {
  if (id) {
    const itemDoc = doc(db, 'infoItems', id);
    await updateDoc(itemDoc, item).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: itemDoc.path,
            operation: 'update',
            requestResourceData: item
        }))
        throw error;
    });
    return id;
  } else {
    const infoItemsCol = collection(db, 'infoItems');
    const docRef = await addDoc(infoItemsCol, item).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: infoItemsCol.path,
            operation: 'create',
            requestResourceData: item
        }))
        throw error;
    });
    return docRef.id;
  }
}

export async function deleteInfoItem(db: Firestore, id: string): Promise<void> {
  const itemDoc = doc(db, 'infoItems', id);
deleteDoc(itemDoc).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: itemDoc.path,
        operation: 'delete'
    }))
  });
}


// --- Reservation Actions ---

export async function addReservation(db: Firestore, reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<void> {
  const reservationsCol = collection(db, 'reservations');
  // No await here, let it run in the background
  addDoc(reservationsCol, {
    ...reservation,
    createdAt: serverTimestamp()
  }).then(docRef => {
    console.log("Reservation added with ID: ", docRef.id);
  }).catch(error => {
    console.error("Error adding reservation: ", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: reservationsCol.path,
        operation: 'create',
        requestResourceData: reservation
    }))
  });
}

export async function getReservations(db: Firestore): Promise<Reservation[]> {
    const reservationsCol = collection(db, 'reservations');
    const q = query(reservationsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        countrySlug: data.countrySlug,
        // Convert Firestore Timestamp to a serializable format (e.g., ISO string)
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      } as Reservation;
    });
}

// --- Feedback Actions ---

export async function addFeedback(db: Firestore, feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<void> {
  const feedbackCol = collection(db, 'feedback');
  addDoc(feedbackCol, {
    ...feedback,
    createdAt: serverTimestamp()
  }).then(docRef => {
    console.log("Feedback added with ID: ", docRef.id);
  }).catch(error => {
    console.error("Error adding feedback: ", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: feedbackCol.path,
        operation: 'create',
        requestResourceData: feedback
    }))
  });
}

export async function getFeedback(db: Firestore): Promise<Feedback[]> {
    const feedbackCol = collection(db, 'feedback');
    const q = query(feedbackCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      } as Feedback;
    });
}
