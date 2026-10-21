import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Home from "./pages/Home";
import WhiteboardPage from "./pages/WhiteboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import JoinBoard from "./pages/JoinBoard";
import AccountSettings from "./pages/AccountSettings";
import OAuthCallback from "./pages/OAuthCallback";
import ResetPassword from "./pages/ResetPassword";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/oauth/callback",
    element: <OAuthCallback />,
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
        <WhiteboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/join/:code",
    element: <JoinBoard />,
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <AccountSettings />
      </ProtectedRoute>
    ),
  },
]);

export default AppRouter;
