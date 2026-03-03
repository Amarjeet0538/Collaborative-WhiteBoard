import { useState } from "react";
import { Moon } from "lucide-react";
import { Sun } from "lucide-react";
import { Button } from "./ui/button";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.body.classList.toggle("dark");
  };
  return (
    <Button
      variant="outline"
      onClick={toggleDarkMode}
      className="cursor-pointer border-none rounded-full "
    >
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
}
