import { EllipsisVertical } from "lucide-react";
export default function card({ text, time }) {
  return (
    <div
      className="bg-(--bg-light) p-5 flex flex-col gap-3
      justify-between items-left rounded-md"
    >
      <div className="w-full h-30 bg-(--bg-dark) border-(--border-muted)"></div>
      <span className="font-semibold w-1/2 text-lg mb-2">{text}</span>
      <span className="text-muted">{time}</span>
      <span className="text-muted">Peoples</span>
    </div>
  );
}
