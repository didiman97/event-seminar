"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Video, MapPin, ExternalLink, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface TicketItem {
  id: string;
  ticketNumber: string;
  ticketType: string;
  status: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
}

export default function MyEventsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/tickets");
      const data = await res.json();
      if (res.ok) {
        // Filter to show active registrations
        setTickets(data.tickets.filter((t: any) => t.status === "ACTIVE"));
      } else {
        toast("Fetch Error", data.error || "Failed to load events.", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleJoinWebinar = (eventTitle: string) => {
    toast("Webinar Lobby Launching", `Joining mock live room for ${eventTitle}...`, "success");
    window.open("https://zoom.us", "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Registered Events</h1>
        <p className="text-xs text-slate-400 mt-1">View access links for your upcoming webinars and seminars</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t) => {
            const isWebinar = t.ticketType !== "OFFLINE"; // Mock type checker
            return (
              <div key={t.id} className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/45 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block">
                    {t.ticketType} Pass
                  </span>
                  <h3 className="text-md font-bold text-slate-100 line-clamp-1">{t.eventTitle}</h3>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{t.eventDate}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Zoom Cloud Link</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono">Code: {t.ticketNumber}</span>
                  <button
                    onClick={() => handleJoinWebinar(t.eventTitle)}
                    className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1"
                  >
                    <span>Launch Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="No registered events" 
          description="You haven't booked any event seats yet. Visit the Explore Events section to register!" 
        />
      )}
    </div>
  );
}
