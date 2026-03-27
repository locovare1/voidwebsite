"use client";

import { useState, useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';

interface BackupOrder {
  id: string;
  orderNumber?: string;
  items: any[];
  total: number;
  customerInfo: any;
  status: string;
  createdAt: string;
  currency?: string;
  paymentIntentId?: string;
  isBackup: boolean;
  backupTimestamp: number;
}

export default function OrderRecovery() {
  const [backupOrders, setBackupOrders] = useState<BackupOrder[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const { addOrder } = useOrders();

  useEffect(() => {
    // Load backup orders from localStorage
    try {
      const backups = JSON.parse(localStorage.getItem('void-order-backups') || '[]');
      setBackupOrders(backups);
    } catch (error) {
      console.error('Error loading backup orders:', error);
    }
  }, []);

  const recoverOrder = async (backupOrder: BackupOrder) => {
    setIsRecovering(true);
    
    try {
      // Try to save the backup order to Firebase
      const { db } = await import('@/lib/firebase');
      if (db) {
        const { doc, setDoc } = await import('firebase/firestore');
        
        const orderData = {
          ...backupOrder,
          recovered: true,
          recoveredAt: new Date(),
          originalBackupTimestamp: backupOrder.backupTimestamp
        };
        
        await setDoc(doc(db, 'orders', backupOrder.id), orderData);
        
        // Add to local state
        addOrder(orderData as any);
        
        // Remove from backups
        const updatedBackups = backupOrders.filter(o => o.id !== backupOrder.id);
        setBackupOrders(updatedBackups);
        localStorage.setItem('void-order-backups', JSON.stringify(updatedBackups));
        
        console.log('Order recovered successfully:', backupOrder.id);
        alert('Order recovered successfully!');
      }
    } catch (error) {
      console.error('Error recovering order:', error);
      alert('Failed to recover order. Please try again.');
    } finally {
      setIsRecovering(false);
    }
  };

  const deleteBackup = (backupId: string) => {
    const updatedBackups = backupOrders.filter(o => o.id !== backupId);
    setBackupOrders(updatedBackups);
    localStorage.setItem('void-order-backups', JSON.stringify(updatedBackups));
  };

  const clearAllBackups = () => {
    if (confirm('Are you sure you want to clear all backup orders?')) {
      setBackupOrders([]);
      localStorage.removeItem('void-order-backups');
    }
  };

  if (backupOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-red-400">
          ⚠️ Order Recovery ({backupOrders.length})
        </h3>
        <button
          onClick={clearAllBackups}
          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Clear All
        </button>
      </div>
      
      <p className="text-red-300 text-sm mb-4">
        The following orders failed to save to Firebase. You can recover them manually:
      </p>
      
      <div className="space-y-3">
        {backupOrders.map((backup) => (
          <div key={backup.id} className="bg-red-900/40 border border-red-500/30 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-white font-medium">{backup.orderNumber || backup.id}</div>
                <div className="text-red-300 text-xs">
                  {new Date(backup.backupTimestamp).toLocaleString()}
                </div>
                <div className="text-red-300 text-sm">
                  Total: {backup.currency} {backup.total.toFixed(2)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => recoverOrder(backup)}
                  disabled={isRecovering}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  {isRecovering ? 'Recovering...' : 'Recover'}
                </button>
                <button
                  onClick={() => deleteBackup(backup.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-red-300 text-xs">
              Customer: {backup.customerInfo?.name} ({backup.customerInfo?.email})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
