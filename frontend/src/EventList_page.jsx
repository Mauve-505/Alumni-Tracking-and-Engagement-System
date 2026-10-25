import { useEffect, useState } from "react";
import "./Events.css";
import "./EventAndNews.css";
import "./ContentManagement.css";
import logo from "./assets/wmsu-logo.png";
import menu from "./assets/menu-dots.png";
import { apiRequest, getSessionUser } from "./api";

const categories = ["All Events"];
const navLinks = [
  { label: "Home", href: "/home" },
  { label: "News & Updates", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Directory", href: "/directory" },
];

function mapEvent(event) {
  const date = new Date(event.event_date);
  return {
    ...event,
    category: "Alumni Event",
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    organizer: "WMSU Alumni Affairs",
    capacity: event.rsvp_count,
    agenda: [],
  };
}

function toDateTimeInput(value) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function EventListPage({ onNavigate, showToast }) {
  const [events, setEvents] = useState([]);
  const [user] = useState(getSessionUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [eventForm, setEventForm] = useState({ title: "", description: "", location: "", event_date: "" });
  const [rsvpRows, setRsvpRows] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/events");
      setEvents(data.map(mapEvent));
      setError("");
    } catch (err) {
      setError(err.message || "Could not load events.");
    } finally {
      setLoading(false);
    }
  };

  const loadRsvps = async () => {
    if (user?.role !== "admin") return;
    try {
      const data = await apiRequest(`/api/admin/rsvps?requester_id=${user.id}`);
      setRsvpRows(data);
    } catch (err) {
      setError(err.message || "Could not load RSVPs.");
    }
  };

  useEffect(() => {
    loadEvents();
    loadRsvps();
  }, []);

  const submitEvent = async (event) => {
    event.preventDefault();
    if (user?.role !== "admin") return;
    setSaving(true);
    setError("");
    try {
      await apiRequest(editingId ? `/api/events/${editingId}` : "/api/events", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventForm, requester_id: user.id }),
      });
      setEventForm({ title: "", description: "", location: "", event_date: "" });
      setEditingId(null);
      await loadEvents();
      showToast?.(editingId ? "Event updated." : "Event created.", "success");
    } catch (err) {
      setError(err.message || "Could not save event.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (event) => {
    if (!user?.id || !window.confirm(`Delete “${event.title}”?`)) return;
    try {
      await apiRequest(`/api/events/${event.id}?requester_id=${user.id}`, { method: "DELETE" });
      await loadEvents();
      await loadRsvps();
      if (selectedEvent?.id === event.id) setSelectedEvent(null);
      showToast?.("Event deleted.", "success");
    } catch (err) {
      setError(err.message || "Could not delete event.");
    }
  };


  const handleNavigate = (e, path) => {
    if (e) e.preventDefault();
    setOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleRSVP = async (event, response = "going") => {
    if (!user?.id || !user.profile_id) {
      setError("Log in with an alumni account to RSVP.");
      return;
    }
    try {
      await apiRequest(`/api/events/${event.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: user.id, response }),
      });
      setRsvps((previous) => ({ ...previous, [event.id]: response }));
      await loadEvents();
      if (user.role === "admin") await loadRsvps();
      setError("");
      showToast?.(`Response saved: ${response}.`, "success");
    } catch (err) {
      setError(err.message || "Could not save RSVP.");
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
    const matchesCategory = activeCategory === "All Events";

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

          {error && <p className="content-api-error" role="alert">{error}</p>}
          {loading && <p className="content-api-status">Loading events...</p>}

          {user?.role === "admin" && (
            <form className="content-admin-form" onSubmit={submitEvent}>
              <h2>{editingId ? "Edit event" : "Create an event"}</h2>
              <label>
                Title
                <input
                  value={eventForm.title}
                  onChange={(event) => setEventForm((form) => ({ ...form, title: event.target.value }))}
                  maxLength={200}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={eventForm.description}
                  onChange={(event) => setEventForm((form) => ({ ...form, description: event.target.value }))}
                  rows={3}
                />
              </label>
              <div className="content-admin-fields">
                <label>
                  Location
                  <input
                    value={eventForm.location}
                    onChange={(event) => setEventForm((form) => ({ ...form, location: event.target.value }))}
                    maxLength={200}
                  />
                </label>
                <label>
                  Date and time
                  <input
                    type="datetime-local"
                    value={eventForm.event_date}
                    onChange={(event) => setEventForm((form) => ({ ...form, event_date: event.target.value }))}
                    required
                  />
                </label>
              </div>
              <div className="content-admin-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
                </button>
                {editingId && (
                  <button type="button" className="secondary" onClick={() => {
                    setEditingId(null);
                    setEventForm({ title: "", description: "", location: "", event_date: "" });
                  }}>Cancel</button>
                )}
              </div>
            </form>
          )}

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
                {selectedEvent.image && (
                  <div className="event-details-image">
                    <img src={selectedEvent.image} alt={selectedEvent.title} />
                    <span className="event-category-badge">{selectedEvent.category}</span>
                  </div>
                )}

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
                        <strong>{selectedEvent.capacity} RSVP responses</strong>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.agenda.length > 0 && <div className="event-agenda">
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
                  </div>}

                  <div className="event-rsvp-panel">
                    <div>
                      <h3>
                        {rsvps[selectedEvent.id]
                          ? `Your response: ${rsvps[selectedEvent.id]}`
                          : "Join your fellow graduates"}
                      </h3>
                      <p>
                        {rsvps[selectedEvent.id]
                          ? "Your response has been saved for this event."
                          : "Choose your response to let the organizers know if you plan to attend."}
                      </p>
                    </div>

                    <div className="event-rsvp-options" aria-label="RSVP response">
                      {["going", "maybe", "declined"].map((response) => (
                        <button
                          key={response}
                          type="button"
                          className={rsvps[selectedEvent.id] === response ? "selected" : ""}
                          onClick={() => handleRSVP(selectedEvent, response)}
                        >
                          {response === "going" ? "Going" : response === "maybe" ? "Maybe" : "Can't go"}
                        </button>
                      ))}
                    </div>
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
                {!loading && filteredEvents.map((event) => (
                  <article className="event-card" key={event.id}>
                    {event.image && (
                      <div className="event-card-image">
                        <img src={event.image} alt={event.title} loading="lazy" />
                        <span className="event-category-badge">{event.category}</span>
                      </div>
                    )}

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
                          onClick={() => handleRSVP(event, "going")}
                          aria-pressed={rsvps[event.id] === "going"}
                        >
                          {rsvps[event.id] === "going" ? "✓ Going" : "RSVP"}
                        </button>
                      </div>
                      {user?.role === "admin" && (
                        <div className="content-item-actions">
                          <button type="button" onClick={() => {
                            setEditingId(event.id);
                            setEventForm({
                              title: event.title,
                              description: event.description || "",
                              location: event.location || "",
                              event_date: toDateTimeInput(event.event_date),
                            });
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}>Edit</button>
                          <button type="button" onClick={() => deleteEvent(event)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </section>

              {!loading && filteredEvents.length === 0 && !error && (
                <div className="events-empty-state">
                  <span className="empty-symbol">✦</span>
                  <h3>{events.length === 0 ? "No events have been scheduled yet" : "No matching alumni events"}</h3>
                  <p>
                    {events.length === 0
                      ? "New events will appear here when they are created."
                      : `We couldn't find events matching "${search}". Try other keywords or reset your filters.`}
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

              {user?.role === "admin" && (
                <section className="content-admin-roster">
                  <h2>Event RSVPs</h2>
                  {rsvpRows.length === 0 ? (
                    <p>No RSVP responses yet.</p>
                  ) : (
                    <div className="content-roster-table-wrap">
                      <table>
                        <thead><tr><th>Event</th><th>Alumni</th><th>Email</th><th>Response</th></tr></thead>
                        <tbody>
                          {rsvpRows.map((row) => (
                            <tr key={row.id}>
                              <td>{row.event_title}</td>
                              <td>{row.first_name} {row.last_name}</td>
                              <td>{row.email}</td>
                              <td>{row.response}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
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
