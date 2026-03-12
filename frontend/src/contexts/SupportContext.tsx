"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface Message {
  id?: string;
  text: string;
  sender: 'customer' | 'admin';
  timestamp: Timestamp;
}

export interface SupportTicket {
  id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  messages: Message[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SupportContextType {
  // Customer functions
  createTicket: (subject: string, initialMessage: string, customerName?: string, customerEmail?: string) => Promise<void>;
  sendMessage: (ticketId: string, text: string, sender: 'customer' | 'admin') => Promise<void>;
  getUserTickets: () => Promise<SupportTicket[]>;
  
  // Admin functions
  getAllTickets: () => Promise<SupportTicket[]>;
  updateTicketStatus: (ticketId: string, status: 'open' | 'in-progress' | 'closed') => Promise<void>;
  updateTicketSubject: (ticketId: string, subject: string) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  subscribeToTicket: (ticketId: string, callback: (ticket: SupportTicket) => void) => () => void;
  
  // State
  currentUser: any;
  loading: boolean;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createTicket = async (subject: string, initialMessage: string, customerName?: string, customerEmail?: string) => {
    if (!db || !currentUser) return;

    try {
      const ticketData: Omit<SupportTicket, 'id'> = {
        userId: currentUser.uid,
        userEmail: customerEmail || currentUser.email || 'Anonymous',
        userName: customerName || currentUser.displayName || 'Anonymous',
        subject,
        status: 'open',
        messages: [{
          text: initialMessage,
          sender: 'customer',
          timestamp: Timestamp.now()
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'support-tickets'), ticketData);
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  const sendMessage = async (ticketId: string, text: string, sender: 'customer' | 'admin') => {
    if (!db) return;

    try {
      const ticketRef = doc(db, 'support-tickets', ticketId);
      const newMessage: Message = {
        text,
        sender,
        timestamp: Timestamp.now()
      };

      await updateDoc(ticketRef, {
        messages: [...(await getDocs(query(collection(db, 'support-tickets')))).docs.find(d => d.id === ticketId)?.data().messages || [], newMessage],
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const getUserTickets = async (): Promise<SupportTicket[]> => {
    if (!db || !currentUser) return [];

    try {
      const q = query(
        collection(db, 'support-tickets'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .filter(doc => doc.data().userId === currentUser.uid)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SupportTicket));
    } catch (error) {
      console.error('Error getting tickets:', error);
      return [];
    }
  };

  const getAllTickets = async (): Promise<SupportTicket[]> => {
    if (!db) return [];

    try {
      const q = query(
        collection(db, 'support-tickets'),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SupportTicket));
    } catch (error) {
      console.error('Error getting all tickets:', error);
      return [];
    }
  };

  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in-progress' | 'closed') => {
    if (!db) return;

    try {
      const ticketRef = doc(db, 'support-tickets', ticketId);
      await updateDoc(ticketRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  };

  const updateTicketSubject = async (ticketId: string, subject: string) => {
    if (!db) return;

    try {
      const ticketRef = doc(db, 'support-tickets', ticketId);
      await updateDoc(ticketRef, {
        subject,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating ticket subject:', error);
      throw error;
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'support-tickets', ticketId));
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  };

  const subscribeToTicket = (ticketId: string, callback: (ticket: SupportTicket) => void) => {
    if (!db) return () => {};

    const ticketRef = doc(db, 'support-tickets', ticketId);
    return onSnapshot(ticketRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        } as SupportTicket);
      }
    });
  };

  return (
    <SupportContext.Provider value={{
      createTicket,
      sendMessage,
      getUserTickets,
      getAllTickets,
      updateTicketStatus,
      updateTicketSubject,
      deleteTicket,
      subscribeToTicket,
      currentUser,
      loading
    }}>
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport() {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
}
