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
  isEvent?: boolean;
  eventDate?: Timestamp;
  createdAt?: Timestamp;
}

const NEWS_COLLECTION = 'newsArticles';

export const newsService = {
  async getAll(): Promise<NewsArticle[]> {
    if (!isBrowser || !db) return [];
    // Order by date descending
    const q = query(collection(db, NEWS_COLLECTION), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    const articles = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<NewsArticle, 'id'>)
    }));
    // Client-side sort: by date first, then by createdAt for articles with same date
    return articles.sort((a, b) => {
      const aDate = a.date?.toMillis() || 0;
      const bDate = b.date?.toMillis() || 0;
      if (aDate !== bDate) return bDate - aDate; // Newer dates first
      // If dates are equal, sort by createdAt if available (newer first)
      const aCreated = a.createdAt?.toMillis() || 0;
      const bCreated = b.createdAt?.toMillis() || 0;
      return bCreated - aCreated;
    });
  },

  async getById(id: string): Promise<NewsArticle | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, NEWS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<NewsArticle, 'id'>) };
  },

  async create(input: Omit<NewsArticle, 'id' | 'date' | 'eventDate' | 'createdAt'> & { date?: Timestamp | string; eventDate?: Timestamp | string }): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const now = Timestamp.now();
    const payload: any = {
      title: input.title,
      image: input.image,
      description: input.description,
      category: input.category,
      date: typeof input.date === 'string' ? Timestamp.fromDate(new Date(input.date)) : (input.date ?? now),
      isEvent: input.isEvent ?? false,
      createdAt: now, // Always set createdAt to current time for new articles
    };
    
    // Only add eventDate if it's provided
    if (input.eventDate) {
      payload.eventDate = typeof input.eventDate === 'string' ? Timestamp.fromDate(new Date(input.eventDate)) : input.eventDate;
    }
    
    const ref = await addDoc(collection(db, NEWS_COLLECTION), payload);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<NewsArticle, 'id'>> & { date?: Timestamp | string; eventDate?: Timestamp | string }): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, NEWS_COLLECTION, id);
    const payload: any = {};
    
    // Only include defined fields
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.isEvent !== undefined) payload.isEvent = updates.isEvent;
    
    if (typeof updates.date === 'string') {
      payload.date = Timestamp.fromDate(new Date(updates.date));
    } else if (updates.date instanceof Timestamp) {
      payload.date = updates.date;
    }
    
    if (typeof updates.eventDate === 'string') {
      payload.eventDate = Timestamp.fromDate(new Date(updates.eventDate));
    } else if (updates.eventDate instanceof Timestamp) {
      payload.eventDate = updates.eventDate;
    }
    // Don't include eventDate if it's undefined
    
    await updateDoc(ref, payload);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, NEWS_COLLECTION, id));
  }
};
