"use client";

import React, { useState, useEffect } from "react";
import { getEvents, Event, MOCK_SPEAKERS } from "@/lib/strapi";
import { 
  Plus, Search, Edit, Trash2, Calendar, MapPin, 
  Video, DollarSign, RefreshCw, User 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/LoadingSkeleton";

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technology");
  const [ticketPrice, setTicketPrice] = useState("199000");
  const [quota, setQuota] = useState("100");
  const [startDate, setStartDate] = useState("");
  const [location, setLocation] = useState("Zoom Webinar");
  const [isOnline, setIsOnline] = useState(true);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(MOCK_SPEAKERS[0].id);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setTitle("");
    setCategory("Technology");
    setTicketPrice("199000");
    setQuota("100");
    setStartDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setLocation("Zoom Webinar");
    setIsOnline(true);
    setSelectedSpeakerId(MOCK_SPEAKERS[0].id);
    setModalOpen(true);
  };

  const handleOpenEdit = (evt: Event) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setCategory(evt.category);
    setTicketPrice(String(evt.ticketPrice));
    setQuota(String(evt.quota));
    setStartDate(new Date(evt.startDate).toISOString().slice(0, 16));
    setLocation(evt.location);
    setIsOnline(evt.isOnline);
    setSelectedSpeakerId(evt.speaker.id);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast("Event Deleted", "The event record has been removed.", "success");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !location) {
      toast("Input required", "Please fill in all the required parameters.", "info");
      return;
    }

    setModalLoading(true);

    setTimeout(() => {
      setModalLoading(false);
      
      const assignedSpeaker = MOCK_SPEAKERS.find((s) => s.id === selectedSpeakerId) || MOCK_SPEAKERS[0];

      const eventPayload = {
        title,
        category,
        ticketPrice: Number(ticketPrice),
        quota: Number(quota),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(new Date(startDate).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        location,
        isOnline,
        thumbnail: isOnline 
          ? "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800"
          : "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800",
        speaker: assignedSpeaker,
        description: "Drafted via admin CRUD panel.",
        seo: { metaTitle: title, metaDescription: title, keywords: category }
      };

      if (editingEvent) {
        setEvents((prev) =>
          prev.map((e) => (e.id === editingEvent.id ? { ...e, ...eventPayload } : e))
        );
        toast("Event Updated", "The event modifications have been saved.", "success");
      } else {
        const newEventObj: Event = {
          id: `evt-${Math.random().toString(36).substring(2, 6)}`,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          ...eventPayload
        };
        setEvents((prev) => [newEventObj, ...prev]);
        toast("Event Created", "The new event has been published successfully.", "success");
      }

      setModalOpen(false);
    }, 1500);
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Event Management</h1>
          <p className="text-xs text-slate-400 mt-1">Add, update, or remove online webinars and offline seminars</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/80 border border-primary/25 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Search box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title or category..."
          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
        />
      </div>

      {/* Table grid */}
      {loading ? (
        <TableSkeleton />
      ) : filteredEvents.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Speaker</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-100 font-bold text-sm block leading-snug">{evt.title}</span>
                        <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">{evt.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-300">
                      {evt.speaker.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(evt.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {evt.ticketPrice === 0 ? "FREE" : `IDR ${evt.ticketPrice.toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full font-semibold text-[8px] uppercase ${
                        evt.isOnline 
                          ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" 
                          : "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
                      }`}>
                        {evt.isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        <span>{evt.isOnline ? "Webinar" : "Seminar"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="glass hover:bg-white/5 border border-white/10 p-2 rounded-lg text-cyan-400"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          className="glass hover:bg-red-500/10 border border-white/10 p-2 rounded-lg text-red-400 hover:border-red-500/20"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center max-w-md mx-auto my-12">
          <p className="text-slate-400 text-sm">No events found matching your filter criteria.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? "Modify Event" : "Create Event"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 16 Masterclass"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-all font-semibold"
              >
                <option value="Technology" className="bg-[#0b1626]">Technology</option>
                <option value="Finance" className="bg-[#0b1626]">Finance</option>
                <option value="Marketing" className="bg-[#0b1626]">Marketing</option>
                <option value="Design" className="bg-[#0b1626]">Design</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ticket Price (IDR)</label>
              <input
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Max Quota</label>
              <input
                type="number"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Location / Link</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-700"
            />
          </div>

          {/* Keynote Speaker Dropdown Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span>Assign Keynote Speaker</span>
            </label>
            <select
              value={selectedSpeakerId}
              onChange={(e) => setSelectedSpeakerId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 font-semibold"
            >
              {MOCK_SPEAKERS.map((spk) => (
                <option key={spk.id} value={spk.id} className="bg-[#0b1626]">
                  {spk.name} ({spk.position} at {spk.company})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isOnlineCheck"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 bg-white/5 border-white/10 text-primary rounded focus:ring-primary focus:ring-offset-0 focus:outline-none"
            />
            <label htmlFor="isOnlineCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
              This event is an Online Webinar (Zoom)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-grow glass hover:bg-white/10 text-slate-300 font-semibold text-xs py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="flex-grow bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {modalLoading ? (
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
