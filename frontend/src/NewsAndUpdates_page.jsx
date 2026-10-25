import { useEffect, useState } from "react";
import "./NewsUpdates.css";
import "./EventAndNews.css";
import "./ContentManagement.css";
import logo from "./assets/wmsu-logo.png";
import menu from "./assets/menu-dots.png";
import { apiRequest, getSessionUser } from "./api";

const categories = [
  "All News",
  "University News",
  "Announcements",
];

const navLinks = [
  { label: "Home", href: "/home" },
  { label: "News & Updates", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Directory", href: "/directory" },
];

function mapPost(post) {
  return {
    ...post,
    category: post.type === "update" ? "Announcements" : "University News",
    description: post.content,
    date: new Date(post.published_at).toLocaleDateString(),
    source: "WMSU Alumni",
    author: post.author_email,
  };
}

export function NewsAndUpdatesPage({ onNavigate, showToast }) {
  const [newsItems, setNewsItems] = useState([]);
  const [user] = useState(getSessionUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [postForm, setPostForm] = useState({ title: "", content: "", type: "news" });
  const [activeCategory, setActiveCategory] = useState("All News");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/posts");
      setNewsItems(data.map(mapPost));
      setError("");
    } catch (err) {
      setError(err.message || "Could not load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const submitPost = async (event) => {
    event.preventDefault();
    if (!user?.id || user.role !== "admin") return;
    setSaving(true);
    setError("");
    try {
      await apiRequest(editingId ? `/api/posts/${editingId}` : "/api/posts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...postForm, requester_id: user.id }),
      });
      setPostForm({ title: "", content: "", type: "news" });
      setEditingId(null);
      await loadPosts();
      showToast?.(editingId ? "Post updated." : "Post published.", "success");
    } catch (err) {
      setError(err.message || "Could not save post.");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (post) => {
    if (!user?.id || !window.confirm(`Delete “${post.title}”?`)) return;
    try {
      await apiRequest(`/api/posts/${post.id}?requester_id=${user.id}`, { method: "DELETE" });
      await loadPosts();
      if (selectedArticle?.id === post.id) setSelectedArticle(null);
      showToast?.("Post deleted.", "success");
    } catch (err) {
      setError(err.message || "Could not delete post.");
    }
  };


  const handleNavigate = (e, path) => {
    if (e) e.preventDefault();
    setOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleShareArticle = (article) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      if (showToast) {
        showToast(`Link for "${article.title}" copied to clipboard!`, "success");
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

  const filteredNews = newsItems.filter((item) => {
    const matchesCategory =
      activeCategory === "All News" || item.category === activeCategory;

    const matchesSearch = [
      item.title,
      item.description,
      item.category,
      item.source,
      item.content,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="news-page">
      {/* UNIFIED HEADER */}
      <header className="header">
    
        <div className="menu_wrap">
          <button
            className="menu_button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            type="button"
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
                        {selectedArticle.source}
                      </span>
                      <span className="article-dot">•</span>
                      <time className="article-date">{selectedArticle.date}</time>
                      {selectedArticle.author && (
                        <>
                          <span className="article-dot">•</span>
                          <span className="article-author">
                            By {selectedArticle.author}
                          </span>
                        </>
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
                    {selectedArticle.content.split("\n\n").map((para, i) => (
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

                    <a
                      href="/#contact"
                      className="btn btn_outline"
                      onClick={(e) => handleNavigate(e, "/#contact")}
                    >
                      Submit Alumni News Tip
                    </a>
                  </div>
                </div>
              </article>
            </section>
          ) : (
            /* NEWS FEED VIEW */
            <>
              {/* SEARCH BAR */}
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

              {error && <p className="content-api-error" role="alert">{error}</p>}
              {loading && <p className="content-api-status">Loading posts...</p>}

              {user?.role === "admin" && (
                <form className="content-admin-form" onSubmit={submitPost}>
                  <h2>{editingId ? "Edit post" : "Publish a post"}</h2>
                  <label>
                    Title
                    <input
                      value={postForm.title}
                      onChange={(event) => setPostForm((form) => ({ ...form, title: event.target.value }))}
                      maxLength={200}
                      required
                    />
                  </label>
                  <label>
                    Content
                    <textarea
                      value={postForm.content}
                      onChange={(event) => setPostForm((form) => ({ ...form, content: event.target.value }))}
                      rows={4}
                      required
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={postForm.type}
                      onChange={(event) => setPostForm((form) => ({ ...form, type: event.target.value }))}
                    >
                      <option value="news">News</option>
                      <option value="update">Update</option>
                    </select>
                  </label>
                  <div className="content-admin-actions">
                    <button type="submit" disabled={saving}>
                      {saving ? "Saving..." : editingId ? "Save changes" : "Publish post"}
                    </button>
                    {editingId && (
                      <button type="button" className="secondary" onClick={() => {
                        setEditingId(null);
                        setPostForm({ title: "", content: "", type: "news" });
                      }}>Cancel</button>
                    )}
                  </div>
                </form>
              )}

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
                        <span className="news-card-source">{item.source}</span>
                        <span aria-hidden="true">•</span>
                        <time>{item.date}</time>
                      </div>

                      <h3>{item.title}</h3>

                      <p>{item.description}</p>

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
                        {user?.role === "admin" && (
                          <div className="content-item-actions">
                            <button type="button" onClick={() => {
                              setEditingId(item.id);
                              setPostForm({ title: item.title, content: item.content, type: item.type });
                              window.scrollTo({ top: 500, behavior: "smooth" });
                            }}>Edit</button>
                            <button type="button" onClick={() => deletePost(item)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {!loading && filteredNews.length === 0 && !error && (
                <div className="news-empty-state">
                  <span aria-hidden="true" className="empty-symbol">✦</span>
                  <h3>{newsItems.length === 0 ? "No posts have been published yet" : "No stories match your query"}</h3>
                  <p>
                    {newsItems.length === 0
                      ? "New posts will appear here when they are published."
                      : `We couldn't find any articles matching "${search}". Try another term or browse all categories.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All News");
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
