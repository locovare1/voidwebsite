import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export interface Log {
  id?: string;
  action: 'create' | 'update' | 'delete';
  entity: 'product' | 'team' | 'ambassador' | 'news' | 'placement' | 'match' | 'order' | 'user' | 'review';
  entityId: string;
  details: string;
  adminEmail: string;
  timestamp: Timestamp;
}

const LOGS_COLLECTION = 'admin_logs';

const isValidLogData = (data: any): data is Omit<Log, 'id'> => {
  return (
    data &&
    typeof data.action === 'string' &&
    ['create', 'update', 'delete'].includes(data.action) &&
    typeof data.entity === 'string' &&
    ['product', 'team', 'ambassador', 'news', 'placement', 'match', 'order', 'user', 'review'].includes(data.entity) &&
    typeof data.entityId === 'string' &&
    typeof data.details === 'string' &&
    typeof data.adminEmail === 'string' &&
    data.timestamp instanceof Timestamp
  );
};

export const logService = {
  async getAll(): Promise<Log[]> {
    if (!db) throw new Error('Firestore not initialized');
    try {
      const q = query(collection(db, LOGS_COLLECTION), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) return [];

      const validLogs: Log[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if (isValidLogData(data)) {
          validLogs.push({
            id: d.id,
            ...data
          });
        } else {
          console.warn('Invalid log data, skipping:', data);
        }
      });
      return validLogs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  },

  async create(input: Omit<Log, 'id' | 'timestamp'>): Promise<string> {
    if (!input.action || !input.entity || !input.entityId || !input.details || !input.adminEmail) {
      throw new Error('Invalid log input: missing required fields');
    }
    if (!['create', 'update', 'delete'].includes(input.action)) {
      throw new Error('Invalid log action');
    }
    if (!['product', 'team', 'ambassador', 'news', 'placement', 'match', 'order', 'user', 'review'].includes(input.entity)) {
      throw new Error('Invalid log entity');
    }

    if (!db) throw new Error('Firestore not initialized');
    const payload: Omit<Log, 'id'> = {
      ...input,
      timestamp: Timestamp.now()
    };
    const ref = await addDoc(collection(db, LOGS_COLLECTION), payload);
    return ref.id;
  }
};
