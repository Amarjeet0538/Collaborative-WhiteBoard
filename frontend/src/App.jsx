import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const [session, setSession] = useState(true);

  return (
    <div className="font-body">{session ? <Dashboard /> : <LandingPage />}</div>
  );
}

export default App;
