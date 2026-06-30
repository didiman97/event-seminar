import React from "react";
import Link from "next/link";
import { Mail, Compass, HelpCircle, FileText, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07111F] border-t border-white/5 relative z-10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-primary to-accent h-8 w-8 rounded-lg flex items-center justify-center border border-white/10">
                <span className="text-white font-black text-xs tracking-tighter">SV</span>
              </div>
              <span className="font-extrabold text-md tracking-tight text-white">
                Seminar<span className="text-cyan-400">Verse</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover and host professional webinars, tech summits, and hands-on developer masterclasses globally.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              <span>Explore</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/events?type=webinar" className="hover:text-cyan-400 transition-colors">Online Webinars</Link>
              </li>
              <li>
                <Link href="/events?type=seminar" className="hover:text-cyan-400 transition-colors">Offline Seminars</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-cyan-400 transition-colors">Featured Summit</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Resources</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/blog" className="hover:text-cyan-400 transition-colors">SEO Blog</Link>
              </li>
              <li>
                <Link href="/certificate/verify" className="hover:text-cyan-400 transition-colors">Verify Certificate</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-cyan-400 transition-colors">FAQ Support</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-400" />
              <span>Newsletter</span>
            </h4>
            <p className="text-xs text-slate-400">Subscribe for early-bird voucher releases and AI seminar alerts.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button className="bg-primary hover:bg-primary/80 border border-primary/20 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Lower Footer */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SeminarVerse Inc. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
            Designed for high scalability with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> & Next.js
          </p>
        </div>
      </div>
    </footer>
  );
};
