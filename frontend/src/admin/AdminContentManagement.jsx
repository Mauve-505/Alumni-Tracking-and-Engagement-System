import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import "../ContentManagement.css";
import schoolPic from "../assets/wmsu_school_picture.jpg";
import buildingPic from "../assets/wmsu-building.png";
import heroPic from "../assets/hero.png";
import {
  getStoredPosts,
  saveStoredPost,
  deleteStoredPost,
  toggleStoredPostStatus,
  getStoredEvents,
  saveStoredEvent,
  deleteStoredEvent,
  toggleStoredEventStatus,
} from "../contentStore.js";

const presetImages = [
  { label: "WMSU Campus", url: schoolPic },
  { label: "Admin Building", url: buildingPic },
  { label: "Alumni Gathering", url: heroPic },
];

/**
 * CENTRALIZED ADMIN CONTENT MANAGEMENT SCREEN
 * ============================================================================
 * Provides an all-in-one control center for administrators to oversee,
 * create, edit, filter, publish, draft, and delete both News Posts and Events.
 *
 * BACKEND CONNECTION POINT:
 * Groupmates: When connecting the backend in the future:
 * 1. Replace state queries with:
 *    - GET /api/admin/content?type=all&status=...
 *    - GET /api/posts and GET /api/events
 * 2. Replace mutation functions with appropriate REST calls:
 *    - POST /api/posts or POST /api/events
 *    - PATCH /api/posts/:id or PATCH /api/events/:id
 *    - DELETE /api/posts/:id or DELETE /api/events/:id
 * ============================================================================
 */

