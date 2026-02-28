import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";

export default function Header() {
	return (
		<div className="py-3 px-6 w-3/4 flex justify-between bg-gray-100 rounded-l-full rounded-r-full">
				<span className="font-bold font-heading text-4xl">Colloard</span>

				<div className="flex gap-5 ">
          {/* dark mode */}
					<div className="flex items-center space-x-2">
						<Switch id="dark-mode" />
						<Label htmlFor="dark-mode" className="text-lg">
							Dark Mode
						</Label>
					</div>

				<Link to="/login">
					<Button size="lg" className="text-lg cursor-pointer ">
						Get Started
					</Button>
				</Link>
			</div>
		</div>
	);
}



