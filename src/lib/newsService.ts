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

export interface NewsArticle {
  id?: string;
  title: string;
  date: Timestamp;
  image: string;
  description: string;
  category: string;
}

const NEWS_COLLECTION = 'newsArticles';

export const newsService = {
  async getAll(): Promise<NewsArticle[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, NEWS_COLLECTION), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<NewsArticle, 'id'>)
    }));
  },

  async getById(id: string): Promise<NewsArticle | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, NEWS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<NewsArticle, 'id'>) };
  },

  async create(input: Omit<NewsArticle, 'id' | 'date'> & { date?: Timestamp | string }): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<NewsArticle, 'id'> = {
      title: input.title,
      image: input.image,
      description: input.description,
      category: input.category,
      date: typeof input.date === 'string' ? Timestamp.fromDate(new Date(input.date)) : (input.date ?? Timestamp.now()),
    };
    const ref = await addDoc(collection(db, NEWS_COLLECTION), payload);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<NewsArticle, 'id'>> & { date?: Timestamp | string }): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, NEWS_COLLECTION, id);
    const payload: any = { ...updates };
    if (typeof updates.date === 'string') payload.date = Timestamp.fromDate(new Date(updates.date));
    await updateDoc(ref, payload);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, NEWS_COLLECTION, id));
  }
};
