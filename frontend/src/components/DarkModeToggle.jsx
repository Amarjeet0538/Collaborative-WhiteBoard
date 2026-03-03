import { useState } from "react";
import { Moon } from "lucide-react";
import { Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.body.classList.toggle("dark");
  };
  return (
    <button
      onClick={toggleDarkMode}
      className=" cursor-pointer p-3 mr-5 bg-(--bg-light) transition-all rounded-full"
    >
      {isDark ? <Moon /> : <Sun />}
    </button>
  );
}
