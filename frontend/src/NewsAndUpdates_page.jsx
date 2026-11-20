import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NewsUpdates.css";
import "./EventAndNews.css";
import "./ContentManagement.css";
import logo from "./assets/wmsu-logo.png";
import menu from "./assets/menu-dots.png";
import schoolPic from "./assets/wmsu_school_picture.jpg";
import buildingPic from "./assets/wmsu-building.png";
import heroPic from "./assets/hero.png";
import { getSessionUser } from "./api";
import {
  getStoredPosts,
  saveStoredPost,
  deleteStoredPost,
  toggleStoredPostStatus,
} from "./contentStore.js";

const categories = [
  "All News",
  "WMSU News",
  "University Updates",
  "Alumni Achievements",
  "Announcements",
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

export function NewsAndUpdatesPage({ onNavigate, showToast }) {
  const navigate = useNavigate();
  // BACKEND CONNECTION POINT:
  // Groupmates: In production, load the authenticated admin session from
  // your backend JWT or session cookie endpoint (e.g., GET /api/auth/me).
  const [sessionUser] = useState(getSessionUser);
  const [isAdminMode, setIsAdminMode] = useState(
    () => sessionUser?.role === "admin" || localStorage.getItem("wmsu_demo_admin") === "true"
  );

  // BACKEND CONNECTION POINT:
  // Groupmates: Replace frontend-store retrieval with `GET /api/posts`
  // and handle server-side pagination, searching, and filtering.
  const [newsItems, setNewsItems] = useState(getStoredPosts);
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All News");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'draft'
  const [openNav, setOpenNav] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Post form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "WMSU News",
    image: schoolPic,
    status: "published",
    featured: false,
  });

  const fileInputRef = useRef(null);

  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    showToast?.(msg, type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle demo admin mode for evaluation
  const toggleAdminMode = () => {
    const next = !isAdminMode;
    setIsAdminMode(next);
    localStorage.setItem("wmsu_demo_admin", next ? "true" : "false");
    triggerToast(next ? "Admin mode enabled" : "Admin mode disabled", "info");
  };

  // Open modal for creating new post
  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      content: "",
      category: "WMSU News",
      image: schoolPic,
      status: "published",
      featured: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing existing post
  const handleOpenEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      id: post.id,
      title: post.title,
      content: post.content || post.description || "",
      category: post.category || "WMSU News",
      image: post.image || schoolPic,
      status: post.status || "published",
      featured: Boolean(post.featured),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormErrors({});
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect image uploads to POST /api/upload or S3/Cloudinary storage.
  // The server should return the permanent CDN URL for the uploaded image.
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

  // Form input change handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form submission: Create or Edit
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Basic form validation
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Post title is required.";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Post title should be at least 5 characters.";
    }

    if (!formData.content.trim()) {
      errors.content = "Post content/description is required.";
    } else if (formData.content.trim().length < 10) {
      errors.content = "Post content should be at least 10 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // BACKEND CONNECTION POINT:
    // Groupmates: Connect to:
    // - POST /api/posts (creating a new post)
    // - PATCH /api/posts/:id (updating existing post)
    // Send { title, content, category, image, status, author_id }.
    const postPayload = {
      ...formData,
      source: "WMSU Alumni Affairs",
      author: sessionUser?.name || "WMSU Alumni Admin",
      author_email: sessionUser?.email || "alumni.affairs@wmsu.edu.ph",
    };

    const updated = saveStoredPost(postPayload);
    setNewsItems(updated);

    if (selectedArticle && selectedArticle.id === formData.id) {
      setSelectedArticle({ ...selectedArticle, ...postPayload });
    }

    handleCloseModal();
    triggerToast(
      editingPost
        ? "Post updated successfully."
        : formData.status === "draft"
        ? "Post saved as draft."
        : "Post published successfully."
    );
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect to DELETE /api/posts/:id?requester_id=...
  // to delete a news post from PostgreSQL.
  const handleConfirmDelete = () => {
    if (!deletingPost) return;
    const updated = deleteStoredPost(deletingPost.id);
    setNewsItems(updated);
    if (selectedArticle?.id === deletingPost.id) {
      setSelectedArticle(null);
    }
    setDeletingPost(null);
    triggerToast(`“${deletingPost.title}” was deleted.`, "info");
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect to PATCH /api/posts/:id with { status: "published" | "draft" }
  const handleToggleStatus = (post) => {
    const updated = toggleStoredPostStatus(post.id);
    setNewsItems(updated);
    const newStatus = post.status === "published" ? "draft" : "published";
    triggerToast(`Post status changed to ${newStatus}.`);
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

  const handleShareArticle = (article) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      triggerToast(`Link for "${article.title}" copied to clipboard!`);
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

  // Filtered stories
  const filteredNews = newsItems.filter((item) => {
    const matchesCategory =
      activeCategory === "All News" || item.category === activeCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && item.status !== "draft") ||
      (statusFilter === "draft" && item.status === "draft");

    // Non-admins only see published posts unless in admin mode
    if (!isAdminMode && item.status === "draft") {
      return false;
    }

    const matchesSearch = [
      item.title,
      item.content,
      item.description,
      item.category,
      item.source,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="news-page">
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
            className="menu_button"
            onClick={() => setOpenNav(!openNav)}
            aria-label="Toggle navigation menu"
            aria-expanded={openNav}
            type="button"
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

      <main className="news-main">
        <section className="news-content">
          {/* HERO BANNER */}
          <div className="news-welcome">
            <div className="news-welcome-text">
              <span className="news-eyebrow">
                WESTERN MINDANAO STATE UNIVERSITY • OFFICIAL DISPATCH
              </span>

              <h1>
                {selectedArticle ? "Alumni Article" : "News & University Updates"}
              </h1>

              <p className="news-subtitle">
                {selectedArticle
                  ? "Read the complete story, official statements, and community context."
                  : "Stay connected with research breakthroughs, inspiring alumni stories, and the latest campus developments from your Alma Mater."}
              </p>
            </div>

            <div className="news-welcome-mark" aria-hidden="true">
              <span className="mark-crest">✦</span>
              <span className="mark-title">WMSU</span>
              <small>NEWS DESK</small>
            </div>
          </div>

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
                title="Toggle admin mode to test creating, editing, and deleting posts"
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
                  id="open-create-post-modal-btn"
                >
                  + Create New Post
                </button>
              </div>
            )}
          </div>

          {selectedArticle ? (
            /* ARTICLE READER VIEW */
            <section className="article-reader-view fade-in">
              <button
                type="button"
                className="news-back-button"
                onClick={() => setSelectedArticle(null)}
              >
                <span>←</span> Back to All Stories
              </button>

              <article className="article-reader-card">
                {selectedArticle.image && (
                  <div className="article-reader-image">
                    <img src={selectedArticle.image} alt={selectedArticle.title} />
                    <span className="news-card-category">{selectedArticle.category}</span>
                  </div>
                )}

                <div className="article-reader-body">
                  <div className="article-meta-bar">
                    <div className="article-meta-left">
                      <span className="article-source-tag">
                        {selectedArticle.source || "WMSU Alumni Affairs"}
                      </span>
                      <span className="article-dot">•</span>
                      <time className="article-date">
                        {selectedArticle.published_at
                          ? new Date(selectedArticle.published_at).toLocaleDateString()
                          : "Recent"}
                      </time>
                      {selectedArticle.author && (
                        <>
                          <span className="article-dot">•</span>
                          <span className="article-author">
                            By {selectedArticle.author}
                          </span>
                        </>
                      )}
                      {selectedArticle.status === "draft" && (
                        <span className="status-pill draft" style={{ marginLeft: "8px" }}>
                          <span className="status-pill-dot" /> Draft
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="article-share-btn"
                      onClick={() => handleShareArticle(selectedArticle)}
                      title="Share this story"
                    >
                      🔗 Share Story
                    </button>
                  </div>

                  <h2 className="article-reader-title">
                    {selectedArticle.title}
                  </h2>

                  <div className="article-reader-text">
                    {(selectedArticle.content || "").split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="article-reader-footer">
                    <button
                      type="button"
                      className="btn btn_primary"
                      onClick={() => setSelectedArticle(null)}
                    >
                      ← Return to News Feed
                    </button>

                    {isAdminMode && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="wmsu-btn wmsu-btn-secondary"
                          onClick={() => handleOpenEditModal(selectedArticle)}
                        >
                          ✏️ Edit Post
                        </button>
                        <button
                          type="button"
                          className="wmsu-btn wmsu-btn-outline-danger"
                          onClick={() => setDeletingPost(selectedArticle)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </section>
          ) : (
            /* NEWS FEED VIEW */
            <>
              {/* SEARCH BAR & STATUS FILTER */}
              <div className="news-search-row">
                <div className="news-search">
                  <span aria-hidden="true" className="search-icon">🔍</span>
                  <input
                    type="search"
                    placeholder="Search news, alumni profiles, or announcements..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search news and announcements"
                  />
                  {search && (
                    <button
                      type="button"
                      className="news-clear-search"
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

              {/* HEADING & LIVE BADGE */}
              <div className="news-section-heading">
                <div>
                  <h2>Latest Stories &amp; Updates</h2>
                  <p>Verified announcements from the university and alumni community</p>
                </div>

                <span className="news-live-label">
                  <span className="news-status-dot" />
                  {filteredNews.length} {filteredNews.length === 1 ? "Story" : "Stories"}
                </span>
              </div>

              {loading && <p className="content-api-status">Loading posts...</p>}

              {/* CATEGORIES */}
              <div
                className="news-categories"
                aria-label="Filter news by category"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      activeCategory === category
                        ? "news-category active"
                        : "news-category"
                    }
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={activeCategory === category}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* NEWS GRID */}
              <section
                className="news-grid"
                aria-label="News articles"
              >
                {!loading && filteredNews.map((item) => (
                  <article
                    className={
                      item.featured
                        ? "news-card news-card-featured"
                        : "news-card"
                    }
                    key={item.id}
                  >
                    {item.image && (
                      <div className="news-image-wrapper">
                        <img src={item.image} alt={item.title} loading="lazy" />
                        <span className="news-card-category">{item.category}</span>
                      </div>
                    )}

                    <div className="news-card-body">
                      <div className="news-card-meta">
                        <span className="news-card-source">{item.source || "WMSU Alumni"}</span>
                        <span aria-hidden="true">•</span>
                        <time>
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString()
                            : "Recent"}
                        </time>
                        {item.status === "draft" && (
                          <span className="status-pill draft" style={{ marginLeft: "auto" }}>
                            <span className="status-pill-dot" /> Draft
                          </span>
                        )}
                      </div>

                      <h3>{item.title}</h3>

                      <p>{item.content ? item.content.slice(0, 150) + "..." : item.description}</p>

                      <div className="news-card-footer">
                        <button
                          className="news-read-more"
                          type="button"
                          onClick={() => {
                            setSelectedArticle(item);
                            window.scrollTo({ top: 180, behavior: "smooth" });
                          }}
                        >
                          Read Full Story <span aria-hidden="true">→</span>
                        </button>

                        {isAdminMode && (
                          <div className="content-item-actions">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit post in modal"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              title={item.status === "published" ? "Save as draft" : "Publish post"}
                            >
                              {item.status === "published" ? "Draft" : "Publish"}
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => setDeletingPost(item)}
                              title="Delete post"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {!loading && filteredNews.length === 0 && (
                <div className="news-empty-state">
                  <span aria-hidden="true" className="empty-symbol">✦</span>
                  <h3>{newsItems.length === 0 ? "No posts have been published yet" : "No stories match your query"}</h3>
                  <p>
                    {newsItems.length === 0
                      ? "New posts will appear here when they are published."
                      : `We couldn't find any articles matching "${search}". Try another term or reset filters.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All News");
                      setStatusFilter("all");
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* =====================================================================
          POST CREATION & EDIT MODAL
          ===================================================================== */}
      {isModalOpen && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-modal-title"
        >
          <div className="wmsu-modal wmsu-modal-lg">
            <div className="wmsu-modal-header">
              <h3 id="post-modal-title">
                {editingPost ? "✏️ Edit News Post" : "📰 Create New Post"}
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
                {/* TITLE */}
                <div className="wmsu-form-group">
                  <label htmlFor="post-title">
                    Post Title <span className="required-mark">*</span>
                  </label>
                  <input
                    id="post-title"
                    name="title"
                    type="text"
                    placeholder="Enter engaging title (e.g. WMSU Celebrates Centennial Milestone)"
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

                {/* CATEGORY & FEATURED ROW */}
                <div className="wmsu-form-row">
                  <div className="wmsu-form-group">
                    <label htmlFor="post-category">
                      Category <span className="required-mark">*</span>
                    </label>
                    <select
                      id="post-category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="WMSU News">WMSU News</option>
                      <option value="University Updates">University Updates</option>
                      <option value="Alumni Achievements">Alumni Achievements</option>
                      <option value="Announcements">Announcements</option>
                    </select>
                  </div>

                  <div className="wmsu-form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "14px" }}>
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleFormChange}
                        style={{ width: "auto", minHeight: "auto" }}
                      />
                      Feature this post on hero / banner
                    </label>
                  </div>
                </div>

                {/* IMAGE PICKER & PREVIEW */}
                <div className="wmsu-form-group">
                  <label>Post Image / Thumbnail</label>
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
                        📁 Upload Image File
                      </button>
                    </div>

                    <p style={{ fontSize: "12px", color: "#64748b", margin: "10px 0 6px" }}>
                      Or pick from WMSU presets:
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

                    {formErrors.image && (
                      <small style={{ color: "#dc2626", marginTop: "6px", display: "block" }}>
                        {formErrors.image}
                      </small>
                    )}

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

                {/* CONTENT / DESCRIPTION */}
                <div className="wmsu-form-group">
                  <label htmlFor="post-content">
                    Post Description / Content <span className="required-mark">*</span>
                  </label>
                  <textarea
                    id="post-content"
                    name="content"
                    rows={6}
                    placeholder="Write the full news story or announcement details here..."
                    value={formData.content}
                    onChange={handleFormChange}
                    required
                  />
                  {formErrors.content && (
                    <small style={{ color: "#dc2626", marginTop: "4px", display: "block" }}>
                      {formErrors.content}
                    </small>
                  )}
                </div>

                {/* PUBLISH OR DRAFT STATUS SELECTION */}
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
                        <small>Visible to all alumni and visitors</small>
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
                        <small>Only visible to administrators for review</small>
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
                  {editingPost
                    ? "Save Changes"
                    : formData.status === "draft"
                    ? "Save as Draft"
                    : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION DIALOG MODAL
          ===================================================================== */}
      {deletingPost && (
        <div
          className="wmsu-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingPost(null);
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
                onClick={() => setDeletingPost(null)}
              >
                &times;
              </button>
            </div>
            <div className="wmsu-modal-body">
              <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#334155" }}>
                Are you sure you want to delete this post?
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
                "{deletingPost.title}"
              </blockquote>
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#64748b" }}>
                This action is frontend-only and removes the post from this session.
              </p>
            </div>
            <div className="wmsu-modal-footer">
              <button
                type="button"
                className="wmsu-btn wmsu-btn-secondary"
                onClick={() => setDeletingPost(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wmsu-btn wmsu-btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete Post
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
            <p>Help us improve your alumni news &amp; updates experience.</p>

            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                aria-label="Your feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts or suggest a news story..."
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

export default NewsAndUpdatesPage;
