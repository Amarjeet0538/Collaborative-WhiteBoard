import { Button } from "@/components/ui/button";
import { PenLine, Hand } from "lucide-react";

export default function Editing_Buttons() {
  return (
    <div className="flex gap-2 absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <Button variant="outline" size="lg" className="text-lg cursor-pointer" >
        <PenLine />
      </Button>

       <Button variant="outline" size="lg" className="text-lg cursor-pointer">
        <Hand />
      </Button>
    </div>
  )
}
