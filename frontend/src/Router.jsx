import { createBrowserRouter } from "react-router-dom";
import App from "./App";

const AppRouter = createBrowserRouter([
	{
		path: "/",
		element: <App/>,
	}
]);

export default AppRouter;
