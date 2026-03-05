import Header from "../components/Header";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="p-2 font-body flex flex-col items-center bg-background-muted h-screen gap-2 ">
      <Header />

      <div className="flex-1 text-foreground  min-h-0">
        <Link to="/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
}
