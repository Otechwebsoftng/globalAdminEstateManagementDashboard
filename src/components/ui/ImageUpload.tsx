import { useEffect, useRef, useState } from "react";
import { Upload, User } from "lucide-react";

export interface ImageUploadProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  uploadLabel?: string;
  clearLabel?: string;
  maxSizeMb?: number;
  /** Longest edge in px; the file is downscaled before it becomes a data URL. */
  maxEdge?: number;
}

/**
 * Avatar picker. There is no upload endpoint yet, so the file is downscaled on
 * a canvas and handed back as a data URL — a raw phone photo would otherwise
 * base64 to several MB. Swapping in a real upload only changes this component.
 */
export default function ImageUpload({
  value, onChange,
  uploadLabel = "Upload New Photo",
  clearLabel = "Use blank avatar",
  maxSizeMb = 5,
  maxEdge = 256,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  useEffect(() => setError(""), [value]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMb}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-5">
      <div className="h-16 w-16 rounded-full border border-gray-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
        {value ? (
          <img src={value} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <User className="h-7 w-7 text-gray-300" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-lg shadow-blue-100 transition-all"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploadLabel}
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] font-black text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 transition-all"
          >
            {clearLabel}
          </button>
        </div>
        <p className="text-[10px] font-bold text-gray-400">JPG, PNG or WebP. Max {maxSizeMb}MB.</p>
        {error && <p className="text-[10px] font-bold text-rose-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
