import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("wmsu_user"));
  } catch {
    user = null;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/home" replace />;
  return children;
}