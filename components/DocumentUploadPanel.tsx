"use client";

import { useRef, useState } from "react";
import type { ExtractedData } from "@/lib/document-extractor";
export type { ExtractedData } from "@/lib/document-extractor";

type Props = {
  label: string;
  onExtracted: (data: Partial<ExtractedData>) => void;
  disabled?: boolean;
};

function accepted(file: File) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
  if (allowed.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return [".pdf", ".jpg", ".jpeg", ".png", ".webp"].some((ext) => lower.endsWith(ext));
}

export default function DocumentUploadPanel({ label, onExtracted, disabled = false }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "extracting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function addFiles(newFiles: File[]) {
    const valid = newFiles.filter(accepted);
    if (!valid.length) {
      setStatus("error");
      setErrorMsg("Unsupported file format.");
      return;
    }
    setStatus("idle");
    setErrorMsg("");
    setFiles((prev) => [...prev, ...valid]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files || []));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files || []));
    e.currentTarget.value = "";
  }

  async function handleExtract() {
    if (!files.length || disabled) return;
    setStatus("extracting");
    setErrorMsg("");
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/medical-quotes/extract-documents", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus("error");
        setErrorMsg(json.error || "Extraction failed.");
        return;
      }
      onExtracted((json.data || {}) as Partial<ExtractedData>);
      setStatus("success");
      setFiles([]);
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-5">
      <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-3">{label}</p>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/30 p-6 text-center hover:border-brand-blue/50 transition-colors"
      >
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Drag & drop files here or <span className="text-brand-blue font-semibold">browse</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF, JPG, PNG, WEBP - multiple files allowed</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 rounded-lg px-3 py-1.5"
            >
              <span className="truncate max-w-[80%]">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-slate-400 hover:text-red-500 ml-2 text-xs font-bold"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && status !== "extracting" && (
        <button
          type="button"
          onClick={handleExtract}
          disabled={disabled}
          className="mt-3 w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors disabled:opacity-60"
        >
          Extract & Auto-fill
        </button>
      )}

      {status === "extracting" && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <svg className="animate-spin h-4 w-4 text-brand-blue" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
          </svg>
          Extracting from documents…
        </div>
      )}
      {status === "success" && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-semibold">✓ Fields auto-filled from documents</p>
      )}
      {status === "error" && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}
    </div>
  );
}

