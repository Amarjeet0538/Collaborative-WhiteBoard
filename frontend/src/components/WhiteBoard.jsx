import Canvas from "./Canvas";
import Editing_Buttons from "./Editing_Buttons";
import { useState } from "react";
import { useEffect } from "react";

export default function WhiteBoard() {
	const [tool, setTool] = useState("hand");
	useEffect(()=>{
    console.log(tool)
  },[tool])
	return (
		<>
			<Canvas tool={tool} />
			<Editing_Buttons setTool={setTool}/>
		</>
	);
}
