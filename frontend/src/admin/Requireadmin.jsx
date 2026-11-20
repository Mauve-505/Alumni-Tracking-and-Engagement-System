import { Navigate } from "react-router-dom";

function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("wmsu_user"));
  } catch {
    return null;
  }
}

export default function RequireAdmin({ children }) {
  const user = getAdminUser();
  const isDemoAdmin = typeof window !== "undefined" && localStorage.getItem("wmsu_demo_admin") === "true";

  if (!user && !isDemoAdmin) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && !isDemoAdmin) return <Navigate to="/home" replace />;
  return children;
}
