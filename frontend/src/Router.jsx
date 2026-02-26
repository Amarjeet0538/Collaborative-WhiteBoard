import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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
		path: "/signup",
		element: <Signup />,
	},
]);

export default AppRouter;
