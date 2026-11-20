import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Events.css";
import "./EventAndNews.css";
import "./ContentManagement.css";
import logo from "./assets/wmsu-logo.png";
import menu from "./assets/menu-dots.png";
import schoolPic from "./assets/wmsu_school_picture.jpg";
import buildingPic from "./assets/wmsu-building.png";
import heroPic from "./assets/hero.png";
import { getSessionUser } from "./api";
import {
  getStoredEvents,
  saveStoredEvent,
  deleteStoredEvent,
  toggleStoredEventStatus,
  getUserRsvps,
  recordEventRsvp,
  cancelEventRsvp,
} from "./contentStore.js";

const categories = [
  "All Events",
  "Alumni Homecoming",
  "Career Fair",
  "Webinar",
  "Sports & Culture",
];

const presetImages = [
  { label: "WMSU Campus", url: schoolPic },
  { label: "Admin Building", url: buildingPic },
  { label: "Alumni Gathering", url: heroPic },
];

const navLinks = [
  { label: "Home", href: "/home" },
  { label: "News & Updates", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Directory", href: "/directory" },
  { label: "Alumni Census", href: "/survey" },
];

export function EventListPage({ onNavigate, showToast }) {
  const navigate = useNavigate();
  // BACKEND CONNECTION POINT:
  // Groupmates: In production, load the authenticated user session from your backend.
  const [sessionUser] = useState(getSessionUser);
  const [isAdminMode, setIsAdminMode] = useState(
    () => sessionUser?.role === "admin" || localStorage.getItem("wmsu_demo_admin") === "true"
  );

  // BACKEND CONNECTION POINT:
  // Groupmates: Replace frontend-store retrieval with `GET /api/events`
  // and handle database-backed event fetching.
  const [events, setEvents] = useState(getStoredEvents);
  const [userRsvps, setUserRsvps] = useState(getUserRsvps);
  const [loading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'draft'
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openNav, setOpenNav] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Event form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Alumni Homecoming",
    location: "WMSU Gymnasium, Baliwasan, Zamboanga City",
    event_date: "",
    start_time: "08:00",
    end_time: "17:00",
    rsvp_deadline: "",
    image: schoolPic,
    status: "published",
    organizer: "WMSU Alumni Affairs Office",
  });

  const fileInputRef = useRef(null);

  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    showToast?.(msg, type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleAdminMode = () => {
    const next = !isAdminMode;
    setIsAdminMode(next);
    localStorage.setItem("wmsu_demo_admin", next ? "true" : "false");
    triggerToast(next ? "Admin mode enabled" : "Admin mode disabled", "info");
  };

  // Open modal for creating new event
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      category: "Alumni Homecoming",
      location: "WMSU Gymnasium, Baliwasan, Zamboanga City",
      event_date: "",
      start_time: "09:00",
      end_time: "17:00",
      rsvp_deadline: "",
      image: schoolPic,
      status: "published",
      organizer: "WMSU Alumni Affairs Office",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing existing event
  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      id: event.id,
      title: event.title,
      description: event.description || "",
      category: event.category || "Alumni Homecoming",
      location: event.location || "",
      event_date: event.event_date || "",
      start_time: event.start_time || "09:00",
      end_time: event.end_time || "17:00",
      rsvp_deadline: event.rsvp_deadline || "",
      image: event.image || schoolPic,
      status: event.status || "published",
      organizer: event.organizer || "WMSU Alumni Affairs Office",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormErrors({});
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect image uploads to POST /api/upload or S3/Cloudinary storage.
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, image: "Please select an image file (PNG, JPG, WebP)." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, image: "Image size must be less than 5 MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setFormErrors((prev) => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form submission: Create or Edit Event
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Event title is required.";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Event title should be at least 5 characters.";
    }

    if (!formData.event_date) {
      errors.event_date = "Event date is required.";
    }

    if (!formData.location.trim()) {
      errors.location = "Venue or location is required.";
    }

    if (!formData.start_time) {
      errors.start_time = "Start time is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // BACKEND CONNECTION POINT:
    // Groupmates: Connect to:
    // - POST /api/events (creating new event)
    // - PATCH /api/events/:id (updating existing event)
    const eventPayload = {
      ...formData,
      organizer: formData.organizer || "WMSU Alumni Affairs Office",
    };

    const updated = saveStoredEvent(eventPayload);
    setEvents(updated);

    if (selectedEvent && selectedEvent.id === formData.id) {
      const match = updated.find((ev) => ev.id === formData.id);
      if (match) setSelectedEvent(match);
    }

    handleCloseModal();
    triggerToast(
      editingEvent
        ? "Event updated successfully."
        : formData.status === "draft"
        ? "Event saved as draft."
        : "Event scheduled and published."
    );
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect to DELETE /api/events/:id?requester_id=...
  const handleConfirmDelete = () => {
    if (!deletingEvent) return;
    const updated = deleteStoredEvent(deletingEvent.id);
    setEvents(updated);
    if (selectedEvent?.id === deletingEvent.id) {
      setSelectedEvent(null);
    }
    setDeletingEvent(null);
    triggerToast(`“${deletingEvent.title}” was deleted.`, "info");
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect to PATCH /api/events/:id with { status: "published" | "draft" }
  const handleToggleStatus = (event) => {
    const updated = toggleStoredEventStatus(event.id);
    setEvents(updated);
    const newStatus = event.status === "published" ? "draft" : "published";
    triggerToast(`Event status changed to ${newStatus}.`);
  };

  // =========================================================================
  // INTERACTIVE RSVP COUNTER HANDLER (FRONTEND-ONLY)
  // =========================================================================
  /**
   * BACKEND CONNECTION POINT:
   * Groupmates: Connect RSVP submission to POST /api/events/:id/rsvp with
   * `{ requester_id, response }`.
   *
   * FRONTEND BEHAVIOR:
   * - Updates attendee count immediately without page refresh.
   * - Prevents repeated clicks by the same user from increasing count.
   * - If user cancels RSVP, count is decremented accordingly.
   */
  const handleRsvpAction = (event, response = "going") => {
    const currentStatus = userRsvps[event.id];

    // If clicking the current response, toggle/cancel RSVP
    if (currentStatus === response) {
      const { events: updated } = cancelEventRsvp(event.id);
      setEvents(updated);
      setUserRsvps((prev) => {
        const next = { ...prev };
        delete next[event.id];
        return next;
      });
      if (selectedEvent && selectedEvent.id === event.id) {
        const match = updated.find((e) => e.id === event.id);
        if (match) setSelectedEvent(match);
      }
      triggerToast("Your RSVP has been cancelled. Attendee count updated.", "info");
      return;
    }

    // Otherwise, record RSVP (Going / Maybe)
    const userPayload = sessionUser || {
      name: "Current Alumni User",
      email: "alumni.session@wmsu.edu.ph",
      course: "WMSU Degree Program",
      graduation_year: "Recent Batch",
    };

    const { events: updated } = recordEventRsvp(event.id, userPayload, response);
    setEvents(updated);
    setUserRsvps((prev) => ({ ...prev, [event.id]: response }));

    if (selectedEvent && selectedEvent.id === event.id) {
      const match = updated.find((e) => e.id === event.id);
      if (match) setSelectedEvent(match);
    }

    triggerToast(
      response === "going"
        ? "✓ RSVP Confirmed: Going! Attendee count updated."
        : "RSVP noted as Maybe. Attendee count updated."
    );
  };

  const handleNavigate = (e, path) => {
    if (e) e.preventDefault();
    setOpenNav(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleShare = (event) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      triggerToast(`Link for "${event.title}" copied to clipboard!`);
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
    triggerToast("Thank you for your feedback!");
  };

  // Filtered events
  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      activeCategory === "All Events" || event.category === activeCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && event.status !== "draft") ||
      (statusFilter === "draft" && event.status === "draft");

    // Non-admins only see published events unless admin mode active
    if (!isAdminMode && event.status === "draft") {
      return false;
    }

    const matchesSearch = [
      event.title,
      event.category,
      event.location,
      event.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="events-page">
      {/* TOAST FEEDBACK NOTIFICATION */}
      {toastMessage && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: toastMessage.type === "info" ? "#102d50" : "#a51f2b",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: 10000,
            fontSize: "14px",
            fontWeight: 600,
            animation: "wmsuFadeIn 0.2s ease-out",
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* UNIFIED HEADER */}
      <header className="header">
        <div className="menu_wrap">
          <button
            type="button"
            className="menu_button"
            onClick={() => setOpenNav(!openNav)}
            aria-label="Toggle navigation menu"
            aria-expanded={openNav}
          >
            <img src={menu} alt="" />
          </button>

          {openNav && (
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
              <a href="/login" onClick={(e) => handleNavigate(e, "/login")}>
                Login / Sign Up
              </a>
              <a href="/register" onClick={(e) => handleNavigate(e, "/register")}>
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

          {/* ADMIN CONTROLS TOOLBAR */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              margin: "18px 0 24px",
              padding: "14px 18px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#102d50",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Admin Mode:
              </span>
              <button
                type="button"
                className={`wmsu-btn ${isAdminMode ? "wmsu-btn-primary" : "wmsu-btn-secondary"}`}
                style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={toggleAdminMode}
                title="Toggle admin mode to test creating, editing, and deleting events"
              >
                {isAdminMode ? "✓ Admin Controls Active" : "Enable Admin Controls"}
              </button>
            </div>

            {isAdminMode && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a
                  href="/admin/content"
                  className="wmsu-btn wmsu-btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                  onClick={(e) => handleNavigate(e, "/admin/content")}
                >
                  ⚙️ Content Management Screen
                </a>
                <button
                  type="button"
                  className="wmsu-btn wmsu-btn-primary"
                  onClick={handleOpenCreateModal}
                  id="open-create-event-modal-btn"
                >
                  + Create New Event
                </button>
              </div>
            )}
          </div>

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
                        Organized by {selectedEvent.organizer || "WMSU Alumni Affairs"}
                      </p>
                      <h2>{selectedEvent.title}</h2>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="event-share-btn"
                        onClick={() => handleShare(selectedEvent)}
                        title="Share Event"
                      >
                        🔗 Share
                      </button>
                    </div>
                  </div>

                  <p className="event-details-description">
                    {selectedEvent.description}
                  </p>

                  <div className="event-information-grid">
                    <div className="event-information">
                      <span className="event-info-icon">📅</span>
                      <div>
                        <small>DATE</small>
                        <strong>{selectedEvent.event_date}</strong>
                      </div>
                    </div>

                    <div className="event-information">
                      <span className="event-info-icon">⏰</span>
                      <div>
                        <small>TIME</small>
                        <strong>
                          {selectedEvent.start_time} - {selectedEvent.end_time || "End"}
                        </strong>
                      </div>
                    </div>

                    <div className="event-information">
                      <span className="event-info-icon">📍</span>
                      <div>
                        <small>VENUE</small>
                        <strong>{selectedEvent.location}</strong>
                      </div>
                    </div>

                    {/* CURRENT RSVP COUNT ON DETAILS PAGE */}
                    <div className="event-information" style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}>
                      <span className="event-info-icon">👥</span>
                      <div>
                        <small>ATTENDEE COUNT</small>
                        <strong style={{ color: "#a51f2b", fontSize: "16px" }}>
                          {selectedEvent.rsvp_count || 0} Alumni Attending
                        </strong>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.rsvp_deadline && (
                    <div style={{ margin: "14px 0", padding: "10px 14px", background: "#fef3c7", borderRadius: "8px", fontSize: "13px", color: "#92400e" }}>
                      ⏳ <strong>RSVP Deadline:</strong> Please confirm your attendance before {selectedEvent.rsvp_deadline}.
                    </div>
                  )}

                  {/* AGENDA SECTION */}
                  {selectedEvent.agenda && selectedEvent.agenda.length > 0 && (
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
                  )}

                  {/* INTERACTIVE RSVP PANEL */}
                  <div className="event-rsvp-panel">
                    <div>
                      <h3>
                        {userRsvps[selectedEvent.id]
                          ? `Your RSVP Status: ${userRsvps[selectedEvent.id].toUpperCase()}`
                          : "Reserve Your Spot Today"}
                      </h3>
                      <p>
                        {userRsvps[selectedEvent.id]
                          ? "Click again or choose another option to change or cancel your RSVP."
                          : "Confirm your attendance to connect with university leadership and fellow alumni."}
                      </p>
                    </div>

                    <div className="event-rsvp-options" aria-label="RSVP response">
                      <button
                        type="button"
                        className={userRsvps[selectedEvent.id] === "going" ? "selected" : ""}
                        onClick={() => handleRsvpAction(selectedEvent, "going")}
                      >
                        {userRsvps[selectedEvent.id] === "going" ? "✓ Attending (Going)" : "Going"}
                      </button>
                      <button
                        type="button"
                        className={userRsvps[selectedEvent.id] === "maybe" ? "selected" : ""}
                        onClick={() => handleRsvpAction(selectedEvent, "maybe")}
                      >
                        Maybe
                      </button>
                      {userRsvps[selectedEvent.id] && (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleRsvpAction(selectedEvent, "cancel")}
                          title="Cancel your RSVP"
                        >
                          ✕ Cancel RSVP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ATTENDEE LIST BUTTON & ADMIN CONTROLS */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      type="button"
                      className="wmsu-btn wmsu-btn-secondary"
                      onClick={() => setViewingAttendeesEvent(selectedEvent)}
                    >
                      👥 View Registered Attendees ({selectedEvent.attendees?.length || selectedEvent.rsvp_count || 0})
                    </button>

                    {isAdminMode && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="wmsu-btn wmsu-btn-secondary"
                          onClick={() => handleOpenEditModal(selectedEvent)}
                        >
                          ✏️ Edit Event
                        </button>
                        <button
                          type="button"
                          className="wmsu-btn wmsu-btn-outline-danger"
                          onClick={() => setDeletingEvent(selectedEvent)}
                        >
                          🗑️ Delete Event
                        </button>
                      </div>
                    )}
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

                {isAdminMode && (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                      Status:
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        background: "#fff",
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="published">Published Only</option>
                      <option value="draft">Drafts Only</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="events-section-heading">
                <div>
                  <h2>Upcoming WMSU Events</h2>
                  <p>Browse through alumni activities, reunions, and webinars</p>
                </div>

                <span className="events-count">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "Event Found" : "Events Available"}
                </span>
              </div>

              {/* CATEGORY TABS */}
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
                {!loading && filteredEvents.map((event) => {
                  const isUserGoing = userRsvps[event.id] === "going";
                  const isUserMaybe = userRsvps[event.id] === "maybe";

                  return (
                    <article className="event-card" key={event.id}>
                      {event.image && (
                        <div className="event-card-image">
                          <img src={event.image} alt={event.title} loading="lazy" />
                          <span className="event-category-badge">{event.category}</span>
                        </div>
                      )}

                      <div className="event-card-body">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div className="event-card-date">
                            <span>📅</span>
                            <span>{event.event_date}</span>
                          </div>

                          {event.status === "draft" && (
                            <span className="status-pill draft">
                              <span className="status-pill-dot" /> Draft
                            </span>
                          )}
                        </div>

                        <h3>{event.title}</h3>

                        <p className="event-card-description">
                          {event.description}
                        </p>

                        <div className="event-card-location">
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>

                        {/* DISPLAY CURRENT RSVP COUNT ON CARD */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "12px 0 6px" }}>
                          <div className={`rsvp-counter-badge ${isUserGoing ? "active-user" : ""}`}>
                            <span>👥</span>
                            <span>
                              <strong>{event.rsvp_count || 0}</strong> {event.rsvp_count === 1 ? "Attending" : "Attending"}
                            </span>
                          </div>

                          {/* ATTENDEE LIST TRIGGER */}
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#102d50",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              textDecoration: "underline",
                              padding: "4px",
                            }}
                            onClick={() => setViewingAttendeesEvent(event)}
                          >
                            Attendee Roster ↗
                          </button>
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

                          {/* INTERACTIVE RSVP BUTTON (MUST HAVE) */}
                          <button
                            type="button"
                            className={
                              isUserGoing
                                ? "event-quick-rsvp registered"
                                : isUserMaybe
                                ? "event-quick-rsvp"
                                : "event-quick-rsvp"
                            }
                            style={{
                              background: isUserGoing ? "#15803d" : isUserMaybe ? "#d97706" : undefined,
                              borderColor: isUserGoing ? "#15803d" : isUserMaybe ? "#d97706" : undefined,
                              color: isUserGoing || isUserMaybe ? "#ffffff" : undefined,
                            }}
                            onClick={() => handleRsvpAction(event, "going")}
                            aria-pressed={isUserGoing}
                            title={isUserGoing ? "Click to cancel RSVP" : "Click to RSVP"}
                          >
                            {isUserGoing ? "✓ Going" : isUserMaybe ? "? Maybe" : "RSVP"}
                          </button>
                        </div>

                        {isAdminMode && (
                          <div className="content-item-actions">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(event)}
                              title="Edit event details"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(event)}
                              title={event.status === "published" ? "Save as draft" : "Publish event"}
                            >
                              {event.status === "published" ? "Draft" : "Publish"}
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => setDeletingEvent(event)}
                              title="Delete event"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>

              {!loading && filteredEvents.length === 0 && (
                <div className="events-empty-state">
                  <span className="empty-symbol">✦</span>
                  <h3>{events.length === 0 ? "No events scheduled yet" : "No matching alumni events"}</h3>
                  <p>
                    {events.length === 0
                      ? "New events will appear here when they are published."
                      : `We couldn't find events matching "${search}". Try other keywords or reset your filters.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All Events");
                      setStatusFilter("all");
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

      {/* =====================================================================
          EVENT CREATION & EDIT MODAL
          ===================================================================== */}
      {isModalOpen && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
        >
          <div className="wmsu-modal wmsu-modal-lg">
            <div className="wmsu-modal-header">
              <h3 id="event-modal-title">
                {editingEvent ? "✏️ Edit Event" : "📅 Create New Alumni Event"}
              </h3>
              <button
                type="button"
                className="wmsu-modal-close"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="wmsu-modal-body">
                {/* EVENT TITLE */}
                <div className="wmsu-form-group">
                  <label htmlFor="event-title">
                    Event Title <span className="required-mark">*</span>
                  </label>
                  <input
                    id="event-title"
                    name="title"
                    type="text"
                    placeholder="e.g. WMSU Grand Alumni Homecoming 2026"
                    value={formData.title}
                    onChange={handleFormChange}
                    maxLength={200}
                    required
                  />
                  {formErrors.title && (
                    <small style={{ color: "#dc2626", marginTop: "4px", display: "block" }}>
                      {formErrors.title}
                    </small>
                  )}
                </div>

                {/* CATEGORY & ORGANIZER ROW */}
                <div className="wmsu-form-row">
                  <div className="wmsu-form-group">
                    <label htmlFor="event-category">
                      Event Category <span className="required-mark">*</span>
                    </label>
                    <select
                      id="event-category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="Alumni Homecoming">Alumni Homecoming</option>
                      <option value="Career Fair">Career Fair &amp; Networking</option>
                      <option value="Webinar">Webinar &amp; Leadership Talk</option>
                      <option value="Sports & Culture">Sports &amp; Culture</option>
                      <option value="University Milestone">University Milestone</option>
                    </select>
                  </div>

                  <div className="wmsu-form-group">
                    <label htmlFor="event-organizer">Organizer / Chapter</label>
                    <input
                      id="event-organizer"
                      name="organizer"
                      type="text"
                      placeholder="e.g. WMSU Alumni Affairs Office"
                      value={formData.organizer}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                {/* DATE, TIME, VENUE ROW */}
                <div className="wmsu-form-row">
                  <div className="wmsu-form-group">
                    <label htmlFor="event_date">
                      Event Date <span className="required-mark">*</span>
                    </label>
                    <input
                      id="event_date"
                      name="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.event_date && (
                      <small style={{ color: "#dc2626", marginTop: "4px", display: "block" }}>
                        {formErrors.event_date}
                      </small>
                    )}
                  </div>

                  <div className="wmsu-form-group">
                    <label htmlFor="location">
                      Location / Venue <span className="required-mark">*</span>
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. WMSU Gymnasium, Main Campus"
                      value={formData.location}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.location && (
                      <small style={{ color: "#dc2626", marginTop: "4px", display: "block" }}>
                        {formErrors.location}
                      </small>
                    )}
                  </div>
                </div>

                {/* START TIME, END TIME, RSVP DEADLINE ROW */}
                <div className="wmsu-form-row-3">
                  <div className="wmsu-form-group">
                    <label htmlFor="start_time">
                      Start Time <span className="required-mark">*</span>
                    </label>
                    <input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="wmsu-form-group">
                    <label htmlFor="end_time">End Time</label>
                    <input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="wmsu-form-group">
                    <label htmlFor="rsvp_deadline">RSVP Deadline</label>
                    <input
                      id="rsvp_deadline"
                      name="rsvp_deadline"
                      type="date"
                      value={formData.rsvp_deadline}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                {/* IMAGE PICKER & PREVIEW */}
                <div className="wmsu-form-group">
                  <label>Event Image / Banner</label>
                  <div className="wmsu-image-picker">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="wmsu-btn wmsu-btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📁 Upload Banner File
                      </button>
                    </div>

                    <p style={{ fontSize: "12px", color: "#64748b", margin: "10px 0 6px" }}>
                      Or select from presets:
                    </p>
                    <div className="wmsu-image-options" style={{ justifyContent: "center" }}>
                      {presetImages.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          className={`wmsu-image-thumb-btn ${formData.image === p.url ? "selected" : ""}`}
                          onClick={() => setFormData((prev) => ({ ...prev, image: p.url }))}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} />
                        </button>
                      ))}
                    </div>

                    {formData.image && (
                      <div className="wmsu-image-preview-wrap">
                        <img src={formData.image} alt="Selected preview" />
                        <button
                          type="button"
                          className="wmsu-image-preview-remove"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        >
                          ✕ Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="wmsu-form-group">
                  <label htmlFor="event-description">Event Description</label>
                  <textarea
                    id="event-description"
                    name="description"
                    rows={4}
                    placeholder="Provide details about the program, dress code, tickets, or guest speakers..."
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>

                {/* DRAFT VS PUBLISH */}
                <div className="wmsu-form-group">
                  <label>Publication Status</label>
                  <div className="wmsu-status-options">
                    <label
                      className={`wmsu-status-option ${formData.status === "published" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formData.status === "published"}
                        onChange={handleFormChange}
                      />
                      <div className="wmsu-status-option-info">
                        <strong>Publish Immediately</strong>
                        <small>Listed on the public Alumni Calendar</small>
                      </div>
                    </label>

                    <label
                      className={`wmsu-status-option ${formData.status === "draft" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formData.status === "draft"}
                        onChange={handleFormChange}
                      />
                      <div className="wmsu-status-option-info">
                        <strong>Save as Draft</strong>
                        <small>Hidden from public view until published</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="wmsu-modal-footer">
                <button
                  type="button"
                  className="wmsu-btn wmsu-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="wmsu-btn wmsu-btn-primary">
                  {editingEvent
                    ? "Save Changes"
                    : formData.status === "draft"
                    ? "Save as Draft"
                    : "Schedule Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          ATTENDEE LIST MODAL (SHOULD HAVE)
          ===================================================================== */}
      {viewingAttendeesEvent && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingAttendeesEvent(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="attendee-modal-title"
        >
          <div className="wmsu-modal wmsu-modal-lg">
            <div className="wmsu-modal-header">
              <h3 id="attendee-modal-title">
                👥 Registered Attendees: {viewingAttendeesEvent.title}
              </h3>
              <button
                type="button"
                className="wmsu-modal-close"
                onClick={() => setViewingAttendeesEvent(null)}
              >
                &times;
              </button>
            </div>

            <div className="wmsu-modal-body">
              <div className="wmsu-attendee-list-header">
                <div>
                  <span style={{ fontSize: "14px", color: "#64748b" }}>
                    Total RSVP Count:{" "}
                    <strong style={{ color: "#a51f2b", fontSize: "16px" }}>
                      {viewingAttendeesEvent.rsvp_count || 0}
                    </strong>
                  </span>
                </div>
                <span className="status-pill published">
                  <span className="status-pill-dot" /> Live Roster
                </span>
              </div>

              {/* BACKEND CONNECTION POINT:
                  Groupmates: Connect this view to GET /api/admin/events/:id/attendees
                  to retrieve confirmed registrations from PostgreSQL. */}
              {(!viewingAttendeesEvent.attendees || viewingAttendeesEvent.attendees.length === 0) ? (
                <div className="wmsu-empty-state">
                  <span className="wmsu-empty-state-icon">📋</span>
                  <h4>No Attendees Registered Yet</h4>
                  <p>
                    When alumni click the RSVP button, their names and attendance status will appear in this list immediately.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="wmsu-attendee-table">
                    <thead>
                      <tr>
                        <th>Attendee Name</th>
                        <th>Email Address</th>
                        <th>Program / Batch</th>
                        <th>Status</th>
                        <th>Date Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingAttendeesEvent.attendees.map((attendee) => (
                        <tr key={attendee.id}>
                          <td>
                            <strong>{attendee.name}</strong>
                          </td>
                          <td style={{ color: "#64748b" }}>{attendee.email}</td>
                          <td>
                            {attendee.course} ({attendee.batch})
                          </td>
                          <td>
                            <span className={`wmsu-attendee-badge ${attendee.status}`}>
                              {attendee.status === "going" ? "✓ Going" : "? Maybe"}
                            </span>
                          </td>
                          <td style={{ color: "#64748b", fontSize: "12px" }}>
                            {attendee.registered_at || "Recent"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="wmsu-modal-footer">
              <button
                type="button"
                className="wmsu-btn wmsu-btn-primary"
                onClick={() => setViewingAttendeesEvent(null)}
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION DIALOG MODAL
          ===================================================================== */}
      {deletingEvent && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingEvent(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="wmsu-modal wmsu-modal-sm">
            <div className="wmsu-modal-header">
              <h3 style={{ color: "#dc2626" }}>Confirm Deletion</h3>
              <button
                type="button"
                className="wmsu-modal-close"
                onClick={() => setDeletingEvent(null)}
              >
                &times;
              </button>
            </div>
            <div className="wmsu-modal-body">
              <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#334155" }}>
                Are you sure you want to delete this event?
              </p>
              <blockquote
                style={{
                  margin: "0",
                  padding: "10px 14px",
                  background: "#f8fafc",
                  borderLeft: "3px solid #dc2626",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                "{deletingEvent.title}"
              </blockquote>
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#64748b" }}>
                This action is frontend-only and removes the event and its RSVP roster for this session.
              </p>
            </div>
            <div className="wmsu-modal-footer">
              <button
                type="button"
                className="wmsu-btn wmsu-btn-secondary"
                onClick={() => setDeletingEvent(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wmsu-btn wmsu-btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

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
            <a href="/survey" onClick={(e) => handleNavigate(e, "/survey")}>Alumni Census</a>
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
