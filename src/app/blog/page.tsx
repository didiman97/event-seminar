"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBlogs, Blog } from "@/lib/strapi";
import { Search, Calendar, User, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getBlogs();
        setBlogs(data);
      } catch (err) {
        console.error("Blogs fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ["All", "Marketing", "Design", "Development", "Business"];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(search.toLowerCase()) || 
      blog.content.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Platform Blog</h1>
        <p className="text-xs text-slate-400 mt-1">Read about headless CMS integrations, SaaS workflows, and event design systems</p>
      </div>

      {/* Search & Categories */}
      <div className="glass rounded-2xl border border-white/5 p-4 mb-8 space-y-4 bg-navy-card/30">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all whitespace-nowrap border ${
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

      {/* Blogs Output */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="glass rounded-2xl h-64 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-glow rounded-2xl overflow-hidden border border-white/5 bg-navy-card/40 flex flex-col h-full group"
            >
              {/* Thumbnail */}
              <Link href={`/blog/${blog.slug}`} className="h-48 relative overflow-hidden block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-primary/20">
                  {blog.category}
                </div>
              </Link>

              {/* Details */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex gap-4 text-xs text-slate-500 items-center">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{blog.publishedAt}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{blog.readTime}</span>
                    </span>
                  </div>

                  <Link href={`/blog/${blog.slug}`} className="block">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {blog.content.replace(/[#*`]/g, "").substring(0, 150)}...
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-5">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={blog.author.avatar} alt={blog.author.name} className="h-6 w-6 rounded-full" />
                    <span className="text-xs text-slate-300 font-semibold">{blog.author.name}</span>
                  </div>
                  <Link href={`/blog/${blog.slug}`} className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center max-w-md mx-auto my-12">
          <p className="text-slate-400 text-sm">No articles match your search parameters.</p>
        </div>
      )}
    </div>
  );
}
