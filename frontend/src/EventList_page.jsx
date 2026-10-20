import { useState } from "react";
import "./Events.css";
import "./EventAndNews.css";
import logo from "./assets/wmsu-logo.png";
import menu from "./assets/menu-dots.png";

const initialEvents = [
  {
    id: 1,
    title: "WMSU Grand Alumni Homecoming 2026",
    category: "Alumni Gathering",
    date: "November 21, 2026",
    time: "8:00 AM – 5:00 PM",
    location: "WMSU University Gymnasium & Quadrangle",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    description:
      "Reconnect with former professors, classmates, and friends. Celebrate milestones, university advancements, and the lifelong Crimson spirit across all colleges.",
    organizer: "WMSU Office of Alumni Affairs",
    capacity: 650,
    agenda: [
      "08:00 AM – Registration & Fellowship Breakfast",
      "09:30 AM – Thanksgiving Mass & University Parade",
      "11:00 AM – Presidential Address & State of the University",
      "12:30 PM – Grand Alumni Luncheon & College Gatherings",
      "02:30 PM – Jubilarian Recognition & Awards Ceremonies",
      "04:30 PM – Fellowship Night & Commemorative Photo",
    ],
  },
  {
    id: 2,
    title: "Alumni Career & Leadership Summit",
    category: "Career Development",
    date: "November 28, 2026",
    time: "9:00 AM – 3:30 PM",
    location: "Dr. Juanito Bruno Gymnasium & Online Stream",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    description:
      "A premier platform connecting seasoned professionals, emerging alumni leaders, and graduating students for mentorship, high-impact career panels, and strategic recruitment.",
    organizer: "WMSU Career Services & Alumni Network",
    capacity: 250,
    agenda: [
      "09:00 AM – Keynote: Global Trends & Regional Innovation",
      "10:30 AM – Industry Breakout: Tech, Education, Health & Engineering",
      "01:00 PM – Executive Mentorship Roundtables",
      "02:30 PM – Networking Mixer & Resume Matchmaking",
    ],
  },
  {
    id: 3,
    title: "Crimson Reach Community Outreach Mission",
    category: "Community Service",
    date: "December 5, 2026",
    time: "7:30 AM – 1:00 PM",
    location: "Barangay Limpapa & Remote Centers, Zamboanga City",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
    description:
      "Give back to the broader Zamboanga Peninsula community through free medical-dental clinics, book drives, and digital literacy workshops led by WMSU alumni volunteers.",
    organizer: "WMSU Alumni Volunteer Corps",
    capacity: 120,
    agenda: [
      "07:30 AM – Assembly at WMSU Main Campus Gate",
      "08:30 AM – Community Welcome & Needs Briefing",
      "09:00 AM – Concurrent Health & Educational Stations",
      "12:00 PM – Community Fellowship & Distribution of Supplies",
    ],
  },
  {
    id: 4,
    title: "Distinguished Alumni Recognition Gala",
    category: "University Event",
    date: "December 12, 2026",
    time: "5:30 PM – 9:30 PM",
    location: "WMSU Grand Ballroom & Social Hall",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    description:
      "Honoring outstanding alumni whose remarkable contributions to science, literature, public governance, and industry have brought honor and distinction to Western Mindanao State University.",
    organizer: "WMSU Board of Regents & Alumni Association",
    capacity: 300,
    agenda: [
      "05:30 PM – Red Carpet Arrival & Cocktail Reception",
      "06:30 PM – Conferment of Lifetime Achievement Citations",
      "08:00 PM – Gala Dinner & University Philharmonic Performance",
      "09:15 PM – The Alma Mater Hymn & Closing Toast",
    ],
  },
];

const categories = [
  "All Events",
  "Alumni Gathering",
  "Career Development",
  "Community Service",
  "University Event",
];

