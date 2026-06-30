"use client";

import React, { useState } from "react";
import { MOCK_BLOGS, Blog } from "@/lib/strapi";
import { 
  Plus, Search, Edit, Trash2, Calendar, BookOpen, 
  FileText, Clock, RefreshCw, Heading1, Heading2, Heading3, 
  Bold, Italic, Link as LinkIcon, Code, Eye 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function AdminBlogsPage() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>(MOCK_BLOGS);
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Marketing");
  const [readTime, setReadTime] = useState("5 min read");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  
  // SEO Meta Fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setTitle("");
    setSlug("");
    setCategory("Marketing");
    setReadTime("5 min read");
    setThumbnail("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800");
    setContent("");
    setMetaTitle("");
    setMetaDescription("");
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Blog) => {
    setEditingBlog(b);
    setTitle(b.title);
    setSlug(b.slug);
    setCategory(b.category);
    setReadTime(b.readTime);
    setThumbnail(b.thumbnail);
    setContent(b.content);
    setMetaTitle(b.seo?.metaTitle || "");
    setMetaDescription(b.seo?.metaDescription || "");
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    toast("Article Deleted", "The blog post has been removed successfully.", "success");
  };

  // Helper to inject tags at selection start/end (Classic Editor style)
  const injectText = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("blogContentTextarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const replacement = prefix + selectedText + suffix;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    setContent(newValue);
    
    // Auto Refocus & maintain text selection position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast("Input required", "Please fill in the title and markdown content.", "info");
      return;
    }

    setModalLoading(true);

    setTimeout(() => {
      setModalLoading(false);
      
      const finalSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || 
                        title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const payload = {
        title,
        slug: finalSlug,
        category,
        readTime,
        thumbnail,
        content,
        publishedAt: editingBlog ? editingBlog.publishedAt : new Date().toISOString().slice(0, 10),
        author: editingBlog ? editingBlog.author : {
          name: "Admin",
          avatar: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
        },
        seo: {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || content.replace(/[#*`]/g, "").substring(0, 150),
          keywords: category
        }
      };

      if (editingBlog) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === editingBlog.id ? { ...b, ...payload } : b))
        );
        toast("Article Updated", "Changes to the blog post have been saved.", "success");
      } else {
        const newBlog: Blog = {
          id: `blog-${Math.random().toString(36).substring(2, 6)}`,
          ...payload
        };
        setBlogs((prev) => [newBlog, ...prev]);
        toast("Article Published", "The new blog post has been published.", "success");
      }

      setModalOpen(false);
    }, 1200);
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Blog Management</h1>
          <p className="text-xs text-slate-400 mt-1">Publish and manage SEO articles and tutorial campaigns</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/80 border border-primary/25 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Article</span>
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

      {/* Blogs Table */}
      {filteredBlogs.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Article Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Publish Date</th>
                  <th className="px-6 py-4">Read Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-100 font-bold text-sm block leading-snug">{b.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">URL: /blog/{b.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/20 border border-primary/30 text-cyan-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{b.publishedAt}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{b.readTime}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="glass hover:bg-white/5 border border-white/10 p-2 rounded-lg text-cyan-400"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
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
          <p className="text-slate-400 text-sm">No blog articles match search query.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlog ? "Modify Blog Article" : "Publish Blog Article"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Main Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Article Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next-Generation Headless Architecture Guide"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Custom URL path (Slug) */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Custom URL Path (Slug)</label>
            <div className="flex">
              <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-xl px-3 py-2.5 text-xs text-slate-500 select-none flex items-center">
                /blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="headless-architecture-guide"
                className="bg-white/5 border border-white/10 rounded-r-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Category & Readtime */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              >
                <option value="Marketing" className="bg-[#0b1626]">Marketing</option>
                <option value="Design" className="bg-[#0b1626]">Design</option>
                <option value="Development" className="bg-[#0b1626]">Development</option>
                <option value="Business" className="bg-[#0b1626]">Business</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Read Time</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Thumbnail image URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Thumbnail Image URL</label>
            <input
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* WordPress Classic Editor Style Toolbar & Textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              <span>Article Content Editor</span>
            </label>
            
            {/* Toolbar styling */}
            <div className="flex flex-wrap gap-0.5 p-1 bg-white/5 border border-white/10 border-b-0 rounded-t-xl text-[10px] font-bold text-slate-400 items-center">
              <button 
                type="button" 
                onClick={() => injectText("# ", "\n")} 
                title="Heading 1"
                className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <Heading1 className="h-3.5 w-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => injectText("## ", "\n")} 
                title="Heading 2"
                className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <Heading2 className="h-3.5 w-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => injectText("### ", "\n")} 
                title="Heading 3"
                className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <Heading3 className="h-3.5 w-3.5" />
              </button>
              
              <div className="h-4 w-[1px] bg-white/10 mx-1" /> {/* Divider */}

              <button 
                type="button" 
                onClick={() => injectText("**", "**")} 
                title="Bold Text"
                className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => injectText("*", "*")} 
                title="Italic Text"
                className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              
              <div className="h-4 w-[1px] bg-white/10 mx-1" />

              <button 
                type="button" 
                onClick={() => injectText("[Link Text](", ")")} 
                title="Insert Link"
                className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors"
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => injectText("```javascript\n", "\n```")} 
                title="Code Block"
                className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors"
              >
                <Code className="h-3.5 w-3.5" />
              </button>
            </div>

            <textarea
              id="blogContentTextarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write using Markdown syntax... Click toolbar buttons to inject headers, bold links or code blocks."
              rows={8}
              className="bg-white/5 border border-white/10 border-t-0 rounded-b-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-700 font-mono resize-y"
            />
          </div>

          {/* SEO Metadata Sub-Form */}
          <div className="border-t border-white/5 pt-4 space-y-3.5 bg-white/[0.01] p-4 rounded-xl border border-white/5">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>WordPress Classic SEO (Meta Configs)</span>
            </h4>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Meta Title</span>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Enter custom Google search title..."
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Meta Description</span>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter search description snippets (max 160 characters)..."
                  rows={2}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
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
              className="flex-grow bg-primary hover:bg-primary/80 border border-primary/25 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {modalLoading ? (
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <span>Publish Post</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
