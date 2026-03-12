"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { AnimatedCard } from '@/components/FramerAnimations';
import { scheduleService, type Match } from '@/lib/scheduleService';

interface ScheduleTabProps {
  onLogAction: (action: any, entity: any, entityId: string, details: string, options?: any) => Promise<string>;
}

export default function ScheduleTab({ onLogAction }: ScheduleTabProps) {
  const router = useRouter();

  // Match modal state
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchMode, setMatchMode] = useState<'create' | 'edit'>('create');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchForm, setMatchForm] = useState<Omit<Match, 'id' | 'createdAt'>>({
    game: '', event: '', opponent: '', date: '', time: '', streamLink: ''
  });

  const openCreateMatch = () => {
    setMatchMode('create');
    setEditingMatchId(null);
    setMatchForm({ game: '', event: '', opponent: '', date: '', time: '', streamLink: '' });
    setShowMatchModal(true);
  };

  const submitMatch = async () => {
    try {
      if (matchMode === 'create') {
        const matchId = await scheduleService.createMatch(matchForm);
        await onLogAction('create', 'match', matchId, `Created match "${matchForm.game} - ${matchForm.event}"`, {
          level: 'info',
          status: 'success',
          metadata: { opponent: matchForm.opponent, hasStream: !!matchForm.streamLink }
        });
      } else if (editingMatchId) {
        await scheduleService.updateMatch(editingMatchId, matchForm);
        await onLogAction('update', 'match', editingMatchId, `Updated match "${matchForm.game} - ${matchForm.event}"`, {
          level: 'info',
          status: 'success',
          metadata: { opponent: matchForm.opponent }
        });
      }

      setShowMatchModal(false);
    } catch (e) {
      console.error(e);
      await onLogAction('error', 'match', editingMatchId || 'unknown', `Failed to ${matchMode} match`, {
        level: 'error',
        status: 'error',
        errorMessage: e instanceof Error ? e.message : 'Unknown error'
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <AnimatedCard className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Manage Schedule
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/adminpanel/schedule')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Open Schedule Manager
              </button>
              <button
                onClick={openCreateMatch}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add Match/Event
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Create or edit matches, dates, teams, and status from the Schedule Manager page.</p>
        </AnimatedCard>
      </div>

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{matchMode === 'create' ? 'Add' : 'Edit'} Match/Event</h3>
                <button onClick={() => setShowMatchModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Game" value={matchForm.game} onChange={e => setMatchForm({ ...matchForm, game: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Event" value={matchForm.event} onChange={e => setMatchForm({ ...matchForm, event: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Opponent" value={matchForm.opponent} onChange={e => setMatchForm({ ...matchForm, opponent: e.target.value })} />
                <input type="date" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" value={matchForm.date} onChange={e => setMatchForm({ ...matchForm, date: e.target.value })} />
                <input type="time" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" value={matchForm.time} onChange={e => setMatchForm({ ...matchForm, time: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Stream Link" value={matchForm.streamLink} onChange={e => setMatchForm({ ...matchForm, streamLink: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowMatchModal(false)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded">Cancel</button>
                <button onClick={submitMatch} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
