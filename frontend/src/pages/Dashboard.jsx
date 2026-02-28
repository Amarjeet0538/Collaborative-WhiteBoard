import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
	const navigate = useNavigate();

	return (
		<div>
			<Button onClick={() => navigate("/project")}>Create Project</Button>
			<Button>Join Room </Button>
		</div>
	);
}
