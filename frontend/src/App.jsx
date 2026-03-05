import { useState } from "react";
import LandingPage from "./pages/LandingPage";

function App() {
  const [session, setSession] = useState(false);

  return (
    <div className="font-body">
      <LandingPage />
    </div>
  );
}

export default App;