export function EventListPage({ onNavigate, showToast }) {
  const [events] = useState(initialEvents);
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvps, setRsvps] = useState({});
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const navLinks = [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "News", href: "/news" },
    { label: "Events", href: "/events" },
    { label: "Merch", href: "/#merch" },
  ];

  const handleNavigate = (e, path) => {
    if (e) e.preventDefault();
    setOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleRSVP = (event) => {
    const isCurrentlyRsvpd = !!rsvps[event.id];
    setRsvps((prev) => ({
      ...prev,
      [event.id]: !isCurrentlyRsvpd,
    }));

    if (showToast) {
      showToast(
        !isCurrentlyRsvpd
          ? `RSVP confirmed for "${event.title}"!`
          : `RSVP removed for "${event.title}".`,
        !isCurrentlyRsvpd ? "success" : "info"
      );
    }
  };

  const handleShare = (event) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      if (showToast) {
        showToast(`Link for "${event.title}" copied to clipboard!`, "success");
      }
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setFeedbackMessage("Please enter your feedback.");
      return;
    }
    setFeedbackMessage("Thank you for sharing your feedback with the Alumni Affairs!");
    setFeedback("");
    if (showToast) {
      showToast("Thank you for your feedback!", "success");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      activeCategory === "All Events" ||
      event.category === activeCategory;

    const matchesSearch = [
      event.title,
      event.category,
      event.location,
      event.description,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="events-page">
      {/* UNIFIED HEADER */}
      <header className="header">
        <a
          href="/#home"
          className="brand"
          onClick={(e) => handleNavigate(e, "/")}
          aria-label="WMSU Alumni Home"
        >
          <img src={logo} alt="WMSU logo" />
          <span>WMSU Alumni</span>
        </a>

        <nav className="desktop_nav" aria-label="Main navigation">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={item.label === "Events" ? "nav-link-active" : ""}
              aria-current={item.label === "Events" ? "page" : undefined}
              onClick={(e) => handleNavigate(e, item.href)}
            >
              {item.label}
            </a>
          ))}

          <a
            className="nav_login"
            href="/login"
            onClick={(e) => handleNavigate(e, "/login")}
          >
            Login / Sign Up
          </a>
        </nav>

        <div className="menu_wrap">
          <button
            type="button"
            className="menu_button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            <img src={menu} alt="" />
          </button>

          {open && (
            <div className="dropdown">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavigate(e, item.href)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/login"
                onClick={(e) => handleNavigate(e, "/login")}
              >
                Login / Sign Up
              </a>
              <a
                href="/register"
                onClick={(e) => handleNavigate(e, "/register")}
              >
                Join Community
              </a>
            </div>
          )}
        </div>
      </header>

      <main className="events-main">
        <div className="events-content">
          {/* HERO BANNER */}
          <section className="events-hero">
            <div className="events-hero-text">
              <span className="events-eyebrow">
                WESTERN MINDANAO STATE UNIVERSITY • ALUMNI ENGAGEMENT
              </span>

              <h1>
                {selectedEvent ? "Event Overview" : "Alumni Events & Gatherings"}
              </h1>

              <p className="events-subtitle">
                {selectedEvent
                  ? "Explore full schedule, venue details, and reserve your attendance with fellow alumni."
                  : "Reconnect with former classmates, expand your professional circle, and take part in university milestones."}
              </p>
            </div>

            <div className="events-hero-badge" aria-hidden="true">
              <span className="badge-crest">✦</span>
              <span className="badge-text">WMSU</span>
              <small>CALENDAR 2026</small>
            </div>
          </section>

          {selectedEvent ? (
            /* EVENT DETAILS VIEW */
            <section className="event-details fade-in">
              <button
                type="button"
                className="events-back-button"
                onClick={() => setSelectedEvent(null)}
              >
                <span>←</span> Back to All Events
              </button>

              <article className="event-details-card">
                <div className="event-details-image">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                  />
                  <span className="event-category-badge">
                    {selectedEvent.category}
                  </span>
                </div>

                <div className="event-details-body">
                  <div className="event-header-row">
                    <div>
                      <p className="event-organizer">
                        Organized by {selectedEvent.organizer}
                      </p>
                      <h2>{selectedEvent.title}</h2>
                    </div>

                    <button
                      type="button"
                      className="event-share-btn"
                      onClick={() => handleShare(selectedEvent)}
                      title="Share Event"
                    >
                      🔗 Share Event
                    </button>
                  </div>

                  <p className="event-details-description">
                    {selectedEvent.description}
                  </p>

                  <div className="event-information-grid">
                    <div className="event-information">
                      <span className="event-info-icon">📅</span>
                      <div>
                        <small>DATE</small>
                        <strong>{selectedEvent.date}</strong>
                      </div>
                    </div>

                    <div className="event-information">
                      <span className="event-info-icon">⏰</span>
                      <div>
                        <small>TIME</small>
                        <strong>{selectedEvent.time}</strong>
                      </div>
                    </div>

                    <div className="event-information">
                      <span className="event-info-icon">📍</span>
                      <div>
                        <small>VENUE</small>
                        <strong>{selectedEvent.location}</strong>
                      </div>
                    </div>

                    <div className="event-information">
                      <span className="event-info-icon">👥</span>
                      <div>
                        <small>EXPECTED ATTENDANCE</small>
                        <strong>{selectedEvent.capacity} Alumni &amp; Guests</strong>
                      </div>
                    </div>
                  </div>

                  <div className="event-agenda">
                    <h3>Program &amp; Agenda</h3>
                    <ul>
                      {selectedEvent.agenda.map((item, index) => (
                        <li key={item}>
                          <span className="agenda-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="event-rsvp-panel">
                    <div>
                      <h3>
                        {rsvps[selectedEvent.id]
                          ? "You are officially attending!"
                          : "Join your fellow graduates"}
                      </h3>
                      <p>
                        {rsvps[selectedEvent.id]
                          ? "Your seat is noted. We look forward to welcoming you back home to WMSU!"
                          : "Confirm your attendance to receive event reminders and check-in credentials."}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={
                        rsvps[selectedEvent.id]
                          ? "event-rsvp-button registered"
                          : "event-rsvp-button"
                      }
                      onClick={() => handleRSVP(selectedEvent)}
                    >
                      {rsvps[selectedEvent.id]
                        ? "✓ RSVP Confirmed"
                        : "RSVP to Attend →"}
                    </button>
                  </div>
                </div>
              </article>
            </section>
          ) : (
            /* EVENTS LIST VIEW */
            <>
              {/* SEARCH & FILTERS */}
              <div className="events-search-row">
                <div className="events-search">
                  <span aria-hidden="true" className="search-icon">🔍</span>
                  <input
                    type="search"
                    placeholder="Search by event title, category, or campus venue..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search events"
                  />
                  {search && (
                    <button
                      type="button"
                      className="events-clear-search"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="events-section-heading">
                <div>
                  <h2>Upcoming WMSU Events</h2>
                  <p>Browse through alumni activities and reunions</p>
                </div>

                <span className="events-count">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "Event Found" : "Events Available"}
                </span>
              </div>

              <div className="events-categories" role="tablist">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={
                      activeCategory === category
                        ? "events-category active"
                        : "events-category"
                    }
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* EVENTS GRID */}
              <section className="events-grid" aria-label="Event list">
                {filteredEvents.map((event) => (
                  <article className="event-card" key={event.id}>
                    <div className="event-card-image">
                      <img src={event.image} alt={event.title} loading="lazy" />
                      <span className="event-category-badge">
                        {event.category}
                      </span>
                    </div>

                    <div className="event-card-body">
                      <div className="event-card-date">
                        <span>📅</span>
                        <span>{event.date}</span>
                      </div>

                      <h3>{event.title}</h3>

                      <p className="event-card-description">
                        {event.description}
                      </p>

                      <div className="event-card-location">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>

                      <div className="event-card-footer">
                        <button
                          type="button"
                          className="event-details-button"
                          onClick={() => {
                            setSelectedEvent(event);
                            window.scrollTo({ top: 180, behavior: "smooth" });
                          }}
                        >
                          View Details <span>→</span>
                        </button>

                        <button
                          type="button"
                          className={
                            rsvps[event.id]
                              ? "event-quick-rsvp registered"
                              : "event-quick-rsvp"
                          }
                          onClick={() => handleRSVP(event)}
                          aria-pressed={!!rsvps[event.id]}
                        >
                          {rsvps[event.id] ? "✓ Attending" : "RSVP"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {filteredEvents.length === 0 && (
                <div className="events-empty-state">
                  <span className="empty-symbol">✦</span>
                  <h3>No matching alumni events</h3>
                  <p>
                    We couldn't find events matching "{search}". Try searching with different keywords or reset your filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All Events");
                    }}
                  >
                    Reset Search &amp; Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* CONSISTENT UNIFIED FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer_main">
          <div className="footer_brand">
            <a
              href="/#home"
              className="brand footer_logo"
              onClick={(e) => handleNavigate(e, "/")}
            >
              <img src={logo} alt="WMSU logo" />
              <span>WMSU Alumni</span>
            </a>
            <p>
              Keeping generations of WMSU graduates connected, informed, and engaged across the globe.
            </p>
          </div>

          <div className="footer_links">
            <h3>Explore</h3>
            <a href="/#about" onClick={(e) => handleNavigate(e, "/#about")}>About Us</a>
            <a href="/news" onClick={(e) => handleNavigate(e, "/news")}>News &amp; Updates</a>
            <a href="/events" onClick={(e) => handleNavigate(e, "/events")}>Events</a>
            <a href="/#merch" onClick={(e) => handleNavigate(e, "/#merch")}>Merchandise</a>
          </div>

          <div className="footer_links">
            <h3>Get Connected</h3>
            <a href="/login" onClick={(e) => handleNavigate(e, "/login")}>Login / Sign Up</a>
            <a href="/register" onClick={(e) => handleNavigate(e, "/register")}>Join Community</a>
            <a
              href="https://www.facebook.com/wmsu.edu.ph"
              target="_blank"
              rel="noopener noreferrer"
            >
              WMSU on Facebook ↗
            </a>
          </div>

          <div className="footer_feedback">
            <h3>Send us feedback</h3>
            <p>Help us improve your alumni event experience.</p>

            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                aria-label="Your feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share suggestions for future alumni gatherings..."
                rows="3"
              />

              <button type="submit" className="btn btn_primary">
                Submit Feedback
              </button>

              {feedbackMessage && (
                <p className="feedback_message" role="status">
                  {feedbackMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="footer_bottom">
          <p>© 2026 WMSU Alumni. All rights reserved.</p>
          <p>Western Mindanao State University • Normal Road, Baliwasan, Zamboanga City</p>
        </div>
      </footer>
    </div>
  );
}

export default EventListPage;
