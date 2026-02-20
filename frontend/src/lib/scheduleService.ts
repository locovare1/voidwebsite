import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export interface Match {
  id?: string;
  game: string;
  event: string;
  opponent: string;
  date: string;
  time: string;
  streamLink: string;
  createdAt: Timestamp;
}

export interface Event {
  id?: string;
  name: string;
  game: string;
  date: string;
  type: string;
  prizePool: string;
  registrationLink: string;
  createdAt: Timestamp;
}

const MATCHES_COLLECTION = 'matches';
const EVENTS_COLLECTION = 'events';

export const scheduleService = {
  // Matches
  async getAllMatches(): Promise<Match[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, MATCHES_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Match, 'id'>)
    }));
  },

  async getMatchById(id: string): Promise<Match | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, MATCHES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Match, 'id'>) };
  },

  async createMatch(input: Omit<Match, 'id' | 'createdAt'>): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<Match, 'id'> = {
      ...input,
      createdAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, MATCHES_COLLECTION), payload);
    return ref.id;
  },

  async updateMatch(id: string, updates: Partial<Omit<Match, 'id'>>): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, MATCHES_COLLECTION, id);
    await updateDoc(ref, updates);
  },

  async removeMatch(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, MATCHES_COLLECTION, id));
  },

  // Events
  async getAllEvents(): Promise<Event[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Event, 'id'>)
    }));
  },

  async getEventById(id: string): Promise<Event | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, EVENTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Event, 'id'>) };
  },

  async createEvent(input: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<Event, 'id'> = {
      ...input,
      createdAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, EVENTS_COLLECTION), payload);
    return ref.id;
  },

  async updateEvent(id: string, updates: Partial<Omit<Event, 'id'>>): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, EVENTS_COLLECTION, id);
    await updateDoc(ref, updates);
  },

  async removeEvent(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  }
};
