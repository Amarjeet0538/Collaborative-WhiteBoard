import Canvas from "./Canvas";
import DarkModeToggle from "./DarkModeToggle";
import Editing_Buttons from "./Editing_Buttons";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "@/utils/api";
import socket from "@/utils/socket";
import { useAuth } from "@/context/useAuth";
import { use } from "react";

export default function Whiteboard() {
	const { id } = useParams();
	const [tool, setTool] = useState("pen");
	const [color, setColor] = useState("black");
	const [penSize, setPenSize] = useState(5);
	const [eraserSize, setEraserSize] = useState(20);
	const [zoom, setZoom] = useState(1);
	const [loadStrokes, setLoadStrokes] = useState([]);
	const [boardName, setBoardName] = useState("Untitled");
	const [saving, setSaving] = useState(false);
	const clearCanvasRef = useRef(null);
	const saveTimeout = useRef(null);

	// Add these new states inside Whiteboard component
	const [isRenamingBoard, setIsRenamingBoard] = useState(false);
	const [tempName, setTempName] = useState("");
	const nameInputRef = useRef(null);
	const [shareCode, setShareCode] = useState("");
	const [pendingRequests, setPendingRequests] = useState([]);
	const [copied, setCopied] = useState(false);
	const { user } = useAuth();
	const [cursors, setCursors] = useState({}); // { socketId: { username, color, x, y } }
	const [presentUsers, setPresentUsers] = useState([]); // who's online
	// Focus input when renaming starts
	useEffect(() => {
		if (isRenamingBoard) nameInputRef.current?.focus();
	}, [isRenamingBoard]);

	const handleRenameBoard = async () => {
		if (tempName.trim() && tempName !== boardName) {
			setBoardName(tempName.trim());
			try {
				await apiFetch(`/whiteboards/${id}`, {
					method: "PUT",
					body: JSON.stringify({ name: tempName.trim() }),
				});
			} catch (err) {
				console.error("Failed to rename", err);
			}
		}
		setIsRenamingBoard(false);
	};
	useEffect(() => {
		if (!id) return;
		const interval = setInterval(async () => {
			try {
				const data = await apiFetch(`/whiteboards/${id}`);
				setPendingRequests(data.pendingRequests || []);
			} catch (err) {
				console.error("Failed to retrieve pending requests ", err);
			}
		}, 5000);
		return () => clearInterval(interval);
	}, [id]);
	// Load whiteboard on mount
	useEffect(() => {
		const fetchBoard = async () => {
			try {
				const data = await apiFetch(`/whiteboards/${id}`);
				setBoardName(data.name);
				setLoadStrokes(data.strokes || []);
				setShareCode(data.shareCode || "");
				setPendingRequests(data.pendingRequests || []);
				console.log(
					"pendingRequests raw:",
					JSON.stringify(data.pendingRequests),
				); // ← add this
			} catch (err) {
				console.error("Failed to load whiteboard", err);
			}
		};
		if (id) fetchBoard();
	}, [id]);
	useEffect(() => {
		if (!id || !user) return;

		if (!socket.connected) {
			socket.connect();
		}

		socket.emit("join-board", {
			boardId: id,
			userId: user.id,
			username: user.name,
		});

		const onStrokeUpdate = ({ stroke }) =>
			setLoadStrokes((prev) => [...prev, stroke]);
		const onCursorMove = ({ socketId, username, color, x, y }) => {
			setCursors((prev) => ({
				...prev,
				[socketId]: { username, color, x, y },
			}));
		};
		const onCursorLeave = ({ socketId }) => {
			setCursors((prev) => {
				const updated = { ...prev };
				delete updated[socketId];
				return updated;
			});
		};
		const onPresenceUpdate = (users) => setPresentUsers(users);

		socket.on("stroke-update", onStrokeUpdate);
		socket.on("cursor-move", onCursorMove);
		socket.on("cursor-leave", onCursorLeave);
		socket.on("presence-update", onPresenceUpdate);

		return () => {
			socket.emit("leave-board", { boardId: id });

			socket.off("stroke-update", onStrokeUpdate);
			socket.off("cursor-move", onCursorMove);
			socket.off("cursor-leave", onCursorLeave);
			socket.off("presence-update", onPresenceUpdate);
		};
	}, [id, user]);
	useEffect(() => {
		const handleConnectError = (err) => {
			console.error("Socket connection error:", err.message);
		};

		socket.on("connect_error", handleConnectError);

		return () => {
			socket.off("connect_error", handleConnectError);
		};
	}, []);

	// Auto-save strokes with debounce (saves 1 second after last stroke)
	const handleStrokesChange = useCallback(
		(strokes) => {
			// Emit only the latest stroke (last one added)
			const latestStroke = strokes[strokes.length - 1];
			if (latestStroke) {
				socket.emit("stroke-update", { boardId: id, stroke: latestStroke });
			}

			// Auto-save as before
			if (saveTimeout.current) clearTimeout(saveTimeout.current);
			setSaving(true);
			saveTimeout.current = setTimeout(async () => {
				try {
					await apiFetch(`/whiteboards/${id}`, {
						method: "PUT",
						body: JSON.stringify({ strokes, name: boardName }),
					});
				} catch (err) {
					console.error("Failed to save", err);
				} finally {
					setSaving(false);
				}
			}, 1000);
		},
		[id, boardName],
	);

	const handleRespond = async (requestId, approve) => {
		console.log("sending requestId:", requestId, "type:", typeof requestId);
		try {
			await apiFetch(`/whiteboards/${id}/respond-request`, {
				method: "POST",
				body: JSON.stringify({ requestId, approve }),
			});
			setPendingRequests((prev) =>
				prev.filter((r) => r._id?.toString() !== requestId?.toString()),
			);
		} catch (err) {
			console.error("Failed to respond", err);
		}
	};

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			{/* Top left: board name */}
			<div
				className="z-10 absolute top-3 left-3 flex items-center gap-2
        px-2 py-1 rounded-md bg-background-highlight
    hover:bg-background text-foreground transition-all cursor-pointer"
			>
				{isRenamingBoard ? (
					<input
						ref={nameInputRef}
						value={tempName}
						onChange={(e) => setTempName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleRenameBoard();
							if (e.key === "Escape") setIsRenamingBoard(false);
						}}
						onBlur={handleRenameBoard}
						className="text-xl bg-background-highlight border-none focus:outline-none w-40"
					/>
				) : (
					<span
						className="text-xl cursor-text px-1"
						onDoubleClick={() => {
							setTempName(boardName);
							setIsRenamingBoard(true);
						}}
						title="Double click to rename"
					>
						{boardName}
					</span>
				)}

				{saving && (
					<span className="text-xs text-foreground-muted">Saving...</span>
				)}
			</div>

			{/* Top right: dark mode, share code */}
			<div className="absolute top-3 right-0 z-10 flex gap-1 ">
				{presentUsers.length > 0 && (
					<div
						className="absolute top-14 right-0 -translate-x-1/2 z-10 flex items-center gap-2
    bg-background border border-border-muted rounded-full px-3 py-1 shadow-sm"
					>
						{presentUsers.map((u, i) => (
							<div key={i} className="flex items-center gap-1">
								<div
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: u.color }}
								/>
								<span className="text-xs text-foreground">{u.username}</span>
							</div>
						))}
					</div>
				)}
				{shareCode && (
					<button
						onClick={() => {
							navigator.clipboard.writeText(
								`${window.location.origin}/join/${shareCode}`,
							);
							setCopied(true);
							setTimeout(() => setCopied(false), 2000);
						}}
						className="text-md px-2 py-1 rounded-md bg-background-highlight
    hover:bg-background text-foreground transition-all cursor-pointer"
					>
						{copied ? "✓ Copied!" : `Share: ${shareCode}`}
					</button>
				)}
				<DarkModeToggle />
			</div>

			<div>
				{pendingRequests.length > 0 && (
					<div className="absolute bottom-5 left-3 z-10 flex flex-col gap-2">
						{pendingRequests.map((pendingReq) => (
							<div
								key={pendingReq._id}
								className="flex items-center gap-3 bg-background border border-border-muted
        rounded-md px-3 py-2 text-sm text-foreground shadow-sm"
							>
								<span>User wants to edit</span>
								<button
									onClick={() => handleRespond(pendingReq._id, true)}
									className="px-2 py-1 bg-primary text-background rounded-md
          hover:bg-primary-hover text-xs cursor-pointer"
								>
									Approve
								</button>
								<button
									onClick={() => handleRespond(pendingReq._id, false)}
									className="px-2 py-1 bg-background-highlight text-foreground
          rounded-md hover:bg-red-500 hover:text-white text-xs cursor-pointer"
								>
									Deny
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			<Canvas
				tool={tool}
				color={color}
				penSize={penSize}
				eraserSize={eraserSize}
				zoom={zoom}
				setZoom={setZoom}
				onClearCanvas={(fn) => (clearCanvasRef.current = fn)}
				onStrokesChange={handleStrokesChange}
				loadStrokes={loadStrokes}
				onCursorMove={(x, y) =>
					socket.emit("cursor-move", { boardId: id, x, y })
				}
				cursors={cursors}
			/>

			<Editing_Buttons
				setTool={setTool}
				color={color}
				setColor={setColor}
				penSize={penSize}
				setPenSize={setPenSize}
				eraserSize={eraserSize}
				setEraserSize={setEraserSize}
				zoom={zoom}
				setZoom={setZoom}
				clearCanvas={() => clearCanvasRef.current?.()}
			/>
		</div>
	);
}
