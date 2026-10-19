
import { useState, useEffect } from "react";
import LandingPage from "./landing_page.jsx";
import LoginPage from "./login_page.jsx";
import RegisterPage from "./register_page.jsx";

function getRoute() {
  const path = window.location.pathname.toLowerCase();

  if (path === "/login_page.jsx") return "/login_page.jsx";
  if (path === "/register_page.jsx") return "/register_page.jsx";

  return "/";
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(getRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(getRoute());
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  function navigate(path) {
    window.history.pushState(null, "", path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (currentRoute === "/login_page.jsx") {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentRoute === "/register_page.jsx") {
    return <RegisterPage onNavigate={navigate} />;
  }

  return <LandingPage onNavigate={navigate} />;
}

export default App;
