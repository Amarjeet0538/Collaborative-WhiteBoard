import { useRef } from "react";
import { ImagePlus } from "lucide-react";

export default function ImageTool({ onInsertImage }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onInsertImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-foreground/50 leading-snug">
        Upload an image to drop it onto the canvas, centered in your current
        view. Use the Select tool afterward to move or resize it.
      </p>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 h-10 rounded-lg
          bg-primary text-background hover:opacity-90
          transition-all cursor-pointer text-sm font-semibold"
      >
        <ImagePlus size={15} /> Upload image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
