import { 
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export interface Placement {
  id?: string;
  game: string;
  tournament: string;
  team: string;
  position: string;
  players: string[];
  prize?: string;
  logo: string;
  createdAt: Timestamp;
}

const PLACEMENTS_COLLECTION = 'placements';

export const placementService = {
  async getAll(): Promise<Placement[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, PLACEMENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Placement, 'id'>) }));
  },

  async getById(id: string): Promise<Placement | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, PLACEMENTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Placement, 'id'>) };
  },

  async create(input: Omit<Placement, 'id' | 'createdAt'>): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<Placement, 'id'> = {
      ...input,
      createdAt: Timestamp.now(),
    };
    const ref = await addDoc(collection(db, PLACEMENTS_COLLECTION), payload);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<Placement, 'id'>>): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, PLACEMENTS_COLLECTION, id);
    await updateDoc(ref, updates);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, PLACEMENTS_COLLECTION, id));
  }
};