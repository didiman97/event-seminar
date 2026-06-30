"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Video } from "lucide-react";
import { Event } from "@/lib/strapi";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formattedPrice = event.ticketPrice === 0 
    ? "Free" 
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(event.ticketPrice);

  const formattedDate = new Date(event.startDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group glass-glow rounded-2xl overflow-hidden border border-white/5 bg-navy-card/50 flex flex-col h-full"
    >
      {/* Thumbnail Container */}
      <Link href={`/events/${event.slug}`} className="block relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.thumbnail}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category Tag */}
        <div className="absolute top-4 left-4 bg-[#07111F]/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 text-glow">
          {event.category}
        </div>
        {/* Online/Offline Icon */}
        <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-primary/20">
          {event.isOnline ? (
            <>
              <Video className="h-3.5 w-3.5 text-cyan-400" />
              <span>Webinar</span>
            </>
          ) : (
            <>
              <MapPin className="h-3.5 w-3.5 text-yellow-400" />
              <span>Seminar</span>
            </>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex gap-4 text-xs text-slate-400 mb-3 items-center">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <span>{event.quota} slots</span>
          </div>

          {/* Title */}
          <Link href={`/events/${event.slug}`} className="block">
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug mb-3">
              {event.title}
            </h3>
          </Link>

          {/* Speaker info */}
          <div className="flex items-center gap-2 mb-4 border-t border-white/5 pt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.speaker.photo}
              alt={event.speaker.name}
              className="h-6 w-6 rounded-full object-cover border border-white/10"
            />
            <span className="text-xs text-slate-300 font-medium">
              {event.speaker.name} <span className="text-slate-500">({event.speaker.company})</span>
            </span>
          </div>
        </div>

        {/* Footer info (Price & CTA) */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Ticket Price</span>
            <span className={`font-bold ${event.ticketPrice === 0 ? "text-emerald-400 text-glow" : "text-slate-100"}`}>
              {formattedPrice}
            </span>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className="bg-primary hover:bg-primary/80 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02]"
          >
            Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
