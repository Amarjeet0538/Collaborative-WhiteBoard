import { EllipsisVertical } from "lucide-react";
export default function card({ text, time }) {
  return (
    <div
      className=" p-5 flex flex-col gap-3
      justify-between items-left rounded-md bg-background hover:bg-background-highlight border-muted
      text-foreground"
    >
      <div className="w-60 h-30 bg-secondary rounded-md"></div>
      <div className="flex justify-between">
        <span className="font-semibold text-lg">{text}</span>
        <EllipsisVertical />
      </div>
      <div className="flex flex-col text-sm text-foreground/40 ">
        <span>{time}</span>
        <span>Peoples</span>
      </div>
    </div>
  );
}
