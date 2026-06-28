export default function EraserTool({ eraserSize, setEraserSize, clearCanvas }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col gap-4">
      <div className="flex items-center gap-2 w-full">
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
          onClick={clearCanvas}
        >
          Clear
        </button>
        <input
          type="range"
          value={eraserSize}
          min="1"
          max="50"
          onChange={(e) => setEraserSize(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
