"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Blog } from "@/lib/strapi";
import { ArrowLeft, Calendar, Clock, Share2, User } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

interface ClientProps {
  blog: Blog;
  relatedBlogs: Blog[];
}

export const BlogDetailClient: React.FC<ClientProps> = ({ blog, relatedBlogs }) => {
  const { toast } = useToast();
  
  // Reading progress scroll animations
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast("Link Copied!", "Share link has been copied to clipboard.", "success");
    }
  };

  // Helper to parse simple markdown to JSX with code block styling
  const renderMarkdown = (markdown: string) => {
    const blocks = markdown.split("\n\n");
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Code Block Detection
      if (trimmed.startsWith("```")) {
        const lines = trimmed.split("\n");
        const lang = lines[0].replace("```", "") || "javascript";
        const code = lines.slice(1, -1).join("\n");
        return (
          <div key={idx} className="my-6 rounded-xl overflow-hidden border border-white/10 bg-navy-card shadow-2xl font-mono text-xs">
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>{lang}</span>
              <span className="text-[9px] text-cyan-400 font-semibold uppercase text-glow">Syntax Enabled</span>
            </div>
            <pre className="p-4 text-cyan-300 overflow-x-auto no-scrollbar whitespace-pre leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Headers Detection
      if (trimmed.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4">{trimmed.replace("# ", "")}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-6 mb-3 border-b border-white/5 pb-2">{trimmed.replace("## ", "")}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx} className="text-md sm:text-lg font-bold text-slate-200 mt-5 mb-2">{trimmed.replace("### ", "")}</h3>;
      }

      // List points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const listItems = trimmed.split(/\n[*|-]\s/);
        return (
          <ul key={idx} className="list-disc list-inside pl-4 my-3 text-sm text-slate-400 space-y-2 leading-relaxed">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx}>{item.replace(/^[*|-]\s/, "")}</li>
            ))}
          </ul>
        );
      }

      // Default paragraph
      return (
        <p key={idx} className="text-sm sm:text-base text-slate-300 leading-relaxed my-4 font-sans"
          dangerouslySetInnerHTML={{
            // Simple inline bold replacement (`**text**` to `<strong>text</strong>`)
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/`(.*?)`/g, "<code class='bg-white/5 border border-white/10 px-1 py-0.5 rounded text-cyan-400 text-[11px] font-mono'>$1</code>")
          }}
        />
      );
    });
  };

  return (
    <>
      {/* 1. Top Reading Scroll Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-400 origin-left z-50 text-glow" 
        style={{ scaleX }} 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8 min-h-screen">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog list</span>
          </Link>
        </div>

        {/* 2. Article Header */}
        <div className="space-y-4">
          <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-glow inline-block">
            {blog.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {blog.title}
          </h1>

          <div className="flex justify-between items-center border-b border-white/5 pb-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blog.author.avatar} alt={blog.author.name} className="h-9 w-9 rounded-full object-cover border border-white/10" />
              <div>
                <p className="text-xs font-bold text-slate-200">{blog.author.name}</p>
                <div className="flex gap-3 text-[10px] text-slate-500 font-semibold mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{blog.publishedAt}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{blog.readTime}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all bg-white/[0.01]"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* 3. Cover Banner */}
        <div className="rounded-3xl overflow-hidden h-64 sm:h-[350px] border border-white/5 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        {/* 4. Article Content body */}
        <article className="prose prose-invert max-w-none pt-4">
          {renderMarkdown(blog.content)}
        </article>

        {/* 5. Related Articles footer */}
        {relatedBlogs.length > 0 && (
          <div className="pt-10 border-t border-white/5 mt-10">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedBlogs.map((b) => (
                <div key={b.id} className="glass rounded-2xl border border-white/5 p-4 flex gap-4 items-center bg-navy-card/25 hover:border-cyan-500/10 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.thumbnail} alt={b.title} className="h-16 w-24 object-cover rounded-lg shrink-0" />
                  <div className="space-y-1">
                    <Link href={`/blog/${b.slug}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                        {b.title}
                      </h4>
                    </Link>
                    <span className="text-[10px] text-slate-500 block">{b.publishedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
