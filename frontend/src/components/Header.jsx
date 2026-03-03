import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <div className="py-3 px-6 w-3/4 flex justify-between bg-gray-100 rounded-l-full rounded-r-full">
      <div className="font-heading font-semibold text-4xl ">
        Colloard<span className="text-green-500">.</span>
      </div>

      <div className="flex gap-5 ">
        {/* dark mode */}
        i<DarkModeToggle />
        <Link to="/login">
          <Button size="lg" className="text-lg cursor-pointer ">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
