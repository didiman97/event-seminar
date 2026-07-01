"use client";

import React, { useState, useEffect } from "react";
import { getEvents, Event } from "@/lib/strapi";
import { EventCard } from "@/components/ui/EventCard";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Search, SlidersHorizontal, Grid, List, Calendar, MapPin, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EventsListingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error("Events fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ["All", ...Array.from(new Set(events.map((e) => e.category)))];

  // Filter events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(search.toLowerCase()) || 
      evt.description.toLowerCase().includes(search.toLowerCase()) || 
      evt.speaker.name.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || evt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "price-asc") return a.ticketPrice - b.ticketPrice;
    if (sortBy === "price-desc") return b.ticketPrice - a.ticketPrice;
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    
    // Default: date-asc
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 min-h-screen">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Explore Events</h1>
        <p className="text-xs text-slate-400 mt-1">Discover upcoming webinars and hands-on professional seminars</p>
      </div>

      {/* Search and Filters panel */}
      <div className="glass rounded-2xl border border-white/5 p-4 mb-8 space-y-4 bg-navy-card/30">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, speaker or description..."
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Controls Toggles */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-all font-semibold cursor-pointer appearance-none pr-8"
              >
                <option value="date-asc" className="bg-[#0b1626] text-slate-200">Date: Earliest</option>
                <option value="price-asc" className="bg-[#0b1626] text-slate-200">Price: Low to High</option>
                <option value="price-desc" className="bg-[#0b1626] text-slate-200">Price: High to Low</option>
                <option value="title-asc" className="bg-[#0b1626] text-slate-200">Title: A - Z</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Grid/List View Selector */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4.5 py-1.5 rounded-lg transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-400/30 text-glow"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or List list output */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : sortedEvents.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((evt) => {
              const formattedPrice = evt.ticketPrice === 0 
                ? "Free" 
                : new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                  }).format(evt.ticketPrice);
                  
              const formattedDate = new Date(evt.startDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-glow p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-5 items-start md:items-center bg-navy-card/40"
                >
                  {/* Thumbnail */}
                  <Link href={`/events/${evt.slug}`} className="w-full md:w-44 h-28 shrink-0 rounded-xl overflow-hidden block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={evt.thumbnail} alt={evt.title} className="w-full h-full object-cover" />
                  </Link>

                  {/* Body Details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {evt.category}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        {evt.isOnline ? (
                          <Video className="h-3 w-3 text-cyan-400" />
                        ) : (
                          <MapPin className="h-3 w-3 text-yellow-500" />
                        )}
                        <span>{evt.location}</span>
                      </span>
                    </div>

                    <Link href={`/events/${evt.slug}`} className="block">
                      <h3 className="text-md sm:text-lg font-bold text-slate-100 hover:text-cyan-400 transition-colors">
                        {evt.title}
                      </h3>
                    </Link>

                    <div className="flex gap-4 text-xs text-slate-400 items-center">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>By {evt.speaker.name}</span>
                    </div>
                  </div>

                  {/* Price Actions */}
                  <div className="w-full md:w-auto shrink-0 md:text-right flex md:flex-col justify-between items-center md:items-end gap-3 pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block tracking-wider font-semibold">Price</span>
                      <span className={`text-md font-extrabold ${evt.ticketPrice === 0 ? "text-emerald-400 text-glow" : "text-slate-100"}`}>
                        {formattedPrice}
                      </span>
                    </div>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5"
                    >
                      <span>Book Ticket</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      ) : (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center max-w-md mx-auto my-12">
          <p className="text-slate-400 text-sm">No events found matching your filter criteria.</p>
        </div>
      )}
    </div>
  );
}
