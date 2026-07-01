"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { 
  RefreshCw, Save, Settings, Layout, Award, 
  ShieldAlert, Upload, HelpCircle, Plus, Trash, Edit, Check
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"website" | "sections" | "certificate" | "faqs">("website");

  // Tab 1: Logo & Hero Branding
  const [logoText, setLogoText] = useState("");
  const [logoAbbreviation, setLogoAbbreviation] = useState("");
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroTagline, setHeroTagline] = useState("");
  const [heroBtnText, setHeroBtnText] = useState("");
  const [heroBtnLink, setHeroBtnLink] = useState("");

  // Tab 2: Section Customizer
  const [sectionWebinarTitle, setSectionWebinarTitle] = useState("");
  const [sectionEventsTitle, setSectionEventsTitle] = useState("");
  const [sectionEventsSubtitle, setSectionEventsSubtitle] = useState("");
  const [sectionSpeakersTitle, setSectionSpeakersTitle] = useState("");
  const [sectionSpeakersSubtitle, setSectionSpeakersSubtitle] = useState("");
  const [sectionTestimonialsTitle, setSectionTestimonialsTitle] = useState("");
  const [sectionTestimonialsSubtitle, setSectionTestimonialsSubtitle] = useState("");
  const [sectionFaqTitle, setSectionFaqTitle] = useState("");
  const [sectionFaqSubtitle, setSectionFaqSubtitle] = useState("");
  const [heroCtaTitle, setHeroCtaTitle] = useState("");
  const [heroCtaDescription, setHeroCtaDescription] = useState("");

  // Tab 3: Certificate Template
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certSignatureName, setCertSignatureName] = useState("");
  const [certSignatureRole, setCertSignatureRole] = useState("");

  // Tab 4: FAQ Manager
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    // 1. Fetch Platform Settings
    const fetchSettings = fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setLogoText(data.logoText || "");
          setLogoAbbreviation(data.logoAbbreviation || "");
          setLogoImageUrl(data.logoImageUrl || "");
          setLogoPreview(data.logoImageUrl || null);
          setHeroHeadline(data.heroHeadline || "");
          setHeroDescription(data.heroDescription || "");
          setHeroTagline(data.heroTagline || "");
          setHeroBtnText(data.heroBtnText || "");
          setHeroBtnLink(data.heroBtnLink || "");

          setSectionWebinarTitle(data.sectionWebinarTitle || "");
          setSectionEventsTitle(data.sectionEventsTitle || "");
          setSectionEventsSubtitle(data.sectionEventsSubtitle || "");
          setSectionSpeakersTitle(data.sectionSpeakersTitle || "");
          setSectionSpeakersSubtitle(data.sectionSpeakersSubtitle || "");
          setSectionTestimonialsTitle(data.sectionTestimonialsTitle || "");
          setSectionTestimonialsSubtitle(data.sectionTestimonialsSubtitle || "");
          setSectionFaqTitle(data.sectionFaqTitle || "");
          setSectionFaqSubtitle(data.sectionFaqSubtitle || "");
          setHeroCtaTitle(data.heroCtaTitle || "");
          setHeroCtaDescription(data.heroCtaDescription || "");

          setCertTitle(data.certTitle || "");
          setCertIssuer(data.certIssuer || "");
          setCertSignatureName(data.certSignatureName || "");
          setCertSignatureRole(data.certSignatureRole || "");
        }
      });

    // 2. Fetch FAQs list
    const fetchFaqs = fetch("/api/faqs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      });

    Promise.all([fetchSettings, fetchFaqs])
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Error loading configs:", err);
        toast("Gagal Memuat", "Gagal mengambil data pengaturan.", "error");
        setLoading(false);
      });
  }, [toast]);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("File Tidak Valid", "Silakan pilih file gambar (PNG, JPG, SVG).", "error");
      return;
    }

    setUploadingLogo(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);

      try {
        const res = await fetch("/api/admin/upload-logo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoImage: base64String })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Gagal mengunggah logo");

        setLogoImageUrl(data.logoImageUrl);
        toast("Logo Diunggah", "Logo gambar website berhasil diperbarui.", "success");
      } catch (err: any) {
        toast("Unggahan Gagal", err.message || "Gagal mengunggah file.", "error");
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast("Formulir Kosong", "Pertanyaan dan Jawaban FAQ tidak boleh kosong.", "error");
      return;
    }

    if (editingIndex !== null) {
      // Edit mode
      const updatedFaqs = [...faqs];
      updatedFaqs[editingIndex] = { q: newQuestion.trim(), a: newAnswer.trim() };
      setFaqs(updatedFaqs);
      setEditingIndex(null);
      toast("FAQ Diperbarui", "Pertanyaan FAQ berhasil disunting lokal.", "success");
    } else {
      // Add mode
      setFaqs([...faqs, { q: newQuestion.trim(), a: newAnswer.trim() }]);
      toast("FAQ Ditambahkan", "Pertanyaan FAQ ditambahkan ke daftar lokal.", "success");
    }

    setNewQuestion("");
    setNewAnswer("");
  };

  const handleEditFaqClick = (index: number) => {
    setNewQuestion(faqs[index].q);
    setNewAnswer(faqs[index].a);
    setEditingIndex(index);
  };

  const handleDeleteFaqClick = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
    toast("FAQ Dihapus", "FAQ dihapus dari daftar lokal.", "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Save Settings
      const settingsRes = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoText,
          logoAbbreviation,
          logoImageUrl,
          heroHeadline,
          heroDescription,
          heroTagline,
          heroBtnText,
          heroBtnLink,
          sectionWebinarTitle,
          sectionEventsTitle,
          sectionEventsSubtitle,
          sectionSpeakersTitle,
          sectionSpeakersSubtitle,
          sectionTestimonialsTitle,
          sectionTestimonialsSubtitle,
          sectionFaqTitle,
          sectionFaqSubtitle,
          heroCtaTitle,
          heroCtaDescription,
          certTitle,
          certIssuer,
          certSignatureName,
          certSignatureRole
        })
      });

      const settingsData = await settingsRes.json();
      if (!settingsRes.ok) {
        throw new Error(settingsData.error || "Gagal menyimpan pengaturan platform");
      }

      // 2. Save FAQs
      const faqsRes = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqs)
      });

      const faqsData = await faqsRes.json();
      if (!faqsRes.ok) {
        throw new Error(faqsData.error || "Gagal menyimpan daftar FAQ");
      }

      toast("Simpan Berhasil", "Semua konfigurasi platform dan FAQ berhasil disimpan ke disk.", "success");
    } catch (err: any) {
      toast("Gagal Menyimpan", err.message || "Terjadi kesalahan internal.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (session && (session.user as any).role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 animate-pulse" />
        <h2 className="text-lg font-bold text-slate-200">Akses Ditolak</h2>
        <p className="text-xs text-slate-500 max-w-xs">Anda tidak memiliki hak akses administrator untuk membuka halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-400 text-glow" />
          <span>Platform Settings Customizer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Kelola gambar logo, kustomisasi judul & deskripsi seksi landing page, serta sunting daftar FAQ.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs Menu */}
          <div className="flex border-b border-white/5 gap-2 pb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("website")}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === "website"
                  ? "bg-primary text-white border-primary shadow"
                  : "glass text-slate-400 border-white/5 hover:text-slate-200"
              }`}
            >
              <Layout className="h-4 w-4" />
              <span>Logo & Hero</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === "sections"
                  ? "bg-primary text-white border-primary shadow"
                  : "glass text-slate-400 border-white/5 hover:text-slate-200"
              }`}
            >
              <Layout className="h-4 w-4 text-purple-400" />
              <span>Judul Seksi Halaman</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === "faqs"
                  ? "bg-primary text-white border-primary shadow"
                  : "glass text-slate-400 border-white/5 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="h-4 w-4 text-green-400" />
              <span>Kelola FAQ ({faqs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("certificate")}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === "certificate"
                  ? "bg-primary text-white border-primary shadow"
                  : "glass text-slate-400 border-white/5 hover:text-slate-200"
              }`}
            >
              <Award className="h-4 w-4 text-yellow-400" />
              <span>Desain Sertifikat</span>
            </button>
          </div>

          {/* Tab 1: Logo & Hero Branding */}
          {activeTab === "website" && (
            <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/30 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Logo Website</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Logo Image Uploader */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Logo Gambar (Upload)</span>
                  <div className="relative border border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="Logo preview" className="h-16 object-contain mb-3 rounded-lg border border-white/5 bg-[#0b1626] p-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-slate-600 mb-2" />
                    )}
                    <label className="bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold px-3 py-1.5 rounded-lg text-slate-300 cursor-pointer flex items-center gap-1 shadow">
                      {uploadingLogo ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      <span>Pilih File</span>
                      <input type="file" onChange={handleLogoFileChange} accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Logo Fallback text inputs */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nama Logo (Teks)</label>
                      <input
                        type="text"
                        required
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        placeholder="Contoh: SeminarVerse"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Singkatan Logo (2-4 Huruf)</label>
                      <input
                        type="text"
                        required
                        value={logoAbbreviation}
                        onChange={(e) => setLogoAbbreviation(e.target.value)}
                        placeholder="Contoh: SV"
                        maxLength={5}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Info: Jika logo gambar diunggah, teks logo akan diganti oleh logo gambar di Navbar & Sidebar secara otomatis.</p>
                </div>
              </div>

              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 pt-2">Hero Header Landing</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tagline Atas</label>
                  <input
                    type="text"
                    required
                    value={heroTagline}
                    onChange={(e) => setHeroTagline(e.target.value)}
                    placeholder="Contoh: Next-Generation Headless CMS Platform"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Headline Utama</label>
                  <input
                    type="text"
                    required
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    placeholder="Ketik headline landing page..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Deskripsi Headline</label>
                <textarea
                  required
                  rows={3}
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  placeholder="Ketik deskripsi headline..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Teks Tombol Utama</label>
                  <input
                    type="text"
                    required
                    value={heroBtnText}
                    onChange={(e) => setHeroBtnText(e.target.value)}
                    placeholder="Contoh: Jelajahi Event"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Link Tombol Utama</label>
                  <input
                    type="text"
                    required
                    value={heroBtnLink}
                    onChange={(e) => setHeroBtnLink(e.target.value)}
                    placeholder="Contoh: /events"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Section Customizer */}
          {activeTab === "sections" && (
            <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/30 space-y-6">
              {/* Seksi Featured Webinar & Upcoming Events */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seksi Event & Kelas</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Judul Seksi Featured Webinar</label>
                    <input
                      type="text"
                      required
                      value={sectionWebinarTitle}
                      onChange={(e) => setSectionWebinarTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Judul Seksi Upcoming Events</label>
                      <input
                        type="text"
                        required
                        value={sectionEventsTitle}
                        onChange={(e) => setSectionEventsTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Deskripsi / Sub-judul Seksi Upcoming Events</label>
                      <input
                        type="text"
                        required
                        value={sectionEventsSubtitle}
                        onChange={(e) => setSectionEventsSubtitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seksi Speaker & Testimonials */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seksi Pembicara & Ulasan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Judul Seksi Keynote Speakers</label>
                    <input
                      type="text"
                      required
                      value={sectionSpeakersTitle}
                      onChange={(e) => setSectionSpeakersTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sub-judul Seksi Keynote Speakers</label>
                    <input
                      type="text"
                      required
                      value={sectionSpeakersSubtitle}
                      onChange={(e) => setSectionSpeakersSubtitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Judul Seksi Testimonial</label>
                    <input
                      type="text"
                      required
                      value={sectionTestimonialsTitle}
                      onChange={(e) => setSectionTestimonialsTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sub-judul Seksi Testimonial</label>
                    <input
                      type="text"
                      required
                      value={sectionTestimonialsSubtitle}
                      onChange={(e) => setSectionTestimonialsSubtitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi FAQ & Box CTA */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seksi FAQ & CTA Promosi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Judul Seksi FAQ</label>
                    <input
                      type="text"
                      required
                      value={sectionFaqTitle}
                      onChange={(e) => setSectionFaqTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sub-judul Seksi FAQ</label>
                    <input
                      type="text"
                      required
                      value={sectionFaqSubtitle}
                      onChange={(e) => setSectionFaqSubtitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Judul Banner Promosi CTA</label>
                    <input
                      type="text"
                      required
                      value={heroCtaTitle}
                      onChange={(e) => setHeroCtaTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Deskripsi Banner Promosi CTA</label>
                    <input
                      type="text"
                      required
                      value={heroCtaDescription}
                      onChange={(e) => setHeroCtaDescription(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: FAQ Manager */}
          {activeTab === "faqs" && (
            <div className="space-y-4">
              {/* FAQ Editor Form */}
              <div className="glass rounded-2xl border border-white/5 p-5 bg-navy-card/40 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center justify-between">
                  <span>{editingIndex !== null ? "Edit Pertanyaan FAQ" : "Tambah Pertanyaan FAQ Baru"}</span>
                  {editingIndex !== null && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingIndex(null); setNewQuestion(""); setNewAnswer(""); }}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Batal Edit
                    </button>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pertanyaan FAQ</label>
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Masukkan pertanyaan FAQ..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Jawaban FAQ</label>
                    <textarea
                      rows={2}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Masukkan jawaban dari pertanyaan FAQ di atas..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-cyan-400 text-[11px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow ml-auto cursor-pointer"
                  >
                    {editingIndex !== null ? <Check className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
                    <span>{editingIndex !== null ? "Simpan FAQ" : "Tambahkan FAQ"}</span>
                  </button>
                </div>
              </div>

              {/* FAQs Directory ledger */}
              <div className="glass rounded-2xl border border-white/5 bg-navy-card/20 divide-y divide-white/5">
                {faqs.length > 0 ? (
                  faqs.map((faq, index) => (
                    <div key={index} className="p-4 flex gap-4 items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200">Q: {faq.q}</h4>
                        <p className="text-[11px] text-slate-400">A: {faq.a}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditFaqClick(index)}
                          className="glass hover:bg-white/10 border border-white/10 p-1.5 rounded-lg text-slate-300 transition-all cursor-pointer"
                          title="Edit FAQ"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaqClick(index)}
                          className="glass hover:bg-red-500/10 border border-white/10 p-1.5 rounded-lg text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                          title="Hapus FAQ"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">Belum ada FAQ terdaftar. Tambahkan beberapa pertanyaan untuk ditampilkan di landing page.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Certificate Template */}
          {activeTab === "certificate" && (
            <div className="glass rounded-2xl border border-white/5 p-6 bg-navy-card/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Judul Sertifikat</label>
                  <input
                    type="text"
                    required
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="Contoh: CERTIFICATE OF COMPLETION"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Penerbit Sertifikat</label>
                  <input
                    type="text"
                    required
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    placeholder="Contoh: SeminarVerse Academy"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nama Penandatangan</label>
                  <input
                    type="text"
                    required
                    value={certSignatureName}
                    onChange={(e) => setCertSignatureName(e.target.value)}
                    placeholder="Contoh: Sarah Jenkins"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Jabatan Penandatangan</label>
                  <input
                    type="text"
                    required
                    value={certSignatureRole}
                    onChange={(e) => setCertSignatureRole(e.target.value)}
                    placeholder="Contoh: Sarah Jenkins, Program Chair"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-primary/80 border border-primary/20 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
