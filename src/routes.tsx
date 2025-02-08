import { createBrowserRouter } from "react-router-dom";
import ProtectedRoutes from "./protectedRoutes";
import Login from "./pages/login";
import Home from "./pages/home";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />, // Login page is always accessible without protection
  },
  {
    element: <ProtectedRoutes />, // Wrap protected routes with ProtectedRoutes
    children: [
      {
        path: '/home',
        element: <Home />, // Home page is protected
      },
    ],
  },
]);

export default router;
