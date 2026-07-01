"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Heading1, Heading2, Heading3, Bold, Italic, 
  AlignLeft, AlignCenter, AlignRight, Link2, 
  Image, RemoveFormatting, List, RefreshCw, Underline, Sparkles
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange,
  placeholder = "Tulis konten artikel Anda di sini..."
}) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Reference to persist Selection Range
  const savedRangeRef = useRef<Range | null>(null);

  // Sync initial content
  useEffect(() => {
    setIsMounted(true);
    if (editorRef.current) {
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML === "" || editorRef.current.innerHTML === "<p><br></p>") {
        editorRef.current.innerHTML = value || "<p><br></p>";
      } else if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "<p><br></p>";
      }
      document.execCommand("defaultParagraphSeparator", false, "p");
    }
  }, []);

  // Update content on input
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Keep track of cursor / text selection range
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (!savedRangeRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  // Run formatting commands
  const executeCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Toolbar commands wrapper
  const handleToolbarAction = (e: React.MouseEvent, command: string, arg: string = "") => {
    e.preventDefault();
    
    // FOCUS editor first before restoring range to avoid cursor reset
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    restoreSelection();
    executeCommand(command, arg);
    saveSelection();
  };

  // Bulletproof FormatBlock Heading handler
  const handleFormatBlock = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    
    // FOCUS editor first before restoring range to avoid cursor reset
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    restoreSelection();
    
    // Cross-browser formatBlock tag syntax fallback chain
    let success = document.execCommand("formatBlock", false, tag);
    if (!success) {
      success = document.execCommand("formatBlock", false, `<${tag.toUpperCase()}>`);
    }
    if (!success) {
      success = document.execCommand("formatBlock", false, `<${tag.toLowerCase()}>`);
    }
    
    handleInput();
    saveSelection();
  };

  // Keyboard Shortcuts Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Bold: Ctrl+B
    if (e.ctrlKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      executeCommand("bold");
    }
    // Italic: Ctrl+I
    if (e.ctrlKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      executeCommand("italic");
    }
    // Underline: Ctrl+U
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
      executeCommand("underline");
    }
  };

  const insertHTMLAtCursor = (html: string) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    
    const el = document.createElement("div");
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while ((node = el.firstChild)) {
      frag.appendChild(node);
    }
    range.insertNode(frag);
    handleInput();
  };

  // Direct Inline Image Upload Handler
  const handleImageUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("File Tidak Valid", "Hanya berkas gambar yang didukung.", "error");
      return;
    }

    setUploading(true);
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

        // Insert Image node with inline caption properties
        const altText = prompt("Ketik deskripsi alt gambar (SEO):", `Gambar ${file.name}`);
        const imgHtml = `
          <div class="my-6 text-center max-w-lg mx-auto">
            <img src="${data.url}" alt="${altText || ""}" class="rounded-2xl max-w-full border border-white/10 shadow-lg object-cover inline-block" />
            ${altText ? `<span class="text-[10px] text-slate-500 italic block mt-1.5">${altText}</span>` : ""}
          </div>
          <p><br></p>
        `;
        
        // Refocus editor area before inserting
        if (editorRef.current) {
          editorRef.current.focus();
        }
        restoreSelection();
        
        insertHTMLAtCursor(imgHtml);
        toast("Gambar Disisipkan", "Gambar berhasil ditambahkan ke dalam artikel.", "success");
      } catch (err: any) {
        toast("Gagal Unggah", err.message || "Gagal menyisipkan gambar.", "error");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct visual HTML insertion for links to bypass execCommand bugs
  const handleLinkInsertion = (e: React.MouseEvent) => {
    e.preventDefault();

    if (editorRef.current) {
      editorRef.current.focus();
    }
    restoreSelection();

    const sel = window.getSelection();
    let selectedText = "";
    if (sel && sel.rangeCount > 0) {
      selectedText = sel.toString().trim();
    }

    const url = prompt(
      selectedText 
        ? `Masukkan URL Tautan untuk "${selectedText}":` 
        : "Masukkan URL Tautan:", 
      "https://"
    );
    if (!url) return;

    if (selectedText) {
      const linkHtml = `<a href="${url}" target="_blank" class="text-cyan-400 underline hover:text-cyan-300 font-semibold">${selectedText}</a>`;
      insertHTMLAtCursor(linkHtml);
    } else {
      const text = prompt("Masukkan Teks Tautan (Anchor Text):", "Klik di sini");
      if (!text) return;
      const linkHtml = `<a href="${url}" target="_blank" class="text-cyan-400 underline hover:text-cyan-300 font-semibold">${text}</a>`;
      insertHTMLAtCursor(linkHtml);
    }

    saveSelection();
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
      {/* Visual Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-white/5 border-b border-white/10 text-slate-400 select-none">
        
        {/* Headings */}
        <button 
          type="button" 
          onMouseDown={(e) => handleFormatBlock(e, "h1")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Judul Utama (H1)"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => handleFormatBlock(e, "h2")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Judul Sekunder (H2)"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => handleFormatBlock(e, "h3")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Subjudul (H3)"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-1.5" />

        {/* Text Formatter styles */}
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "bold")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Tebal (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "italic")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Miring (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "underline")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Garis Bawah (Ctrl+U)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-1.5" />

        {/* Alignments */}
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "justifyLeft")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Rata Kiri"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "justifyCenter")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Rata Tengah"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "justifyRight")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Rata Kanan"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-1.5" />

        {/* Elements */}
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "insertUnorderedList")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Daftar List (Bullets)"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button" 
          onMouseDown={handleLinkInsertion} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
          title="Sisipkan Tautan (Link)"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>

        {/* Upload inline image */}
        <label 
          className="p-1.5 rounded hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer flex items-center"
          title="Sisipkan Gambar (Upload)"
        >
          {uploading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          ) : (
            <Image className="h-3.5 w-3.5" />
          )}
          <input type="file" onChange={handleImageUploadClick} accept="image/*" className="hidden" disabled={uploading} />
        </label>

        <div className="h-4 w-[1px] bg-white/10 mx-1.5" />

        {/* Clear formatting */}
        <button 
          type="button" 
          onMouseDown={(e) => handleToolbarAction(e, "removeFormat")} 
          className="p-1.5 rounded hover:bg-white/10 hover:text-red-400 transition-all cursor-pointer"
          title="Hapus Format Tulisan"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>

        <div className="ml-auto pr-2 flex items-center gap-1 text-[9px] text-cyan-400">
          <Sparkles className="h-3 w-3" />
          <span>Editor Visual Aktif</span>
        </div>
      </div>

      {/* Content editable pane */}
      <style>{`
        .wysiwyg-editor:empty::before {
          content: attr(data-placeholder);
          color: #475569;
          pointer-events: none;
          display: block;
        }
        .wysiwyg-editor h1 {
          font-size: 1.8rem !important;
          font-weight: 800 !important;
          color: #ffffff !important;
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
          line-height: 1.2 !important;
        }
        .wysiwyg-editor h2 {
          font-size: 1.4rem !important;
          font-weight: 700 !important;
          color: #f1f5f9 !important;
          margin-top: 0.8rem !important;
          margin-bottom: 0.4rem !important;
          display: block !important;
          line-height: 1.3 !important;
        }
        .wysiwyg-editor h3 {
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          color: #cbd5e1 !important;
          margin-top: 0.6rem !important;
          margin-bottom: 0.3rem !important;
          display: block !important;
          line-height: 1.4 !important;
        }
      `}</style>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={saveSelection}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="wysiwyg-editor w-full bg-[#050b14]/50 min-h-[350px] max-h-[450px] overflow-y-auto px-5 py-4 text-xs text-slate-200 outline-none leading-relaxed prose prose-invert max-w-none focus:ring-1 focus:ring-cyan-500/20 rounded-b-xl"
        style={{
          fontFamily: "var(--font-inter), sans-serif",
        }}
      />
    </div>
  );
};
