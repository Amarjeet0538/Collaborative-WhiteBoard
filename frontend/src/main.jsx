import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./Router.jsx";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <StrictMode>
      <RouterProvider router={AppRouter} />
    </StrictMode>
  </AuthProvider>,
);
