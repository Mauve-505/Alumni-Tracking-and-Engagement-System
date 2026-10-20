import { useState, useEffect } from "react";
import NewsAndUpdatesPage from "./NewsAndUpdates_page.jsx";
import EventListPage from "./EventList_page.jsx";
import "./App.css";

function normalizeRoute(rawPath) {
  if (!rawPath) return "/";
  const path = rawPath.toLowerCase();

  if (path.includes("news")) return "/news";
  if (path.includes("event")) return "/events";
  return "/";
}

function getInitialRoute() {
  return normalizeRoute(window.location.pathname);
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(normalizeRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  function navigate(rawPath) {
    if (!rawPath) return;

    // Check if it contains a hash (e.g. "/#about" or "#about")
    if (rawPath.startsWith("#") || rawPath.includes("/#")) {
      const hash = rawPath.includes("#") ? rawPath.substring(rawPath.indexOf("#")) : "";
      window.history.pushState(null, "", "/" + hash);
      setCurrentRoute("/");

      // If we are already or now on the landing page, smoothly scroll to element
      setTimeout(() => {
        const targetId = hash.replace("#", "");
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
      return;
    }

    const route = normalizeRoute(rawPath);
    window.history.pushState(null, "", route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-container fade-in">
      {toast && (
        <div className={`toast-notification ${toast.type}`} role="status">
          <span>{toast.message}</span>
        </div>
      )}
      {currentRoute === "/news" && (
        <NewsAndUpdatesPage onNavigate={navigate} showToast={showToast} />
      )}
      {currentRoute === "/events" && (
        <EventListPage onNavigate={navigate} showToast={showToast} />
      )}
    </div>
  );
}

export default App;
