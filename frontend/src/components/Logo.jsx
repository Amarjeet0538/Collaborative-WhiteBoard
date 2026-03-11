import { useNavigate } from "react-router-dom";
export default function Logo() {
  const navigate = useNavigate();
  return (
    <button
      className="font-heading text-4xl text-foreground font-bold flex items-center cursor-pointer"
      onClick={() => navigate("/")}
    >
      Lienwand<span className="text-primary">.</span>
    </button>
  );
}
