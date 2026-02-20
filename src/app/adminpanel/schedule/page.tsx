"use client";

import { useState, useEffect } from 'react';
import { scheduleService } from '@/lib/scheduleService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function SchedulePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showDeleteMatchConfirm, setShowDeleteMatchConfirm] = useState<string | null>(null);
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'events'>('matches');
  
  const [matchForm, setMatchForm] = useState({
    game: '',
    event: '',
    opponent: '',
    date: '',
    time: '',
    streamLink: ''
  });
  
  const [eventForm, setEventForm] = useState({
    name: '',
    game: '',
    date: '',
    type: '',
    prizePool: '',
    registrationLink: ''
  });

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const [allMatches, allEvents] = await Promise.all([
        scheduleService.getAllMatches(),
        scheduleService.getAllEvents()
      ]);
      setMatches(allMatches);
      setEvents(allEvents);
    } catch (e) {
      console.error('Error loading schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const resetMatchForm = () => {
    setMatchForm({ game: '', event: '', opponent: '', date: '', time: '', streamLink: '' });
    setEditingMatch(null);
  };

  const resetEventForm = () => {
    setEventForm({ name: '', game: '', date: '', type: '', prizePool: '', registrationLink: '' });
    setEditingEvent(null);
  };

  const submitMatch = async () => {
    try {
      if (editingMatch?.id) {
        await scheduleService.updateMatch(editingMatch.id, { ...matchForm });
      } else {
        await scheduleService.createMatch({ ...matchForm });
      }
      await loadSchedule();
      resetMatchForm();
    } catch (e) {
      console.error('Error saving match:', e);
    }
  };

  const submitEvent = async () => {
    try {
      if (editingEvent?.id) {
        await scheduleService.updateEvent(editingEvent.id, { ...eventForm });
      } else {
        await scheduleService.createEvent({ ...eventForm });
      }
      await loadSchedule();
      resetEventForm();
    } catch (e) {
      console.error('Error saving event:', e);
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      await scheduleService.removeMatch(id);
      await loadSchedule();
    } catch (e) {
      console.error('Error deleting match:', e);
    } finally {
      setShowDeleteMatchConfirm(null);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await scheduleService.removeEvent(id);
      await loadSchedule();
    } catch (e) {
      console.error('Error deleting event:', e);
    } finally {
      setShowDeleteEventConfirm(null);
    }
  };

  const filteredMatches = searchTerm 
    ? matches.filter(match => 
        match.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.event.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : matches;

  const filteredEvents = searchTerm 
    ? events.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : events;

  const matchRequiredMissing = !matchForm.game || !matchForm.opponent;
  const eventRequiredMissing = !eventForm.name || !eventForm.game;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Schedule Management</h1>
          <p className="text-gray-400 mt-1">Manage matches and events schedule</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search matches or events..."
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setActiveTab('matches'); resetMatchForm(); }}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'matches' 
                  ? 'bg-[#FFFFFF] text-black' 
                  : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
              }`}
            >
              Matches
            </button>
            <button 
              onClick={() => { setActiveTab('events'); resetEventForm(); }}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'events' 
                  ? 'bg-[#FFFFFF] text-black' 
                  : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
              }`}
            >
              Events
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matches/Events List */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {activeTab === 'matches' ? 'Matches' : 'Events'}
              </h2>
              <button 
                onClick={activeTab === 'matches' ? resetMatchForm : resetEventForm}
                className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                New {activeTab === 'matches' ? 'Match' : 'Event'}
              </button>
            </div>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading {activeTab}...</p>
              </div>
            ) : activeTab === 'matches' ? (
              filteredMatches.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No matches found</p>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {filteredMatches.map((match) => (
                    <div key={match.id ?? `${match.game}-${match.date}`} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium">{match.game}: vs {match.opponent}</div>
                          <div className="text-sm text-gray-400">{match.event}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {match.date} • {match.time || 'TBD'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMatch(match);
                              setMatchForm({
                                game: match.game,
                                event: match.event,
                                opponent: match.opponent,
                                date: match.date,
                                time: match.time,
                                streamLink: match.streamLink
                              });
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {match.id && (
                            <button
                              onClick={() => setShowDeleteMatchConfirm(match.id!)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No events found</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {filteredEvents.map((event) => (
                  <div key={event.id ?? event.name} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium">{event.name}</div>
                        <div className="text-sm text-gray-400">{event.game} • {event.type}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {event.date} • {event.prizePool || 'Prize TBD'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setEventForm({
                              name: event.name,
                              game: event.game,
                              date: event.date,
                              type: event.type,
                              prizePool: event.prizePool,
                              registrationLink: event.registrationLink
                            });
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {event.id && (
                          <button
                            onClick={() => setShowDeleteEventConfirm(event.id!)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Match/Event Form */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">
              {editingMatch || editingEvent ? 'Edit' : 'Create'} {activeTab === 'matches' ? 'Match' : 'Event'}
            </h2>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {activeTab === 'matches' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    value={matchForm.game} 
                    onChange={e=>setMatchForm(p=>({...p,game:e.target.value}))} 
                    placeholder="Game" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={matchForm.opponent} 
                    onChange={e=>setMatchForm(p=>({...p,opponent:e.target.value}))} 
                    placeholder="Opponent" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={matchForm.event} 
                    onChange={e=>setMatchForm(p=>({...p,event:e.target.value}))} 
                    placeholder="Event" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    type="date"
                    value={matchForm.date} 
                    onChange={e=>setMatchForm(p=>({...p,date:e.target.value}))} 
                    placeholder="Date" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={matchForm.time} 
                    onChange={e=>setMatchForm(p=>({...p,time:e.target.value}))} 
                    placeholder="Time" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={matchForm.streamLink} 
                    onChange={e=>setMatchForm(p=>({...p,streamLink:e.target.value}))} 
                    placeholder="Stream link" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={submitMatch} 
                    disabled={matchRequiredMissing} 
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
                  >
                    {editingMatch ? 'Update Match' : 'Create Match'}
                  </button>
                  <button 
                    onClick={resetMatchForm} 
                    className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    value={eventForm.name} 
                    onChange={e=>setEventForm(p=>({...p,name:e.target.value}))} 
                    placeholder="Event name" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={eventForm.game} 
                    onChange={e=>setEventForm(p=>({...p,game:e.target.value}))} 
                    placeholder="Game" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={eventForm.type} 
                    onChange={e=>setEventForm(p=>({...p,type:e.target.value}))} 
                    placeholder="Type" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    type="date"
                    value={eventForm.date} 
                    onChange={e=>setEventForm(p=>({...p,date:e.target.value}))} 
                    placeholder="Date" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={eventForm.prizePool} 
                    onChange={e=>setEventForm(p=>({...p,prizePool:e.target.value}))} 
                    placeholder="Prize pool" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                  <input 
                    value={eventForm.registrationLink} 
                    onChange={e=>setEventForm(p=>({...p,registrationLink:e.target.value}))} 
                    placeholder="Registration link" 
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={submitEvent} 
                    disabled={eventRequiredMissing} 
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                  <button 
                    onClick={resetEventForm} 
                    className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Delete Confirmation Modal */}
      {showDeleteMatchConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <CalendarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Match</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this match? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowDeleteMatchConfirm(null)} 
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={()=>{ if (showDeleteMatchConfirm) deleteMatch(showDeleteMatchConfirm); }} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Delete Confirmation Modal */}
      {showDeleteEventConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <CalendarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Event</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowDeleteEventConfirm(null)} 
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={()=>{ if (showDeleteEventConfirm) deleteEvent(showDeleteEventConfirm); }} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}