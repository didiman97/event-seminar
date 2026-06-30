"use client";

import React from "react";
import { motion } from "framer-motion";
import { Speaker } from "@/lib/strapi";

interface SpeakerCardProps {
  speaker: Speaker;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass rounded-2xl overflow-hidden border border-white/5 bg-navy-card/40 p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/5 group"
    >
      {/* Avatar Container */}
      <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-cyan-400 transition-colors duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={speaker.photo}
          alt={speaker.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Name and Designation */}
      <h3 className="font-bold text-slate-100 text-lg group-hover:text-cyan-400 transition-colors">
        {speaker.name}
      </h3>
      <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mt-1 text-glow">
        {speaker.position}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">
        {speaker.company}
      </p>

      {/* Bio */}
      <p className="text-xs text-slate-400 line-clamp-3 mt-3 px-2 leading-relaxed">
        {speaker.bio}
      </p>

      {/* Social Icons */}
      <div className="flex gap-4 mt-5">
        {speaker.socialMedia.twitter && (
          <a
            href={speaker.socialMedia.twitter}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        )}
        {speaker.socialMedia.linkedin && (
          <a
            href={speaker.socialMedia.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        )}
        {speaker.socialMedia.github && (
          <a
            href={speaker.socialMedia.github}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );
};
