"use client";

import React, { useState, useEffect } from "react";
import { Blog } from "@/lib/strapi";
import { 
  Plus, Search, Edit, Trash2, Calendar, BookOpen, 
  FileText, Clock, RefreshCw, Heading1, Heading2, Heading3, 
  Bold, Italic, Link as LinkIcon, Code, Eye, Upload
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export default function AdminBlogsPage() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Marketing");
  const [readTime, setReadTime] = useState("5 min read");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailAlt, setThumbnailAlt] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [thumbnailDesc, setThumbnailDesc] = useState("");
  const [content, setContent] = useState("");
  
  // SEO Meta Fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Upload state
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Fetch blogs on mount
  const loadBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      toast("Gagal Memuat", "Gagal mengambil daftar artikel dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingBlog) {
      // Auto-generate slug from title
      const cleanSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-")        // replace spaces with -
        .replace(/-+/g, "-")         // remove consecutive -
        .trim();
      setSlug(cleanSlug);
    }
  };

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setTitle("");
    setSlug("");
    setCategory("Marketing");
    setReadTime("5 min read");
    setThumbnail("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800");
    setThumbnailAlt("Ilustrasi artikel marketing");
    setThumbnailName("default-marketing.jpg");
    setThumbnailDesc("Gambar header default untuk artikel");
    setContent("");
    setMetaTitle("");
    setMetaDescription("");
    setEditorTab("write");
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Blog) => {
    setEditingBlog(b);
    setTitle(b.title);
    setSlug(b.slug);
    setCategory(b.category);
    setReadTime(b.readTime);
    setThumbnail(b.thumbnail);
    setThumbnailAlt(b.thumbnailAlt || "");
    setThumbnailName(b.thumbnailName || "");
    setThumbnailDesc(b.thumbnailDesc || "");
    setContent(b.content);
    setMetaTitle(b.seo?.metaTitle || "");
    const cleanedDesc = (b.seo?.metaDescription || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
    setMetaDescription(cleanedDesc);
    setEditorTab("write");
    setModalOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("File Tidak Valid", "Silakan pilih file gambar.", "error");
      return;
    }

    setUploadingThumbnail(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String, name: file.name })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar");

        setThumbnail(data.url);
        setThumbnailName(data.name);
        setThumbnailAlt(`Thumbnail untuk artikel ${title || "baru"}`);
        setThumbnailDesc(`Berkas gambar utama ${data.name}`);
        toast("Gambar Diunggah", "Thumbnail artikel berhasil diunggah.", "success");
      } catch (err: any) {
        toast("Unggahan Gagal", err.message || "Gagal mengunggah file.", "error");
      } finally {
        setUploadingThumbnail(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus artikel blog ini secara permanen?")) return;

    const updatedList = blogs.filter((b) => b.id !== id);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus artikel");
      
      setBlogs(updatedList);
      toast("Artikel Dihapus", "Artikel blog telah berhasil dihapus secara permanen.", "success");
    } catch (err: any) {
      toast("Gagal Menghapus", err.message || "Gagal menghapus blog.", "error");
    }
  };

  // Helper to inject tags at selection start/end
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
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast("Input required", "Please fill in the title and markdown content.", "info");
      return;
    }

    setModalLoading(true);
      
    const finalSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || 
                      title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const payload = {
      title,
      slug: finalSlug,
      category,
      readTime,
      thumbnail,
      thumbnailAlt,
      thumbnailName,
      thumbnailDesc,
      content,
      publishedAt: editingBlog ? editingBlog.publishedAt : new Date().toISOString().slice(0, 10),
      author: editingBlog ? editingBlog.author : {
        name: "Admin",
        avatar: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
      },
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription.trim() || 
                         (content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().substring(0, 155)),
        keywords: category
      }
    };

    let updatedList: Blog[] = [];

    if (editingBlog) {
      updatedList = blogs.map((b) => (b.id === editingBlog.id ? { ...b, ...payload } : b));
    } else {
      const newBlog: Blog = {
        id: `blog-${Math.random().toString(36).substring(2, 6)}`,
        ...payload
      };
      updatedList = [newBlog, ...blogs];
    }

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan artikel");

      setBlogs(updatedList);
      toast(editingBlog ? "Article Updated" : "Article Published", "Artikel berhasil disimpan ke database.", "success");
      setModalOpen(false);
    } catch (err: any) {
      toast("Gagal Menyimpan", err.message || "Terjadi kesalahan internal.", "error");
    } finally {
      setModalLoading(false);
    }
  };

  // Render markdown for editor visual preview
  const renderPreviewMarkdown = (markdown: string) => {
    if (!markdown.trim()) {
      return (
        <div className="text-center py-20 text-slate-500 text-xs italic">
          Belum ada konten ditulis. Teks markdown yang Anda ketik akan ter-render otomatis di sini secara visual.
        </div>
      );
    }

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
          <div key={idx} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 font-mono text-[11px] shadow-lg">
            <div className="bg-white/5 px-3 py-1.5 border-b border-white/5 flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              <span>{lang}</span>
            </div>
            <pre className="p-3.5 text-cyan-300 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Headers Detection
      if (trimmed.startsWith("# ")) {
        return <h1 key={idx} className="text-lg font-extrabold text-white mt-6 mb-3 border-b border-cyan-500/20 pb-1.5">{trimmed.replace("# ", "")}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={idx} className="text-md font-extrabold text-slate-100 mt-5 mb-2 border-b border-white/5 pb-1">{trimmed.replace("## ", "")}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx} className="text-sm font-bold text-slate-200 mt-4 mb-2">{trimmed.replace("### ", "")}</h3>;
      }

      // Quote Block
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-4 border-cyan-400 pl-4 py-1.5 my-3 italic text-xs text-slate-400 bg-white/[0.01] rounded-r-lg">
            {trimmed.replace("> ", "")}
          </blockquote>
        );
      }

      // Horizontal Rule
      if (trimmed === "---") {
        return <hr key={idx} className="border-white/10 my-6" />;
      }

      // List points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const listItems = trimmed.split(/\n[*|-]\s/);
        return (
          <ul key={idx} className="list-disc list-inside pl-3 my-2 text-xs text-slate-300 space-y-1.5">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx}>{item.replace(/^[*|-]\s/, "")}</li>
            ))}
          </ul>
        );
      }

      // Default paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-3 font-sans"
          dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/`(.*?)`/g, "<code class='bg-white/5 border border-white/10 px-1 py-0.5 rounded text-cyan-400 font-mono'>$1</code>")
          }}
        />
      );
    });
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-cyan-400 text-glow" />
            <span>Blog Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Buat, sunting, dan publikasikan artikel blog optimisasi SEO secara persisten.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/80 border border-primary/25 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Artikel</span>
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
          placeholder="Filter berdasarkan judul atau kategori..."
          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
        />
      </div>

      {/* Blogs Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : filteredBlogs.length > 0 ? (
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
                          className="glass hover:bg-white/5 border border-white/10 p-2 rounded-lg text-cyan-400 cursor-pointer"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="glass hover:bg-red-500/10 border border-white/10 p-2 rounded-lg text-red-400 hover:border-red-500/20 cursor-pointer"
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
          <p className="text-slate-400 text-sm">Tidak ada artikel blog terdaftar.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlog ? "Edit Artikel Blog" : "Buat Artikel Blog Baru"}
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[82vh] overflow-y-auto pr-1.5 no-scrollbar">
          
          {/* Main Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Judul Artikel</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: Mengenal Headless CMS untuk Event Management"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Custom URL path (Slug) */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">URL Slug (Kustom)</label>
            <div className="flex">
              <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-xl px-3 py-2.5 text-xs text-slate-500 select-none flex items-center">
                /blog/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-artikel-anda"
                className="bg-white/5 border border-white/10 rounded-r-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Category & Readtime */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Kategori</label>
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
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Durasi Baca</label>
              <input
                type="text"
                required
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Thumbnail image file Upload & Fields */}
          <div className="glass rounded-xl border border-white/5 p-4 bg-white/[0.01] space-y-3">
            <label className="text-[10px] text-slate-300 uppercase tracking-wider font-bold block border-b border-white/5 pb-1.5">Gambar Utama Artikel (Thumbnail)</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="relative border border-dashed border-white/10 rounded-xl p-3 flex flex-col items-center justify-center bg-white/[0.01]">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt="Thumbnail preview" className="h-14 w-full object-cover rounded-lg border border-white/5" />
                ) : (
                  <Upload className="h-6 w-6 text-slate-600 mb-1" />
                )}
                <label className="bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold px-2 py-1 rounded mt-1.5 text-slate-300 cursor-pointer flex items-center gap-1 shadow">
                  {uploadingThumbnail ? (
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Upload className="h-2.5 w-2.5" />
                  )}
                  <span>Pilih Gambar</span>
                  <input type="file" onChange={handleThumbnailUpload} accept="image/*" className="hidden" />
                </label>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold block uppercase">URL Gambar / Path</label>
                  <input
                    type="text"
                    required
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 w-full focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold block uppercase">Nama Berkas Gambar</label>
                  <input
                    type="text"
                    value={thumbnailName}
                    onChange={(e) => setThumbnailName(e.target.value)}
                    placeholder="Contoh: seo-optimasi-kelas.png"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-semibold block uppercase">Alt Teks Gambar (SEO)</label>
                <input
                  type="text"
                  value={thumbnailAlt}
                  onChange={(e) => setThumbnailAlt(e.target.value)}
                  placeholder="Contoh: Ilustrasi server Next.js"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 w-full focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-semibold block uppercase">Deskripsi / Keterangan Gambar</label>
                <input
                  type="text"
                  value={thumbnailDesc}
                  onChange={(e) => setThumbnailDesc(e.target.value)}
                  placeholder="Contoh: Grafik interaksi pengguna"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Improved Interactive Text Editor */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              <span>Editor Konten Visual Artikel (WYSIWYG)</span>
            </label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* SEO Meta Fields */}
          <div className="glass rounded-xl border border-white/5 p-4 bg-white/[0.01] space-y-3">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block border-b border-white/5 pb-1.5">RankMath SEO Meta Settings</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-semibold block uppercase">Meta Title Override</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Kosongkan untuk otomatis menggunakan Judul Artikel"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-slate-300 w-full focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-semibold block uppercase">Meta Description Override</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Kosongkan untuk mengambil dari paragraf pertama artikel"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-slate-300 w-full focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="glass hover:bg-white/5 border border-white/10 text-slate-400 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {modalLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span>{editingBlog ? "Simpan Artikel" : "Terbitkan Artikel"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
