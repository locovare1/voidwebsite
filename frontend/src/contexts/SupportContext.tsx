"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, updateDoc, doc, deleteDoc, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
};

// Generate a unique visitor ID
const getVisitorId = (): string => {
  let visitorId = getCookie('visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setCookie('visitor_id', visitorId, 30); // 30 days
  }
  return visitorId;
};

export interface Message {
  id?: string;
  text: string;
  sender: 'customer' | 'admin';
  timestamp: Timestamp;
}

export interface SupportTicket {
  id?: string;
  visitorId: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  messages: Message[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SupportContextType {
  // Customer functions
  createTicket: (subject: string, initialMessage: string, customerName: string, customerEmail: string) => Promise<void>;
  sendMessage: (ticketId: string, text: string, sender: 'customer' | 'admin') => Promise<void>;
  getUserTickets: () => Promise<SupportTicket[]>;
  
  // Admin functions
  getAllTickets: () => Promise<SupportTicket[]>;
  updateTicketStatus: (ticketId: string, status: 'open' | 'in-progress' | 'closed') => Promise<void>;
  updateTicketSubject: (ticketId: string, subject: string) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  subscribeToTicket: (ticketId: string, callback: (ticket: SupportTicket) => void) => () => void;
  
  // State
  visitorId: string | null;
  loading: boolean;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize visitor ID from cookies
    const id = getVisitorId();
    setVisitorId(id);
    setLoading(false);
  }, []);

  const createTicket = async (subject: string, initialMessage: string, customerName: string, customerEmail: string) => {
    if (!db || !visitorId) return;

    try {
      const ticketData: Omit<SupportTicket, 'id'> = {
        visitorId: visitorId,
        userEmail: customerEmail,
        userName: customerName,
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

      const docRef = await addDoc(collection(db, 'support-tickets'), ticketData);
      
      // Store the ticket ID in cookies for persistence
      const existingTickets = getCookie('support_tickets') || '[]';
      const tickets = JSON.parse(existingTickets);
      if (!tickets.includes(docRef.id)) {
        tickets.push(docRef.id);
        setCookie('support_tickets', JSON.stringify(tickets), 7); // 7 days
      }
      
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
    if (!db || !visitorId) return [];

    try {
      // Get ticket IDs from cookies
      const ticketIdsCookie = getCookie('support_tickets');
      if (!ticketIdsCookie) return [];
      
      const ticketIds = JSON.parse(ticketIdsCookie);
      if (ticketIds.length === 0) return [];

      // Fetch tickets by ID
      const q = query(
        collection(db, 'support-tickets'),
        where('__name__', 'in', ticketIds),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SupportTicket));
      
      // Filter out closed tickets older than 7 days and update cookie
      const activeTickets = tickets.filter(ticket => {
        const isClosed = ticket.status === 'closed';
        const isOld = new Date().getTime() - ticket.updatedAt.toDate().getTime() > (7 * 24 * 60 * 60 * 1000);
        return !(isClosed && isOld);
      });
      
      // Update cookie with active ticket IDs only
      const activeTicketIds = activeTickets.map(t => t.id!).filter(id => id);
      setCookie('support_tickets', JSON.stringify(activeTicketIds), 7);
      
      return activeTickets;
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
      visitorId,
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
