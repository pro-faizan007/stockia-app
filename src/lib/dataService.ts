import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  UserProfile,
  CropConfig,
  ShopVisitNote,
  StockBatch,
  SaleRecord,
  MandiRateHistory,
  GodownRentRecord,
} from '../types';

// ==========================================
// 1. User Profile Management
// ==========================================
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Super Admin: List all registered users
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==========================================
// 2. User Crops
// ==========================================
export async function fetchUserCrops(userId: string): Promise<CropConfig[]> {
  const path = `users/${userId}/crops`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'crops'));
    return snap.docs.map((d) => d.data() as CropConfig);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserCrop(userId: string, crop: CropConfig): Promise<void> {
  const path = `users/${userId}/crops/${crop.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'crops', crop.id), crop);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveAllUserCrops(userId: string, crops: CropConfig[]): Promise<void> {
  const path = `users/${userId}/crops`;
  try {
    const batch = writeBatch(db);
    for (const c of crops) {
      batch.set(doc(db, 'users', userId, 'crops', c.id), c);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserCrop(userId: string, cropId: string): Promise<void> {
  const path = `users/${userId}/crops/${cropId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'crops', cropId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// 3. User Shop Visit Notes
// ==========================================
export async function fetchUserVisits(userId: string): Promise<ShopVisitNote[]> {
  const path = `users/${userId}/visits`;
  try {
    const q = query(collection(db, 'users', userId, 'visits'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ShopVisitNote);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserVisit(userId: string, visit: ShopVisitNote): Promise<void> {
  const path = `users/${userId}/visits/${visit.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'visits', visit.id), visit);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserVisit(userId: string, visitId: string): Promise<void> {
  const path = `users/${userId}/visits/${visitId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'visits', visitId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// 4. User Warehouse Stock Batches
// ==========================================
export async function fetchUserBatches(userId: string): Promise<StockBatch[]> {
  const path = `users/${userId}/batches`;
  try {
    const q = query(collection(db, 'users', userId, 'batches'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as StockBatch);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserBatch(userId: string, batch: StockBatch): Promise<void> {
  const path = `users/${userId}/batches/${batch.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'batches', batch.id), batch);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserBatch(userId: string, batchId: string): Promise<void> {
  const path = `users/${userId}/batches/${batchId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'batches', batchId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// 5. User Sales Records
// ==========================================
export async function fetchUserSales(userId: string): Promise<SaleRecord[]> {
  const path = `users/${userId}/sales`;
  try {
    const q = query(collection(db, 'users', userId, 'sales'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SaleRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserSale(
  userId: string,
  sale: SaleRecord,
  updatedBatch?: StockBatch
): Promise<void> {
  const path = `users/${userId}/sales/${sale.id}`;
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', userId, 'sales', sale.id), sale);
    if (updatedBatch) {
      batch.set(doc(db, 'users', userId, 'batches', updatedBatch.id), updatedBatch);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserSale(userId: string, saleId: string): Promise<void> {
  const path = `users/${userId}/sales/${saleId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'sales', saleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// 6. User Mandi Rate History
// ==========================================
export async function fetchUserRateHistory(userId: string): Promise<MandiRateHistory[]> {
  const path = `users/${userId}/rateHistory`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'rateHistory'));
    return snap.docs.map((d) => d.data() as MandiRateHistory);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserRateHistory(
  userId: string,
  entry: MandiRateHistory
): Promise<void> {
  const path = `users/${userId}/rateHistory/${entry.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'rateHistory', entry.id), entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// 7. User Godown Rents & Kiraya
// ==========================================
export async function fetchUserGodownRents(userId: string): Promise<GodownRentRecord[]> {
  const path = `users/${userId}/godownRents`;
  try {
    const q = query(collection(db, 'users', userId, 'godownRents'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as GodownRentRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserGodownRent(
  userId: string,
  rent: GodownRentRecord
): Promise<void> {
  const path = `users/${userId}/godownRents/${rent.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'godownRents', rent.id), rent);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserGodownRent(userId: string, rentId: string): Promise<void> {
  const path = `users/${userId}/godownRents/${rentId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'godownRents', rentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

