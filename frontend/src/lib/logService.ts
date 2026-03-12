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
  // Basic fields
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'error';
  entity: 'product' | 'team' | 'ambassador' | 'news' | 'placement' | 'match' | 'order' | 'user' | 'review' | 'system' | 'supportTicket' | 'supportMessage';
  entityId: string;
  details: string;
  adminEmail: string;
  timestamp: Timestamp;

  // Enhanced fields
  level: 'debug' | 'info' | 'warn' | 'error';
  status: 'success' | 'error' | 'warning';
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number; // in milliseconds
  errorMessage?: string;

  // Enhanced change tracking
  beforeSnapshot?: Record<string, any>;
  afterSnapshot?: Record<string, any>;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'added' | 'removed' | 'modified' | 'unchanged';
    impact: 'major' | 'minor' | 'cosmetic';
  }>;

  // Bulk operations
  bulkOperation?: {
    count: number;
    items: string[];
    summary: string;
  };

  // Flexible metadata
  metadata?: Record<string, any>;
}

const LOGS_COLLECTION = 'admin_logs';

const isValidLogData = (data: any): data is Omit<Log, 'id'> => {
  return (
    data &&
    typeof data.action === 'string' &&
    ['create', 'update', 'delete', 'view', 'login', 'logout', 'error'].includes(data.action) &&
    typeof data.entity === 'string' &&
    ['product', 'team', 'ambassador', 'news', 'placement', 'match', 'order', 'user', 'review', 'system', 'supportTicket', 'supportMessage'].includes(data.entity) &&
    typeof data.entityId === 'string' &&
    typeof data.details === 'string' &&
    typeof data.adminEmail === 'string' &&
    data.timestamp instanceof Timestamp &&
    // Make level and status optional for backward compatibility with existing logs
    (data.level === undefined || (typeof data.level === 'string' && ['debug', 'info', 'warn', 'error'].includes(data.level))) &&
    (data.status === undefined || (typeof data.status === 'string' && ['success', 'error', 'warning'].includes(data.status))) &&
    (data.duration === undefined || typeof data.duration === 'number') &&
    (data.ipAddress === undefined || typeof data.ipAddress === 'string') &&
    (data.userAgent === undefined || typeof data.userAgent === 'string') &&
    (data.sessionId === undefined || typeof data.sessionId === 'string') &&
    (data.requestId === undefined || typeof data.requestId === 'string') &&
    (data.errorMessage === undefined || typeof data.errorMessage === 'string')
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
    if (!['create', 'update', 'delete', 'view', 'login', 'logout', 'error'].includes(input.action)) {
      throw new Error('Invalid log action');
    }
    if (!['product', 'team', 'ambassador', 'news', 'placement', 'match', 'order', 'user', 'review', 'system', 'supportTicket', 'supportMessage'].includes(input.entity)) {
      throw new Error('Invalid log entity');
    }
    // Make level and status optional for backward compatibility
    if (input.level && !['debug', 'info', 'warn', 'error'].includes(input.level)) {
      throw new Error('Invalid log level');
    }
    if (input.status && !['success', 'error', 'warning'].includes(input.status)) {
      throw new Error('Invalid log status');
    }

    if (!db) throw new Error('Firestore not initialized');
    const payload: Omit<Log, 'id'> = {
      ...input,
      timestamp: Timestamp.now()
    };
    const ref = await addDoc(collection(db, LOGS_COLLECTION), payload);
    return ref.id;
  },

  // Utility functions for enhanced logging
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  getClientInfo(): { ipAddress?: string; userAgent?: string } {
    if (!isBrowser) return {};

    return {
      ipAddress: undefined, // Would need server-side implementation for IP
      userAgent: navigator.userAgent
    };
  },

  // Deep diffing function for change tracking
  calculateChanges(before: Record<string, any>, after: Record<string, any>): Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'added' | 'removed' | 'modified' | 'unchanged';
    impact: 'major' | 'minor' | 'cosmetic';
  }> {
    const changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      changeType: 'added' | 'removed' | 'modified' | 'unchanged';
      impact: 'major' | 'minor' | 'cosmetic';
    }> = [];

    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    allKeys.forEach(key => {
      const oldValue = before[key];
      const newValue = after[key];

      const oldExists = key in before;
      const newExists = key in after;

      if (!oldExists && newExists) {
        changes.push({
          field: key,
          oldValue: undefined,
          newValue,
          changeType: 'added',
          impact: this.assessImpact(key, undefined, newValue)
        });
      } else if (oldExists && !newExists) {
        changes.push({
          field: key,
          oldValue,
          newValue: undefined,
          changeType: 'removed',
          impact: this.assessImpact(key, oldValue, undefined)
        });
      } else if (oldExists && newExists) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            field: key,
            oldValue,
            newValue,
            changeType: 'modified',
            impact: this.assessImpact(key, oldValue, newValue)
          });
        }
      }
    });

    return changes;
  },

  // Assess the impact of a change
  assessImpact(field: string, oldValue: any, newValue: any): 'major' | 'minor' | 'cosmetic' {
    // Define major fields that require attention
    const majorFields = ['id', 'email', 'password', 'status', 'price', 'total', 'isActive', 'deleted'];
    const cosmeticFields = ['updatedAt', 'lastLogin', 'viewCount', 'image', 'description'];

    if (majorFields.includes(field)) {
      return 'major';
    }

    if (cosmeticFields.includes(field)) {
      return 'cosmetic';
    }

    // Check if values are significantly different
    if (typeof oldValue === 'number' && typeof newValue === 'number') {
      const percentChange = Math.abs((newValue - oldValue) / oldValue);
      if (percentChange > 0.5) return 'major'; // 50% change
      if (percentChange > 0.1) return 'minor'; // 10% change
    }

    // String length changes
    if (typeof oldValue === 'string' && typeof newValue === 'string') {
      const lengthChange = Math.abs(newValue.length - oldValue.length);
      if (lengthChange > 100) return 'major';
      if (lengthChange > 20) return 'minor';
    }

    return 'minor';
  }
};
