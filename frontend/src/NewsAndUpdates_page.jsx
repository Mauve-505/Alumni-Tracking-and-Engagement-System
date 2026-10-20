import { useState } from "react";
import "./NewsUpdates.css";
import "./EventAndNews.css";
import logo from "./assets/wmsu-logo.png";
import menu from "./assets/menu-dots.png";

const newsItems = [
  {
    id: 1,
    category: "University News",
    title: "WMSU Achieves Record Passing Rate in 2026 Licensure Examinations",
    description:
      "Western Mindanao State University celebrates another academic milestone as graduates from the College of Engineering, Nursing, and Teacher Education post historic top-ranking results in national board exams.",
    content: `Western Mindanao State University once again proved its excellence in higher education by achieving premier passing rates in the recently concluded national licensure examinations. 

The College of Teacher Education, recognized as a Center of Excellence, produced 4 top-notchers, while the College of Nursing recorded an extraordinary 98.4% institutional passing rate for first-time takers. 

University President and Academic Vice Presidents commended the faculty, alumni mentors, and students for their tireless dedication. "This achievement reflects not just the diligence of our examinees, but the enduring commitment of our alumni mentors who continuously contribute scholarship funds and review resources," the President remarked during the university convocation.

The Alumni Association will hold a testimonial dinner next month to honor the top performing graduates and confer honorary alumni citations.`,
    date: "October 14, 2026",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    source: "WMSU Public Information Office",
    featured: true,
    author: "Office of the Vice President for Academic Affairs",
  },
  {
    id: 2,
    category: "Alumni Achievements",
    title: "Dr. Maria Santos (BS Bio '12) Awarded ASEAN Science & Climate Fellowship",
    description:
      "WMSU alumna and marine conservationist Dr. Maria Santos receives prestigious international recognition for pioneering coral restoration and sustainable fisheries in the Sulu-Sulawesi Seascape.",
    content: `Dr. Maria Santos, a proud alumna of the WMSU College of Science and Mathematics (Class of 2012), has been selected as one of the 2026 ASEAN Science and Climate Innovation Fellows.

Her groundbreaking research on climate-resilient coral micro-fragmentation along the Zamboanga Peninsula has provided local coastal communities with sustainable alternative livelihood frameworks while protecting vulnerable marine ecosystems.

Dr. Santos credited her foundational years at WMSU for igniting her passion for regional environmental resilience. "The hands-on field biology expeditions led by our WMSU professors instilled in me a deep respect for our local waters and biodiversity," she shared during her acceptance interview.

She plans to host a research symposium and mentoring session for current WMSU marine biology and environmental science students later this semester.`,
    date: "October 12, 2026",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    source: "Alumni Spotlight Bureau",
    featured: false,
    author: "Alumni Affairs Communications",
  },
  {
    id: 3,
    category: "Events",
    title: "Registrations Open for Annual WMSU Alumni Golf & Fellowship Cup",
    description:
      "Alumni golfers and enthusiasts from around the country and overseas chapters prepare to gather for sportsmanship, camaraderie, and fundraising for student calamity grants.",
    content: `The Western Mindanao State University Alumni Association Inc. (WMSUAAI) has officially opened registration for the 2026 Crimson Golf & Sports Fellowship Cup.

Scheduled for early next month, the tournament serves as a key annual fundraiser supporting the WMSU Alumni Emergency Calamity Fund, which assists students experiencing sudden financial displacement or natural emergencies.

Participants can register across multiple division flights including Open, Seniors, and Inter-College Alumni Alumni Chapters. Trophies handcrafted by Zamboanga artisans and university commemorative gear will be presented during the fellowship banquet.

Interested alumni may confirm their pairing slots through the Alumni Portal or by visiting the Alumni Affairs Secretariat at the WMSU Main Campus.`,
    date: "October 10, 2026",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    source: "WMSU Alumni Association Inc.",
    featured: false,
    author: "WMSUAAI Sports Committee",
  },
  {
    id: 4,
    category: "Announcements",
    title: "New Digital Alumni ID & Lifetime Verification Portal Launches",
    description:
      "Access university library privileges, athletic facilities, campus parking, and exclusive regional alumni discounts directly from your mobile smartphone.",
    content: `In line with WMSU's institutional digital transformation roadmap, the Alumni Affairs Office is pleased to introduce the verified Digital Alumni Card within the Alumni Tracking and Engagement System.

The digital credential replaces physical plastic cards with a cryptographically signed QR code verifiable by campus security and affiliated merchant partners across Region IX.

Registered alumni can now present their digital card to access the University Library, rent facilities at alumni discount rates, and avail of partner perks across participating restaurants, bookstores, and clinics.

To generate your digital credential, log in to your account and verify your college graduation details under your Profile settings.`,
    date: "October 8, 2026",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    source: "WMSU Management Information Systems",
    featured: false,
    author: "WMSU MIS Center",
  },
];

const categories = [
  "All News",
  "University News",
  "Alumni Achievements",
  "Events",
  "Announcements",
];

export function NewsAndUpdatesPage({ onNavigate, showToast }) {
  const [activeCategory, setActiveCategory] = useState("All News");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
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
              className={item.label === "News" ? "nav-link-active" : ""}
              aria-current={item.label === "News" ? "page" : undefined}
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
                <div className="article-reader-image">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                  />
                  <span className="news-card-category">
                    {selectedArticle.category}
                  </span>
                </div>

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
                {filteredNews.map((item) => (
                  <article
                    className={
                      item.featured
                        ? "news-card news-card-featured"
                        : "news-card"
                    }
                    key={item.id}
                  >
                    <div className="news-image-wrapper">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                      />
                      <span className="news-card-category">
                        {item.category}
                      </span>
                    </div>

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
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {filteredNews.length === 0 && (
                <div className="news-empty-state">
                  <span aria-hidden="true" className="empty-symbol">✦</span>
                  <h3>No stories match your query</h3>
                  <p>
                    We couldn't find any articles matching "{search}". Try searching for another term or browse all news categories.
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
