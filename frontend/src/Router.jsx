import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import ProtectedRoute from "./components/ProtectedRoute";
import JoinBoard from "./pages/JoinBoard";
const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/whiteboard/:id",
    element: (
      <ProtectedRoute>
        <ProjectPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/join/:code",
    element: <JoinBoard />,
  },
]);
export default AppRouter;
