import Canvas from "./Canvas";
import Editing_Buttons from "./Editing_Buttons";
import { useState } from "react";

export default function WhiteBoard() {
	const [tool, setTool] = useState("hand");
	const [color, setColor] = useState("black");
	const [penSize, setPenSize] = useState(5);

	return (
		<>
			<Canvas tool={tool} color={color} penSize={penSize} />
			<Editing_Buttons
				setTool={setTool}
				color={color}
				setColor={setColor}
				penSize={penSize}
				setPenSize={setPenSize}
			/>
		</>
	);
}
