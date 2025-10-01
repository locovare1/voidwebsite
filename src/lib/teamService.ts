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
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export interface Player {
  id?: string; // client-side identifier for array items
  name: string;
  role: string;
  image: string;
  game: string;
  achievements?: string[];
  socialLinks?: {
    twitter?: string;
    twitch?: string;
    instagram?: string;
  };
}

export interface Team {
  id?: string;
  name: string;
  image: string;
  description: string;
  achievements: string[];
  players: Player[];
  createdAt: Timestamp;
}

const TEAMS_COLLECTION = 'teams';

export const teamService = {
  async getAll(): Promise<Team[]> {
    if (!isBrowser || !db) return [];
    const q = query(collection(db, TEAMS_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Team, 'id'>) }));
  },

  async getById(id: string): Promise<Team | null> {
    if (!isBrowser || !db) return null;
    const ref = doc(db, TEAMS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Team, 'id'>) };
  },

  async create(input: Omit<Team, 'id' | 'createdAt'> & { createdAt?: Timestamp | string }): Promise<string> {
    if (!isBrowser || !db) return 'mock-id';
    const payload: Omit<Team, 'id'> = {
      ...input,
      createdAt: typeof input.createdAt === 'string' ? Timestamp.fromDate(new Date(input.createdAt)) : (input.createdAt ?? Timestamp.now()),
    };
    const ref = await addDoc(collection(db, TEAMS_COLLECTION), payload);
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<Team, 'id'>> & { createdAt?: Timestamp | string }): Promise<void> {
    if (!isBrowser || !db) return;
    const ref = doc(db, TEAMS_COLLECTION, id);
    const payload: any = { ...updates };
    if (typeof updates.createdAt === 'string') payload.createdAt = Timestamp.fromDate(new Date(updates.createdAt));
    await updateDoc(ref, payload);
  },

  async remove(id: string): Promise<void> {
    if (!isBrowser || !db) return;
    await deleteDoc(doc(db, TEAMS_COLLECTION, id));
  },

  // Player-level helpers operate on the team's players array
  async addPlayer(teamId: string, player: Player): Promise<void> {
    if (!isBrowser || !db) return;
    const team = await this.getById(teamId);
    if (!team) return;
    const updated = [...(team.players || []), player];
    await updateDoc(doc(db, TEAMS_COLLECTION, teamId), { players: updated });
  },

  async updatePlayer(teamId: string, index: number, player: Player): Promise<void> {
    if (!isBrowser || !db) return;
    const team = await this.getById(teamId);
    if (!team) return;
    const updated = [...(team.players || [])];
    updated[index] = player;
    await updateDoc(doc(db, TEAMS_COLLECTION, teamId), { players: updated });
  },

  async removePlayer(teamId: string, index: number): Promise<void> {
    if (!isBrowser || !db) return;
    const team = await this.getById(teamId);
    if (!team) return;
    const updated = [...(team.players || [])];
    updated.splice(index, 1);
    await updateDoc(doc(db, TEAMS_COLLECTION, teamId), { players: updated });
  }
};
