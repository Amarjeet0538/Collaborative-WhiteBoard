import { useEffect } from "react"
import { useRef } from "react"
import Editing_Buttons from "./Editing_Buttons"

export default function Canvas() {
  const canvasRef = useRef(null)

  useEffect(() => {})

  return (

    <div className="p-2 w-full h-full relative">
      <canvas
        id="canvas"
        ref={canvasRef}

        className="border-2 border-gray-300 rounded-lg w-full h-full "
        style={{
         background: "#fafafa",
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px),
          radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px, 24px 24px, 24px 24px",
      }}
      >
         Your browser does not support the HTML5 canvas element.
      </canvas>

      <Editing_Buttons />
    </div>
  )
}
