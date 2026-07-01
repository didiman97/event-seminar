"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Calendar, Users, Award, Play, CheckCircle2, 
  ChevronDown, MessageSquare, ShieldCheck, Zap 
} from "lucide-react";
import { getEvents, Event, getBlogs, Blog } from "@/lib/strapi";
import { EventCard } from "@/components/ui/EventCard";
import { SpeakerCard } from "@/components/ui/SpeakerCard";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [headline, setHeadline] = useState("Empower Your Skills at Webinars & Seminars");
  const [description, setDescription] = useState("Join active developer classes, product workshops, and global keynote masterclasses. Generate automated fraud-proof QR credentials instantly.");
  const [btnText, setBtnText] = useState("Explore Events");
  const [btnLink, setBtnLink] = useState("/events");
  const [heroTagline, setHeroTagline] = useState("Next-Generation Headless CMS Platform");
  const [sectionWebinarTitle, setSectionWebinarTitle] = useState("Featured Webinar");
  const [sectionEventsTitle, setSectionEventsTitle] = useState("Upcoming Events");
  const [sectionEventsSubtitle, setSectionEventsSubtitle] = useState("Filter classes by focus areas and secure early-bird ticket access");
  const [sectionSpeakersTitle, setSectionSpeakersTitle] = useState("Keynote Speakers");
  const [sectionSpeakersSubtitle, setSectionSpeakersSubtitle] = useState("Learn directly from world-class industry engineers and product builders");
  const [sectionTestimonialsTitle, setSectionTestimonialsTitle] = useState("What Participants Say");
  const [sectionTestimonialsSubtitle, setSectionTestimonialsSubtitle] = useState("Read honest feedback from tech workers and scaling developers");
  const [sectionFaqTitle, setSectionFaqTitle] = useState("Frequently Asked Questions");
  const [sectionFaqSubtitle, setSectionFaqSubtitle] = useState("Everything you need to know about certificates, ticketing, and checkouts");
  const [heroCtaTitle, setHeroCtaTitle] = useState("Ready to Upskill Your Engineering Career?");
  const [heroCtaDescription, setHeroCtaDescription] = useState("Register now to receive early-bird vouchers, bookmark premium webinars, and automate your certificates.");

  const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);

  useEffect(() => {
    async function loadData() {
      const allEvents = await getEvents();
      const allBlogs = await getBlogs();
      setEvents(allEvents);
      setBlogs(allBlogs);

      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data) {
          if (data.heroHeadline) setHeadline(data.heroHeadline);
          if (data.heroDescription) setDescription(data.heroDescription);
          if (data.heroBtnText) setBtnText(data.heroBtnText);
          if (data.heroBtnLink) setBtnLink(data.heroBtnLink);
          if (data.heroTagline) setHeroTagline(data.heroTagline);
          if (data.sectionWebinarTitle) setSectionWebinarTitle(data.sectionWebinarTitle);
          if (data.sectionEventsTitle) setSectionEventsTitle(data.sectionEventsTitle);
          if (data.sectionEventsSubtitle) setSectionEventsSubtitle(data.sectionEventsSubtitle);
          if (data.sectionSpeakersTitle) setSectionSpeakersTitle(data.sectionSpeakersTitle);
          if (data.sectionSpeakersSubtitle) setSectionSpeakersSubtitle(data.sectionSpeakersSubtitle);
          if (data.sectionTestimonialsTitle) setSectionTestimonialsTitle(data.sectionTestimonialsTitle);
          if (data.sectionTestimonialsSubtitle) setSectionTestimonialsSubtitle(data.sectionTestimonialsSubtitle);
          if (data.sectionFaqTitle) setSectionFaqTitle(data.sectionFaqTitle);
          if (data.sectionFaqSubtitle) setSectionFaqSubtitle(data.sectionFaqSubtitle);
          if (data.heroCtaTitle) setHeroCtaTitle(data.heroCtaTitle);
          if (data.heroCtaDescription) setHeroCtaDescription(data.heroCtaDescription);
        }
      } catch (err) {
        console.error("Error loading home settings:", err);
      }

      try {
        const res = await fetch("/api/faqs");
        const data = await res.json();
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      } catch (err) {
        console.error("Error loading FAQs:", err);
      }
    }

    loadData();
  }, []);

  const categories = ["All", ...Array.from(new Set(events.map(e => e.category)))];

  const filteredEvents = activeCategory === "All" 
    ? events 
    : events.filter(e => e.category === activeCategory);

  const featuredEvent = events.find(e => e.ticketPrice > 0) || events[0];

  const stats = [
    { label: "Total Registrations", value: "24,000+", icon: Users },
    { label: "Active Events", value: "180+", icon: Calendar },
    { label: "Keynote Speakers", value: "75+", icon: ShieldCheck },
    { label: "Lighthouse Performance", value: "98%", icon: Zap },
  ];

  const testimonials = [
    {
      name: "Rian Kusuma",
      role: "Engineering Manager at GoTo",
      comment: "The tech webinars on this platform are world-class. The certificate automation works instantly, and payment validation via Midtrans is incredibly fast.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
    },
    {
      name: "Sofia Amanda",
      role: "Product Designer",
      comment: "I attended the Next.js and Design masterclass. The UI layout felt so premium and responsive on my phone. The bottom navigation bar in the dashboard is very intuitive.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
    }
  ];

  return (
    <div className="relative">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Neon Glow Blur Circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[350px] w-[350px] bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-40 left-1/3 h-[250px] w-[250px] bg-accent/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-400 text-glow"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{heroTagline}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center pt-4"
          >
            <Link
              href={btnLink}
              className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] flex items-center gap-2"
            >
              <span>{btnText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="glass hover:bg-white/10 text-slate-200 font-bold text-sm px-6 py-3 rounded-xl transition-all border border-white/10"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Webinar Panel */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="px-6 py-3 border-l-4 border-cyan-400 mb-6">
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest text-glow">{sectionWebinarTitle}</h2>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl overflow-hidden border border-white/5 bg-navy-card/40 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8"
          >
            <div className="relative h-64 lg:h-auto rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredEvent.thumbnail}
                alt={featuredEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-transparent to-transparent" />
            </div>
            <div className="flex flex-col justify-between py-2">
              <div className="space-y-4">
                <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-glow inline-block">
                  {featuredEvent.category}
                </span>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                  {featuredEvent.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">
                  {featuredEvent.description}
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredEvent.speaker.photo}
                    alt={featuredEvent.speaker.name}
                    className="h-9 w-9 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{featuredEvent.speaker.name}</h5>
                    <p className="text-[10px] text-slate-500">{featuredEvent.speaker.position} at {featuredEvent.speaker.company}</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                <span className="font-extrabold text-lg text-cyan-400 text-glow">
                  {featuredEvent.ticketPrice === 0 ? "FREE" : `IDR ${featuredEvent.ticketPrice.toLocaleString()}`}
                </span>
                <Link
                  href={`/events/${featuredEvent.slug}`}
                  className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg"
                >
                  Book Seat Now
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* 3. Categories & Grid of Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100">{sectionEventsTitle}</h2>
            <p className="text-xs text-slate-400 mt-1">{sectionEventsSubtitle}</p>
          </div>

          {/* Filter Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap border ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary"
                    : "glass text-slate-400 border-white/5 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))
          ) : (
            <div className="col-span-full py-12 glass rounded-2xl border border-white/5 text-center">
              <p className="text-slate-400 text-sm">No events found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Statistics Dashboard Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl border border-white/5 p-5 text-center flex flex-col items-center justify-center bg-navy-card/40"
              >
                <div className="p-3 bg-primary/10 rounded-xl text-cyan-400 mb-3 border border-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stat.value}</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. Speaker Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-extrabold text-slate-100">{sectionSpeakersTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{sectionSpeakersSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 && events.slice(0, 3).map((evt) => (
            <SpeakerCard key={evt.speaker.id} speaker={evt.speaker} />
          ))}
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-extrabold text-slate-100">{sectionTestimonialsTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{sectionTestimonialsSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/30 flex flex-col justify-between">
              <p className="text-slate-300 text-sm leading-relaxed italic">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{t.name}</h5>
                  <p className="text-[10px] text-slate-500 font-semibold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ accordions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-100">{sectionFaqTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{sectionFaqSubtitle}</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div key={idx} className="glass rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left text-sm font-semibold text-slate-200 hover:bg-white/5 transition-all focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${isOpen ? "rotate-185 text-cyan-400" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-white/[0.01]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CTA Hook Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="glass rounded-3xl border border-white/5 bg-gradient-to-r from-primary/10 to-accent/5 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-400/5 rounded-full blur-3xl" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white max-w-lg mx-auto leading-tight">
            {heroCtaTitle}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-3 leading-relaxed">
            {heroCtaDescription}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg"
            >
              Sign Up Now
            </Link>
            <Link
              href={btnLink}
              className="glass hover:bg-white/10 text-slate-300 font-bold text-xs px-5 py-3 rounded-xl transition-all border border-white/5"
            >
              {btnText}
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic RankMath FAQ Schema */}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map((f) => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.a
                }
              }))
            })
          }}
        />
      )}
    </div>
  );
}
