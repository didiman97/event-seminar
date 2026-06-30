"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { 
  Calendar, MapPin, Video, User, Users, Award, 
  ChevronRight, Timer, ShieldCheck, Ticket, Gift, Check 
} from "lucide-react";
import { Event, Speaker } from "@/lib/strapi";
import { EventCard } from "@/components/ui/EventCard";
import { Modal } from "@/components/ui/Modal";

// Add window type interface for Midtrans Snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: any) => void;
        onPending: (result: any) => void;
        onError: (result: any) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

interface ClientProps {
  event: Event;
  relatedEvents: Event[];
}

export const EventDetailClient: React.FC<ClientProps> = ({ event, relatedEvents }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedTier, setSelectedTier] = useState<"FREE" | "PAID" | "VIP">("FREE");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percent
  const [voucherSuccess, setVoucherSuccess] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load Midtrans Snap client library in script format
  useEffect(() => {
    const snapSrcUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const myClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-L5uCqGvYd_T8d2Oq";
    
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${snapSrcUrl}"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = snapSrcUrl;
      script.setAttribute("data-client-key", myClientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const target = new Date(event.startDate).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event.startDate]);

  // Calculate pricing based on tier and discount
  const getBasePrice = () => {
    if (selectedTier === "FREE") return 0;
    if (selectedTier === "PAID") return event.ticketPrice;
    // VIP tier is 2.5x base price
    return Math.round(event.ticketPrice * 2.5);
  };

  const getDiscountedPrice = () => {
    const base = getBasePrice();
    if (appliedDiscount === 100) return 0;
    return Math.max(0, base - (base * appliedDiscount) / 100);
  };

  // Validate vouchers code input
  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase() === "PROMO10") {
      setAppliedDiscount(10);
      setVoucherSuccess(true);
      toast("Voucher Applied", "10% discount has been applied to your ticket.", "success");
    } else if (voucherCode.toUpperCase() === "FREEPASS") {
      setAppliedDiscount(100);
      setVoucherSuccess(true);
      toast("Voucher Applied", "100% discount has been applied! Your ticket is now Free.", "success");
    } else {
      setAppliedDiscount(0);
      setVoucherSuccess(false);
      toast("Invalid Voucher", "The promo code entered does not exist or has expired.", "error");
    }
  };

  // Handle register / payment checkout initiation
  const handleRegisterClick = () => {
    if (!session) {
      toast("Authentication Required", "Please sign in to register for events.", "info");
      router.push(`/auth/login?callbackUrl=/events/${event.slug}`);
      return;
    }
    setRegisterModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    setCheckoutLoading(true);
    const finalPrice = getDiscountedPrice();

    try {
      // If final price is 0 (FREE tier or 100% discount), trigger direct registration API
      if (finalPrice === 0) {
        const res = await fetch("/api/tickets/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            eventTitle: event.title,
            eventDate: new Date(event.startDate).toLocaleDateString(),
            ticketType: selectedTier,
            voucherCode: voucherSuccess ? voucherCode : null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast("Registration Failed", data.error || "Failed to secure ticket.", "error");
        } else {
          toast("Registration Success", "Your free ticket has been secured! Check your dashboard.", "success");
          setRegisterModalOpen(false);
          router.push("/dashboard/tickets");
        }
      } else {
        // Trigger Midtrans payment token creation API
        const res = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            ticketType: selectedTier,
            price: finalPrice,
            voucherCode: voucherSuccess ? voucherCode : null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast("Checkout Error", data.error || "Failed to initiate payment gateway.", "error");
          return;
        }

        // Launch Midtrans Snap Overlay popup
        if (typeof window.snap !== "undefined") {
          window.snap.pay(data.token, {
            onSuccess: (result: any) => {
              toast("Payment Successful", "Thank you! Your ticket is now active.", "success");
              setRegisterModalOpen(false);
              router.push("/dashboard/tickets");
            },
            onPending: (result: any) => {
              toast("Payment Pending", "Please complete payment. Your ticket is currently pending.", "info");
              setRegisterModalOpen(false);
              router.push("/dashboard/payments");
            },
            onError: (result: any) => {
              toast("Payment Failed", "The payment could not be processed. Please try again.", "error");
            },
            onClose: () => {
              toast("Checkout Closed", "You closed the payment interface.", "info");
            }
          });
        } else {
          // Fallback to Midtrans Sandbox direct URL
          toast("Redirecting to Sandbox Gateway", "Opening payment window...", "info");
          window.open(data.redirectUrl, "_blank");
          setRegisterModalOpen(false);
        }
      }
    } catch (err: any) {
      toast("Error", "Something went wrong during checkout.", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-10 min-h-screen">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden h-[300px] sm:h-[400px] border border-white/5 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.thumbnail}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />
        
        {/* Banner Details */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-glow inline-block">
              {event.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
            <div className="flex gap-4 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>{new Date(event.startDate).toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1">
                {event.isOnline ? (
                  <>
                    <Video className="h-4 w-4 text-cyan-400" />
                    <span>Zoom Online Webinar</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-yellow-500" />
                    <span>{event.location}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid (Description vs Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Countdown Panel */}
          <div className="glass rounded-2xl border border-white/5 p-6 bg-gradient-to-r from-navy-card/40 to-[#0c1c34]">
            <div className="flex items-center gap-3 mb-4">
              <Timer className="h-5 w-5 text-cyan-400 animate-pulse" />
              <h4 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Webinar Live Countdown</h4>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center max-w-md">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds }
              ].map((time, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl border border-white/5 p-3">
                  <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block">{String(time.value).padStart(2, "0")}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mt-1 block">{time.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Content */}
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-4 bg-navy-card/30">
            <h3 className="text-lg font-bold text-slate-100">About Event</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              {event.description}
            </p>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <h4 className="text-sm font-bold text-slate-200">What You Will Learn</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-400">
                {[
                  "Deep-dive technical methodologies and structures",
                  "Actionable steps with live-coding tutorials",
                  "Q&A session directly with the guest speaker",
                  "Access to exclusive workspace templates & links",
                  "Automated secure QR validation certificate"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Speaker Profile Section */}
          <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/30">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Speaker Profile</h3>
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.speaker.photo}
                alt={event.speaker.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-primary/40 shrink-0"
              />
              <div className="space-y-1.5">
                <h4 className="text-md font-bold text-slate-100">{event.speaker.name}</h4>
                <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider text-glow">
                  {event.speaker.position} at {event.speaker.company}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  {event.speaker.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Checkout Controls */}
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-white/5 bg-navy-card/50 p-6 space-y-6 sticky top-24">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Reserve Seat</h3>
              <p className="text-xs text-slate-400 mt-1">Select your pass and complete registration.</p>
            </div>

            {/* Ticket Tier Selector Buttons */}
            <div className="space-y-2.5">
              {[
                { id: "FREE", label: "Free Pass", priceText: "Free", desc: "Access to live streaming only." },
                { id: "PAID", label: "Premium Pass", priceText: event.ticketPrice === 0 ? "Free" : `IDR ${event.ticketPrice.toLocaleString()}`, desc: "Includes digital certificate & templates." },
                { id: "VIP", label: "VIP Pass", priceText: event.ticketPrice === 0 ? "Free" : `IDR ${Math.round(event.ticketPrice * 2.5).toLocaleString()}`, desc: "1-on-1 speaker access & master recordings." }
              ].map((tier) => {
                const selected = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as any)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                      selected 
                        ? "bg-primary/10 border-primary shadow" 
                        : "bg-white/[0.01] border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{tier.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{tier.desc}</span>
                    </div>
                    <span className={`text-xs font-extrabold ${selected ? "text-cyan-400 text-glow" : "text-slate-300"}`}>
                      {tier.priceText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Voucher Discount Input */}
            <div className="space-y-1.5 border-t border-white/5 pt-4">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Gift className="h-3.5 w-3.5 text-cyan-400" />
                <span>Apply Promo Voucher</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="PROMO10, FREEPASS"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none w-full focus:border-cyan-400 uppercase placeholder:text-slate-700"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs px-4 rounded-xl transition-all"
                >
                  Apply
                </button>
              </div>
              {voucherSuccess && (
                <p className="text-[10px] text-emerald-400 font-medium">Voucher Applied! {appliedDiscount}% discount.</p>
              )}
            </div>

            {/* Pricing Summary */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Original Price</span>
                <span>IDR {getBasePrice().toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>- IDR {((getBasePrice() * appliedDiscount) / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-100 border-t border-white/5 pt-2">
                <span>Total Amount</span>
                <span className="text-cyan-400 text-glow">
                  {getDiscountedPrice() === 0 ? "FREE" : `IDR ${getDiscountedPrice().toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Action Register Button */}
            <button
              onClick={handleRegisterClick}
              className="w-full bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 shadow-lg shadow-primary/10"
            >
              <Ticket className="h-4 w-4" />
              <span>Book Event Seat</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Related Events Carousel */}
      {relatedEvents.length > 0 && (
        <section className="pt-10 border-t border-white/5">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100">Related Events</h2>
            <p className="text-xs text-slate-400 mt-1">Check out similar summits scheduled in the {event.category} category</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Checkout Modal Confirmation */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Confirm Event Registration"
      >
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-slate-100">{event.title}</h4>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>{new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString()}</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Selected Pass: <strong>{selectedTier}</strong></span>
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Account Name</span>
              <span className="font-semibold text-slate-200">{session?.user?.name}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Account Email</span>
              <span className="font-semibold text-slate-200">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-100 border-t border-white/5 pt-2">
              <span>Due Payment</span>
              <span className="text-cyan-400 text-glow">
                {getDiscountedPrice() === 0 ? "FREE" : `IDR ${getDiscountedPrice().toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="flex-1 glass hover:bg-white/10 text-slate-300 font-semibold text-sm py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRegistration}
              disabled={checkoutLoading}
              className="flex-1 bg-primary hover:bg-primary/80 border border-primary/20 text-white font-bold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {checkoutLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Secure Seat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
