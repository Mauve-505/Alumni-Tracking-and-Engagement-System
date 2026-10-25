import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import './navbar.css';
import logo from './assets/wmsu-logo.png';
import menu from './assets/menu-dots.png';

// Navigation links for unauthenticated visitors (Landing, Login, Register)
const UNAUTHENTICATED_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'News & Updates', href: '/NewsAndUpdates_page' },
  { label: 'Events', href: '/Eventlist_page' },
  { label: 'Login / Sign Up', href: '/login' },
];

// Authenticated navigation items for logged-in alumni (Homepage, Profile)
const AUTHENTICATED_LINKS = [
  { label: 'Home', href: '/home' },
  { label: 'News & Updates', href: '/NewsAndUpdates_page' },
  { label: 'Events', href: '/Eventlist_page' },
  { label: 'Profile', href: '/profile' },
];

/* ==========================================================
   NAVBAR
   ========================================================== */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if the current view should show authenticated navigation
  const isAuthenticated =
    ['/home', '/profile'].includes(location.pathname) ||
    Boolean(
      typeof window !== 'undefined' &&
        localStorage.getItem('wmsu_user') &&
        !['/login', '/register', '/'].includes(location.pathname)
    );

  const activeLinks = isAuthenticated
    ? AUTHENTICATED_LINKS
    : UNAUTHENTICATED_LINKS;

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect logout to the backend session or token
  // invalidation mechanism when implementing authentication.
  const handleLogout = () => {
    try {
      localStorage.removeItem('wmsu_user');
      localStorage.removeItem('wmsu_role');
    } catch {
      // Storage unavailable; ignore
    }
    setOpen(false);
    navigate('/login');
  };

  // Close the dropdown when clicking outside it or pressing Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <header className="navbar">
      <Link
        className="navbar_brand"
        to={isAuthenticated ? '/home' : '/'}
        aria-label="WMSU Alumni Portal Home"
      >
        <img src={logo} alt="WMSU Logo" />
        <p>WMSU Alumni</p>
      </Link>

      {/* Dropdown Menu for Mobile & Responsive */}
      <div className="navbar_menu" ref={menuRef}>
        <button
          type="button"
          className="navbar_menu_button"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <img src={menu} alt="" />
        </button>

        {open && (
          <div className="navbar_dropdown">
            {activeLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <button
                type="button"
                className="navbar_dropdown_logout"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

/* ==========================================================
   LAYOUT: navbar on top, your page below it
   Use <Layout centered> for pages that show one centered card
   (like the register form).
   ========================================================== */
function Layout({ children, centered = false }) {
  return (
    <div className="layout">
      <Navbar />
      <main className={centered ? 'layout_main centered' : 'layout_main'}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
