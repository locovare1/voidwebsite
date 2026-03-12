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
  deleteDoc,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export interface SocialLink {
  id?: string;
  name: string;
  url: string;
  icon: string; // Icon name (e.g., 'twitter', 'discord', 'twitch', 'youtube', 'instagram')
  order: number;
  createdAt: Timestamp;
}

const SOCIALS_COLLECTION = 'socialLinks';

export const socialService = {
  async getAll(): Promise<SocialLink[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, SOCIALS_COLLECTION), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    const OFFICIAL_OVERRIDES: Record<string, string> = {
      'twitch': 'https://www.twitch.tv/voidesports2x',
      'twitter': 'https://x.com/VoidEsports2x',
      'discord': 'https://discord.gg/ftxyf32wJN'
    };

    return snap.docs.map(d => {
      const data = d.data() as Omit<SocialLink, 'id'>;
      const iconKey = data.icon.toLowerCase();
      
      // If the link is an official one (measured by icon), force the requested URL
      if (OFFICIAL_OVERRIDES[iconKey]) {
        return {
          id: d.id,
          ...data,
          url: OFFICIAL_OVERRIDES[iconKey]
        };
      }
      
      return {
        id: d.id,
        ...data
      };
    });
  },

  async getById(id: string): Promise<SocialLink | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, SOCIALS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<SocialLink, 'id'>) };
  },

  async create(input: Omit<SocialLink, 'id' | 'createdAt'>): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<SocialLink, 'id'> = {
      ...input,
      createdAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, SOCIALS_COLLECTION), payload);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<SocialLink, 'id'>>): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, SOCIALS_COLLECTION, id);
    await updateDoc(ref, updates);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, SOCIALS_COLLECTION, id));
  }
};

