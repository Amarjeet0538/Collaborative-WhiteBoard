import { Button } from "@/components/ui/button";
import { PenLine, Hand, Eraser } from "lucide-react";
import PenTool from "./ToolDetails/PenTool";
import { useState } from "react";

export default function Editing_Buttons({
	color,
	setColor,
	penSize,
	setPenSize,
	setTool,
}) {
	const [details, setDetails] = useState(false);

	return (
		<div className="flex gap-2 absolute bottom-4 left-1/2 transform -translate-x-1/2">
			<Button
				variant="outline"
				size="lg"
				className="text-lg cursor-pointer"
				onClick={() => {
					setTool("pen");
					setDetails(!details);
				}}
			>
				<PenLine />

				{details && (
					<div
						className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50"
					>
						<PenTool
							color={color}
							setColor={setColor}
							penSize={penSize}
							setPenSize={setPenSize}
						/>
					</div>
				)}
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