export default function AdminContentManagement() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'news' | 'events' | 'drafts' | 'published'
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState(getStoredPosts);
  const [events, setEvents] = useState(getStoredEvents);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Forms state
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    category: "WMSU News",
    image: schoolPic,
    status: "published",
    featured: false,
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    category: "Alumni Homecoming",
    location: "WMSU Gymnasium, Main Campus",
    event_date: "",
    start_time: "08:00",
    end_time: "17:00",
    rsvp_deadline: "",
    image: schoolPic,
    status: "published",
    organizer: "WMSU Alumni Affairs Office",
  });

  const postFileInputRef = useRef(null);
  const eventFileInputRef = useRef(null);

  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Combine content items with normalized schema
  const allItems = [
    ...posts.map((p) => ({
      ...p,
      contentType: "news",
      typeLabel: "News Post",
      dateLabel: p.published_at ? new Date(p.published_at).toLocaleDateString() : "Recent",
      metaDetail: p.author || "WMSU Alumni Affairs",
    })),
    ...events.map((e) => ({
      ...e,
      contentType: "event",
      typeLabel: "Event",
      dateLabel: e.event_date || "Upcoming",
      metaDetail: `${e.rsvp_count || 0} RSVPs • ${e.location}`,
    })),
  ];

  // Filtering based on active tab and search
  const filteredItems = allItems.filter((item) => {
    if (activeTab === "news" && item.contentType !== "news") return false;
    if (activeTab === "events" && item.contentType !== "event") return false;
    if (activeTab === "drafts" && item.status !== "draft") return false;
    if (activeTab === "published" && item.status !== "published") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchCategory = (item.category || "").toLowerCase().includes(q);
      const matchLocation = (item.location || "").toLowerCase().includes(q);
      return matchTitle || matchCategory || matchLocation;
    }
    return true;
  });

  // Calculate stats
  const totalPosts = posts.length;
  const totalEvents = events.length;
  const totalDrafts = allItems.filter((i) => i.status === "draft").length;
  const totalPublished = allItems.filter((i) => i.status === "published").length;
  const totalRsvps = events.reduce((sum, e) => sum + (e.rsvp_count || 0), 0);

  // Modal Openers
  const openNewPostModal = () => {
    setEditingItem(null);
    setPostForm({
      title: "",
      content: "",
      category: "WMSU News",
      image: schoolPic,
      status: "published",
      featured: false,
    });
    setFormErrors({});
    setPostModalOpen(true);
  };

  const openNewEventModal = () => {
    setEditingItem(null);
    setEventForm({
      title: "",
      description: "",
      category: "Alumni Homecoming",
      location: "WMSU Gymnasium, Main Campus",
      event_date: "",
      start_time: "08:00",
      end_time: "17:00",
      rsvp_deadline: "",
      image: schoolPic,
      status: "published",
      organizer: "WMSU Alumni Affairs Office",
    });
    setFormErrors({});
    setEventModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormErrors({});
    if (item.contentType === "news") {
      setPostForm({
        id: item.id,
        title: item.title,
        content: item.content || item.description || "",
        category: item.category || "WMSU News",
        image: item.image || schoolPic,
        status: item.status || "published",
        featured: Boolean(item.featured),
      });
      setPostModalOpen(true);
    } else {
      setEventForm({
        id: item.id,
        title: item.title,
        description: item.description || "",
        category: item.category || "Alumni Homecoming",
        location: item.location || "",
        event_date: item.event_date || "",
        start_time: item.start_time || "08:00",
        end_time: item.end_time || "17:00",
        rsvp_deadline: item.rsvp_deadline || "",
        image: item.image || schoolPic,
        status: item.status || "published",
        organizer: item.organizer || "WMSU Alumni Affairs Office",
      });
      setEventModalOpen(true);
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e, targetForm) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (targetForm === "post") {
        setPostForm((prev) => ({ ...prev, image: reader.result }));
      } else {
        setEventForm((prev) => ({ ...prev, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Post
  const handleSavePost = (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) {
      setFormErrors({ title: "Title is required." });
      return;
    }
    if (!postForm.content.trim()) {
      setFormErrors({ content: "Content is required." });
      return;
    }

    const updated = saveStoredPost({
      ...postForm,
      author: "Admin Desk",
      source: "WMSU Alumni Affairs",
    });
    setPosts(updated);
    setPostModalOpen(false);
    triggerToast(editingItem ? "Post updated." : "Post published.");
  };

  // Save Event
  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      setFormErrors({ title: "Event title is required." });
      return;
    }
    if (!eventForm.event_date) {
      setFormErrors({ event_date: "Event date is required." });
      return;
    }
    if (!eventForm.location.trim()) {
      setFormErrors({ location: "Location is required." });
      return;
    }

    const updated = saveStoredEvent(eventForm);
    setEvents(updated);
    setEventModalOpen(false);
    triggerToast(editingItem ? "Event updated." : "Event scheduled.");
  };

  // Toggle Status (Publish <-> Draft)
  const handleToggleStatus = (item) => {
    if (item.contentType === "news") {
      const updated = toggleStoredPostStatus(item.id);
      setPosts(updated);
    } else {
      const updated = toggleStoredEventStatus(item.id);
      setEvents(updated);
    }
    const newStatus = item.status === "published" ? "draft" : "published";
    triggerToast(`Status changed to ${newStatus}.`);
  };

  // Delete Confirm
  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.contentType === "news") {
      const updated = deleteStoredPost(deletingItem.id);
      setPosts(updated);
    } else {
      const updated = deleteStoredEvent(deletingItem.id);
      setEvents(updated);
    }
    triggerToast(`“${deletingItem.title}” deleted.`, "info");
    setDeletingItem(null);
  };

  return (
    <div className="adm_page">
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

      <main className="adm_main">
        <p className="adm_eyebrow">Administrative Suite</p>
        <h1 className="adm_title">Centralized Content Management</h1>

        {/* NAVIGATION TABS */}
        <nav className="adm_tabs">
          <Link to="/admin" className="adm_tab">
            Dashboard
          </Link>
          <Link to="/admin/content" className="adm_tab active">
            Content Management
          </Link>
          <Link to="/admin/verification" className="adm_tab">
            Verification
          </Link>
        </nav>

        {/* STATS SUMMARY METRICS */}
        <div className="adm_stats">
          <div className="adm_stat">
            <span>News Posts</span>
            <strong>{totalPosts}</strong>
          </div>
          <div className="adm_stat">
            <span>Scheduled Events</span>
            <strong>{totalEvents}</strong>
          </div>
          <div className="adm_stat">
            <span>Published Items</span>
            <strong style={{ color: "#15803d" }}>{totalPublished}</strong>
          </div>
          <div className="adm_stat">
            <span>Draft Items</span>
            <strong style={{ color: "#b45309" }}>{totalDrafts}</strong>
          </div>
          <div className="adm_stat">
            <span>Total RSVP Responses</span>
            <strong style={{ color: "#a51f2b" }}>{totalRsvps}</strong>
          </div>
        </div>

        {/* ACTION BAR: SEARCH, TABS, CREATE BUTTONS */}
        <div
          style={{
            background: "#ffffff",
            padding: "18px 20px",
            borderRadius: "12px",
            border: "1px solid #e7e9ee",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(16, 45, 80, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "16px",
            }}
          >
            {/* SEARCH INPUT */}
            <div style={{ flex: "1 1 280px", maxWidth: "420px" }}>
              <input
                type="search"
                placeholder="Search by title, category, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="wmsu-btn wmsu-btn-primary"
                onClick={openNewPostModal}
              >
                + Create News Post
              </button>
              <button
                type="button"
                className="wmsu-btn"
                style={{ background: "#102d50", color: "#fff" }}
                onClick={openNewEventModal}
              >
                + Create Event
              </button>
            </div>
          </div>

          {/* FILTER TABS (All Content, News, Events, Drafts, Published) */}
          <div className="adm_switch" style={{ margin: 0 }}>
            {[
              { id: "all", label: `All Content (${allItems.length})` },
              { id: "news", label: `News & Updates (${posts.length})` },
              { id: "events", label: `Events (${events.length})` },
              { id: "published", label: `Published (${totalPublished})` },
              { id: "drafts", label: `Drafts (${totalDrafts})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={activeTab === t.id ? "active" : ""}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT ROSTER TABLE */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e7e9ee",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(16, 45, 80, 0.04)",
          }}
        >
          {filteredItems.length === 0 ? (
            <div className="wmsu-empty-state">
              <span className="wmsu-empty-state-icon">📂</span>
              <h4>No matching content items found</h4>
              <p>Try switching filter tabs or click the create buttons above to publish new content.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b" }}>TYPE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b" }}>TITLE &amp; CATEGORY</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b" }}>DATE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b" }}>STATUS</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b" }}>DETAILS</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={`${item.contentType}-${item.id}`}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      {/* TYPE BADGE */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: item.contentType === "news" ? "#e0f2fe" : "#fef3c7",
                            color: item.contentType === "news" ? "#0369a1" : "#92400e",
                          }}
                        >
                          {item.typeLabel}
                        </span>
                      </td>

                      {/* TITLE & CATEGORY */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", maxWidth: "340px" }}>
                        <strong style={{ display: "block", color: "#102d50", fontSize: "14px", marginBottom: "4px" }}>
                          {item.title}
                        </strong>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Category: <strong>{item.category}</strong>
                        </span>
                      </td>

                      {/* DATE */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", whiteSpace: "nowrap", fontSize: "13px" }}>
                        {item.dateLabel}
                      </td>

                      {/* PUBLICATION STATUS */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                        <span className={`status-pill ${item.status}`}>
                          <span className="status-pill-dot" />
                          {item.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* DETAILS */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", fontSize: "13px", color: "#475569" }}>
                        {item.metaDetail}
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="wmsu-btn wmsu-btn-secondary"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => setPreviewItem(item)}
                            title="Preview Content"
                          >
                            👁️ View
                          </button>
                          <button
                            type="button"
                            className="wmsu-btn wmsu-btn-secondary"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => openEditModal(item)}
                            title="Edit Content"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="wmsu-btn wmsu-btn-secondary"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => handleToggleStatus(item)}
                            title={item.status === "published" ? "Save as draft" : "Publish item"}
                          >
                            {item.status === "published" ? "Draft" : "Publish"}
                          </button>
                          <button
                            type="button"
                            className="wmsu-btn wmsu-btn-outline-danger"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => setDeletingItem(item)}
                            title="Delete Content"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =====================================================================
          VIEW PREVIEW MODAL
          ===================================================================== */}
      {previewItem && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewItem(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="wmsu-modal wmsu-modal-lg">
            <div className="wmsu-modal-header">
              <h3>
                {previewItem.contentType === "news" ? "📰 News Post Preview" : "📅 Event Preview"}
              </h3>
              <button
                type="button"
                className="wmsu-modal-close"
                onClick={() => setPreviewItem(null)}
              >
                &times;
              </button>
            </div>
            <div className="wmsu-modal-body">
              {previewItem.image && (
                <div style={{ maxHeight: "240px", overflow: "hidden", borderRadius: "8px", marginBottom: "16px" }}>
                  <img src={previewItem.image} alt="" style={{ width: "100%", height: "240px", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                <span className={`status-pill ${previewItem.status}`}>
                  <span className="status-pill-dot" /> {previewItem.status}
                </span>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Category: <strong>{previewItem.category}</strong>
                </span>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Date: <strong>{previewItem.dateLabel}</strong>
                </span>
              </div>
              <h2 style={{ color: "#102d50", margin: "0 0 14px", fontSize: "22px" }}>
                {previewItem.title}
              </h2>
              <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#334155" }}>
                {(previewItem.content || previewItem.description || "").split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            <div className="wmsu-modal-footer">
              <button
                type="button"
                className="wmsu-btn wmsu-btn-secondary"
                onClick={() => setPreviewItem(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="wmsu-btn wmsu-btn-primary"
                onClick={() => {
                  const target = previewItem;
                  setPreviewItem(null);
                  openEditModal(target);
                }}
              >
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          POST MODAL (CREATE / EDIT)
          ===================================================================== */}
      {postModalOpen && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPostModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="wmsu-modal wmsu-modal-lg">
            <div className="wmsu-modal-header">
              <h3>{editingItem ? "✏️ Edit News Post" : "📰 Create News Post"}</h3>
              <button
                type="button"
                className="wmsu-modal-close"
                onClick={() => setPostModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePost}>
              <div className="wmsu-modal-body">
                <div className="wmsu-form-group">
                  <label htmlFor="adm-post-title">
                    Post Title <span className="required-mark">*</span>
                  </label>
                  <input
                    id="adm-post-title"
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    required
                  />
                  {formErrors.title && (
                    <small style={{ color: "#dc2626" }}>{formErrors.title}</small>
                  )}
                </div>

                <div className="wmsu-form-row">
                  <div className="wmsu-form-group">
                    <label htmlFor="adm-post-category">Category</label>
                    <select
                      id="adm-post-category"
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    >
                      <option value="WMSU News">WMSU News</option>
                      <option value="University Updates">University Updates</option>
                      <option value="Alumni Achievements">Alumni Achievements</option>
                      <option value="Announcements">Announcements</option>
                    </select>
                  </div>

                  <div className="wmsu-form-group" style={{ display: "flex", alignItems: "center" }}>
                    <label style={{ display: "flex", gap: "8px", alignItems: "center", cursor: "pointer", marginTop: "14px" }}>
                      <input
                        type="checkbox"
                        checked={postForm.featured}
                        onChange={(e) => setPostForm({ ...postForm, featured: e.target.checked })}
                      />
                      Feature on Hero Banner
                    </label>
                  </div>
                </div>

                {/* IMAGE UPLOAD & PREVIEW */}
                <div className="wmsu-form-group">
                  <label>Post Image</label>
                  <div className="wmsu-image-picker">
                    <input
                      type="file"
                      ref={postFileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "post")}
                    />
                    <button
                      type="button"
                      className="wmsu-btn wmsu-btn-secondary"
                      onClick={() => postFileInputRef.current?.click()}
                    >
                      📁 Upload Image File
                    </button>
                    <div className="wmsu-image-options" style={{ justifyContent: "center" }}>
                      {presetImages.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          className={`wmsu-image-thumb-btn ${postForm.image === p.url ? "selected" : ""}`}
                          onClick={() => setPostForm({ ...postForm, image: p.url })}
                        >
                          <img src={p.url} alt={p.label} />
                        </button>
                      ))}
                    </div>
                    {postForm.image && (
                      <div className="wmsu-image-preview-wrap">
                        <img src={postForm.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="wmsu-form-group">
                  <label htmlFor="adm-post-content">
                    Post Content / Description <span className="required-mark">*</span>
                  </label>
                  <textarea
                    id="adm-post-content"
                    rows={5}
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    required
                  />
                  {formErrors.content && (
                    <small style={{ color: "#dc2626" }}>{formErrors.content}</small>
                  )}
                </div>

                <div className="wmsu-form-group">
                  <label>Publication Status</label>
                  <div className="wmsu-status-options">
                    <label className={`wmsu-status-option ${postForm.status === "published" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="post_status"
                        value="published"
                        checked={postForm.status === "published"}
                        onChange={() => setPostForm({ ...postForm, status: "published" })}
                      />
                      <div className="wmsu-status-option-info">
                        <strong>Publish Immediately</strong>
                        <small>Publicly visible</small>
                      </div>
                    </label>
                    <label className={`wmsu-status-option ${postForm.status === "draft" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="post_status"
                        value="draft"
                        checked={postForm.status === "draft"}
                        onChange={() => setPostForm({ ...postForm, status: "draft" })}
                      />
                      <div className="wmsu-status-option-info">
                        <strong>Save as Draft</strong>
                        <small>Admin review only</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="wmsu-modal-footer">
                <button
                  type="button"
                  className="wmsu-btn wmsu-btn-secondary"
                  onClick={() => setPostModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="wmsu-btn wmsu-btn-primary">
                  {editingItem ? "Save Changes" : postForm.status === "draft" ? "Save as Draft" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          EVENT MODAL (CREATE / EDIT)
          ===================================================================== */}
      {eventModalOpen && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEventModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="wmsu-modal wmsu-modal-lg">
            <div className="wmsu-modal-header">
              <h3>{editingItem ? "✏️ Edit Event" : "📅 Create Event"}</h3>
              <button
                type="button"
                className="wmsu-modal-close"
                onClick={() => setEventModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="wmsu-modal-body">
                <div className="wmsu-form-group">
                  <label htmlFor="adm-event-title">
                    Event Title <span className="required-mark">*</span>
                  </label>
                  <input
                    id="adm-event-title"
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                  {formErrors.title && <small style={{ color: "#dc2626" }}>{formErrors.title}</small>}
                </div>

                <div className="wmsu-form-row">
                  <div className="wmsu-form-group">
                    <label htmlFor="adm-event-category">Category</label>
                    <select
                      id="adm-event-category"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    >
                      <option value="Alumni Homecoming">Alumni Homecoming</option>
                      <option value="Career Fair">Career Fair</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Sports & Culture">Sports & Culture</option>
                    </select>
                  </div>

                  <div className="wmsu-form-group">
                    <label htmlFor="adm-event-organizer">Organizer</label>
                    <input
                      id="adm-event-organizer"
                      type="text"
                      value={eventForm.organizer}
                      onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    />
                  </div>
                </div>

                <div className="wmsu-form-row">
                  <div className="wmsu-form-group">
                    <label htmlFor="adm-event-date">
                      Date <span className="required-mark">*</span>
                    </label>
                    <input
                      id="adm-event-date"
                      type="date"
                      value={eventForm.event_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                      required
                    />
                    {formErrors.event_date && (
                      <small style={{ color: "#dc2626" }}>{formErrors.event_date}</small>
                    )}
                  </div>

                  <div className="wmsu-form-group">
                    <label htmlFor="adm-event-location">
                      Venue / Location <span className="required-mark">*</span>
                    </label>
                    <input
                      id="adm-event-location"
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="wmsu-form-row-3">
                  <div className="wmsu-form-group">
                    <label htmlFor="adm-event-start">Start Time</label>
                    <input
                      id="adm-event-start"
                      type="time"
                      value={eventForm.start_time}
                      onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                    />
                  </div>
                  <div className="wmsu-form-group">
                    <label htmlFor="adm-event-end">End Time</label>
                    <input
                      id="adm-event-end"
                      type="time"
                      value={eventForm.end_time}
                      onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                    />
                  </div>
                  <div className="wmsu-form-group">
                    <label htmlFor="adm-event-deadline">RSVP Deadline</label>
                    <input
                      id="adm-event-deadline"
                      type="date"
                      value={eventForm.rsvp_deadline}
                      onChange={(e) => setEventForm({ ...eventForm, rsvp_deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="wmsu-form-group">
                  <label>Event Image</label>
                  <div className="wmsu-image-picker">
                    <input
                      type="file"
                      ref={eventFileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "event")}
                    />
                    <button
                      type="button"
                      className="wmsu-btn wmsu-btn-secondary"
                      onClick={() => eventFileInputRef.current?.click()}
                    >
                      📁 Upload Banner
                    </button>
                    <div className="wmsu-image-options" style={{ justifyContent: "center" }}>
                      {presetImages.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          className={`wmsu-image-thumb-btn ${eventForm.image === p.url ? "selected" : ""}`}
                          onClick={() => setEventForm({ ...eventForm, image: p.url })}
                        >
                          <img src={p.url} alt={p.label} />
                        </button>
                      ))}
                    </div>
                    {eventForm.image && (
                      <div className="wmsu-image-preview-wrap">
                        <img src={eventForm.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="wmsu-form-group">
                  <label htmlFor="adm-event-description">Event Description</label>
                  <textarea
                    id="adm-event-description"
                    rows={4}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>

                <div className="wmsu-form-group">
                  <label>Publication Status</label>
                  <div className="wmsu-status-options">
                    <label className={`wmsu-status-option ${eventForm.status === "published" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="ev_status"
                        value="published"
                        checked={eventForm.status === "published"}
                        onChange={() => setEventForm({ ...eventForm, status: "published" })}
                      />
                      <div className="wmsu-status-option-info">
                        <strong>Publish Immediately</strong>
                        <small>Public calendar listing</small>
                      </div>
                    </label>
                    <label className={`wmsu-status-option ${eventForm.status === "draft" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="ev_status"
                        value="draft"
                        checked={eventForm.status === "draft"}
                        onChange={() => setEventForm({ ...eventForm, status: "draft" })}
                      />
                      <div className="wmsu-status-option-info">
                        <strong>Save as Draft</strong>
                        <small>Hidden from public view</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="wmsu-modal-footer">
                <button
                  type="button"
                  className="wmsu-btn wmsu-btn-secondary"
                  onClick={() => setEventModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="wmsu-btn wmsu-btn-primary">
                  {editingItem ? "Save Changes" : eventForm.status === "draft" ? "Save as Draft" : "Schedule Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION DIALOG MODAL (CONFIRMATION DIALOG)
          ===================================================================== */}
      {deletingItem && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingItem(null);
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
                onClick={() => setDeletingItem(null)}
              >
                &times;
              </button>
            </div>
            <div className="wmsu-modal-body">
              <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#334155" }}>
                Are you sure you want to permanently delete this {deletingItem.typeLabel.toLowerCase()}?
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
                "{deletingItem.title}"
              </blockquote>
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#64748b" }}>
                This action is frontend-only and deletes the item for this session.
              </p>
            </div>
            <div className="wmsu-modal-footer">
              <button
                type="button"
                className="wmsu-btn wmsu-btn-secondary"
                onClick={() => setDeletingItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wmsu-btn wmsu-btn-danger"
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
