import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"


export default function Header() {
	return (
		<div className="p-2 flex justify-around ">
			<span className="font-bold font-heading text-4xl">WhiteBoard</span>


      <div className="flex gap-5 ">
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" />
          <Label htmlFor="dark-mode" className="text-lg">Dark Mode</Label>
        </div>

        <Button variant="outline" size="lg" className="text-lg">
          Login
        </Button>
      </div>

      
		</div>
	);
}
