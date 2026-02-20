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

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: Timestamp;
  readAt?: Timestamp;
  repliedAt?: Timestamp;
}

const CONTACT_COLLECTION = 'contactMessages';

export const contactService = {
  async getAll(): Promise<ContactMessage[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, CONTACT_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<ContactMessage, 'id'>)
    }));
  },

  async getById(id: string): Promise<ContactMessage | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, CONTACT_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<ContactMessage, 'id'>) };
  },

  async create(input: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<ContactMessage, 'id'> = {
      ...input,
      status: 'unread',
      createdAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, CONTACT_COLLECTION), payload);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<ContactMessage, 'id'>>): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, CONTACT_COLLECTION, id);
    const updateData: any = { ...updates };
    if (updates.status === 'read' && !updates.readAt) {
      updateData.readAt = Timestamp.now();
    }
    if (updates.status === 'replied' && !updates.repliedAt) {
      updateData.repliedAt = Timestamp.now();
    }
    await updateDoc(ref, updateData);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, CONTACT_COLLECTION, id));
  }
};

