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

export interface Ambassador {
    id?: string;
    name: string;
    role: string; // e.g. "Ambassador", "Lead Ambassador"
    image: string;
    game: string;
    achievements: string[];
    socialLinks?: {
        twitter?: string;
        twitch?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };
    createdAt: Timestamp;
}

const AMBASSADORS_COLLECTION = 'ambassadors';

export const ambassadorService = {
    async getAll(): Promise<Ambassador[]> {
        try {
            if (!isBrowser || !db) return [];
            const q = query(collection(db, AMBASSADORS_COLLECTION), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Ambassador, 'id'>) }));
        } catch (error) {
            console.error('Error fetching ambassadors:', error);
            return [];
        }
    },

    async getById(id: string): Promise<Ambassador | null> {
        if (!isBrowser || !db) return null;
        const ref = doc(db, AMBASSADORS_COLLECTION, id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        return { id: snap.id, ...(snap.data() as Omit<Ambassador, 'id'>) };
    },

    async create(input: Omit<Ambassador, 'id' | 'createdAt'>): Promise<string> {
        if (!isBrowser || !db) return 'mock-id';
        const payload: Omit<Ambassador, 'id'> = {
            ...input,
            createdAt: Timestamp.now(),
        };
        const ref = await addDoc(collection(db, AMBASSADORS_COLLECTION), payload);
        return ref.id;
    },

    async update(id: string, updates: Partial<Omit<Ambassador, 'id' | 'createdAt'>>): Promise<void> {
        try {
            if (!isBrowser || !db) return;
            const ref = doc(db, AMBASSADORS_COLLECTION, id);
            await updateDoc(ref, updates);
        } catch (error) {
            console.error('Error updating ambassador:', error);
            throw error;
        }
    },

    async remove(id: string): Promise<void> {
        if (!isBrowser || !db) return;
        await deleteDoc(doc(db, AMBASSADORS_COLLECTION, id));
    }
};
