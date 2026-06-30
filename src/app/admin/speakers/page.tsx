"use client";

import React, { useState } from "react";
import { MOCK_SPEAKERS, Speaker } from "@/lib/strapi";
import { 
  Plus, Search, Edit, Trash2, User, Building, 
  Briefcase, Mail, Link as LinkIcon, RefreshCw 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function AdminSpeakersPage() {
  const { toast } = useToast();
  const [speakers, setSpeakers] = useState<Speaker[]>(MOCK_SPEAKERS);
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [photo, setPhoto] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  const handleOpenAdd = () => {
    setEditingSpeaker(null);
    setName("");
    setBio("");
    setCompany("");
    setPosition("");
    setPhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400");
    setTwitter("");
    setLinkedin("");
    setGithub("");
    setModalOpen(true);
  };

  const handleOpenEdit = (spk: Speaker) => {
    setEditingSpeaker(spk);
    setName(spk.name);
    setBio(spk.bio);
    setCompany(spk.company);
    setPosition(spk.position);
    setPhoto(spk.photo);
    setTwitter(spk.socialMedia.twitter || "");
    setLinkedin(spk.socialMedia.linkedin || "");
    setGithub(spk.socialMedia.github || "");
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    toast("Speaker Removed", "The speaker profile has been deleted.", "success");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !position) {
      toast("Input required", "Please enter the speaker name, company, and position.", "info");
      return;
    }

    setModalLoading(true);

    setTimeout(() => {
      setModalLoading(false);
      
      const payload = {
        name,
        bio: bio || "Professional speaker at SeminarVerse events.",
        company,
        position,
        photo,
        socialMedia: {
          twitter: twitter || undefined,
          linkedin: linkedin || undefined,
          github: github || undefined
        }
      };

      if (editingSpeaker) {
        setSpeakers((prev) =>
          prev.map((s) => (s.id === editingSpeaker.id ? { ...s, ...payload } : s))
        );
        toast("Speaker Updated", "Speaker credentials modified successfully.", "success");
      } else {
        const newSpk: Speaker = {
          id: `spk-${Math.random().toString(36).substring(2, 6)}`,
          ...payload
        };
        setSpeakers((prev) => [newSpk, ...prev]);
        toast("Speaker Added", "New speaker profile has been created.", "success");
      }

      setModalOpen(false);
    }, 1200);
  };

  const filteredSpeakers = speakers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Speaker Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage profiles and social links of keynote presenters</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/80 border border-primary/25 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Speaker</span>
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
          placeholder="Filter by name or company..."
          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-700"
        />
      </div>

      {/* Speakers Grid list */}
      {filteredSpeakers.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden bg-navy-card/20">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Speaker details</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Social Media Links</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredSpeakers.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={s.photo} 
                          alt={s.name} 
                          className="h-10 w-10 rounded-full object-cover border border-white/10" 
                        />
                        <div className="space-y-0.5">
                          <span className="text-slate-100 font-bold text-sm block leading-snug">{s.name}</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1 max-w-[280px]">{s.bio}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 block">{s.position}</span>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{s.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {s.socialMedia.twitter && <span className="text-[10px] text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 rounded">Twitter</span>}
                        {s.socialMedia.linkedin && <span className="text-[10px] text-primary border border-primary/20 bg-primary/10 px-1.5 py-0.5 rounded">LinkedIn</span>}
                        {s.socialMedia.github && <span className="text-[10px] text-slate-300 border border-white/10 bg-white/5 px-1.5 py-0.5 rounded">GitHub</span>}
                        {!s.socialMedia.twitter && !s.socialMedia.linkedin && !s.socialMedia.github && <span className="text-slate-600 font-semibold italic text-[10px]">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="glass hover:bg-white/5 border border-white/10 p-2 rounded-lg text-cyan-400"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
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
          <p className="text-slate-400 text-sm">No speaker profiles match search query.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSpeaker ? "Modify Speaker Profile" : "Register Speaker"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Company / Org</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google DeepMind"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">Position / Job Title</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior AI Researcher"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Avatar Image URL</label>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Biography Details</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Provide a brief summary of the speaker's background..."
              rows={3}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-400 placeholder:text-slate-700"
            />
          </div>

          {/* Social Links Sub-Form */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Social Media Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">Twitter</span>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-slate-200 w-full focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">LinkedIn</span>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-slate-200 w-full focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">GitHub</span>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-slate-200 w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
                <span>Save Speaker</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
