import { Button } from "@/components/ui/button";
import { PenLine, Hand, Eraser } from "lucide-react";

export default function Editing_Buttons({setTool}) {

	return (
		<div className="flex gap-2 absolute bottom-4 left-1/2 transform -translate-x-1/2">
			<Button
				variant="outline"
				size="lg"
				className="text-lg cursor-pointer"
				onClick={() => setTool("pen")}
			>
				<PenLine />
			</Button>

			<Button
				variant="outline"
				size="lg"
				className="text-lg cursor-pointer"
				onClick={() => setTool("hand")}
			>
				<Hand />
			</Button>

			<Button
				variant="outline"
				size="lg"
				className="text-lg cursor-pointer"
				onClick={() => setTool("eraser")}
			>
				<Eraser />
			</Button>
		</div>
	);
}
