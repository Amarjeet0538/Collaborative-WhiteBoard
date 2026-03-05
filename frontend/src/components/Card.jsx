import { EllipsisVertical } from "lucide-react";
export default function card({ text, time }) {
  return (
    <div
      className=" p-4 flex flex-col gap-3
      justify-between items-left rounded-md bg-background hover:bg-background-highlight border border-border-muted/60 
            hover:border-border/40 text-foreground "
    >
      <div className="w-full h-40 bg-secondary rounded-md"></div>
      <div className="flex justify-between">
        <span className="font-semibold text-lg">{text}</span>
        <EllipsisVertical />
      </div>
      <div className="flex flex-col text-md text-foreground/50 ">
        <span>{time}</span>
        <span>Peoples</span>
      </div>
    </div>
  );
}
