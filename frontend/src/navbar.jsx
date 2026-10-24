import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './navbar.css'
import logo from './assets/wmsu-logo.png'
import menu from './assets/menu-dots.png'

// Dropdown links: change the paths to match your real routes.
const LINKS = [
  { label: 'Login/Signup', href: '/login' },
  { label: 'News', href: '/newsandupdates' },
  { label: 'Events', href: '/events' },
  // { label: 'Merch', href: '/merch' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Feedback', href: '/feedback' },
]

/* ==========================================================
   NAVBAR
   ========================================================== */
export function Navbar() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the dropdown when clicking outside it or pressing Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <header className="navbar">
      <Link className="navbar_brand" to="/">
        <img src={logo} alt="WMSU Logo" />
        <p>WMSU Alumni</p>
      </Link>

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
            {LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  )
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
  )
}

export default Layout