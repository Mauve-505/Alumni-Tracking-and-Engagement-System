import { useState } from "react";
import "./landing_page.css";

import logo from "./assets/wmsu-logo.png";
import menu from "./assets/menu-dots.png";
import news from "./assets/news.png";
import events from "./assets/events.png";
import merch from "./assets/merch.png";

export function LandingPage({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "News", href: "#news" },
    { label: "Events", href: "#events" },
    { label: "Merch", href: "#merch" },
  ];

  function handleNavigate(e, path) {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  }

  function handleFeedbackSubmit(e) {
    e.preventDefault();

    if (!feedback.trim()) {
      setFeedbackMessage("Please enter your feedback.");
      return;
    }

    setFeedbackMessage("Thank you for sharing your feedback!");
    setFeedback("");
  }

  return (
    <div className="landing_page" id="home">
      {/* NAVIGATION */}
      <header className="header">
        <a href="#home" className="brand" aria-label="WMSU Alumni Home">
          <img src={logo} alt="WMSU logo" />
          <span>WMSU Alumni</span>
        </a>

        <nav className="desktop_nav" aria-label="Main navigation">
          {navLinks.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}

          <a
            className="nav_login"
            href="/login_page.jsx"
            onClick={(e) => handleNavigate(e, "/login_page.jsx")}
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
          >
            <img src={menu} alt="" />
          </button>

          {open && (
            <div className="dropdown">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/login"
                onClick={(e) => {
                  setOpen(false);
                  handleNavigate(e, "/login");
                }}
              >
                Login / Sign Up
              </a>
              <a
                href="/register"
                onClick={(e) => {
                  setOpen(false);
                  handleNavigate(e, "/register");
                }}
              >
                Join Community
              </a>
              <a href="#contact" onClick={() => setOpen(false)}>
                Contact
              </a>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero_overlay">
            <div className="hero_content">
              <span className="hero_badge">
                WESTERN MINDANAO STATE UNIVERSITY
              </span>

              <h1>
                Once a student,
                <br />
                <span>always an alumnus.</span>
              </h1>

              <p>
                Welcome to the WMSU Alumni community. Reconnect with
                your alma mater, celebrate achievements, discover
                opportunities, and build lifelong connections.
              </p>

              <div className="hero_actions">
                <a
                  href="/register_page.jsx"
                  className="btn btn_primary"
                  onClick={(e) => handleNavigate(e, "/register_page.jsx")}
                >
                  Join the Alumni Community <span>→</span>
                </a>

                <a href="#news" className="btn btn_outline">
                  Explore Updates
                </a>
              </div>

              <div className="hero_caption">
                <span className="caption_line"></span>
                <span>CONNECTED BY WMSU, UNITED FOR THE FUTURE</span>
              </div>
            </div>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="intro_section" id="about">
          <div className="intro_text">
            <span className="section_label">WELCOME HOME</span>

            <h2>
              Your WMSU journey
              <br />
              doesn't end at graduation.
            </h2>

            <p>
              WMSU Alumni brings graduates together in one community.
              Stay informed about university announcements, attend
              alumni gatherings, discover merchandise, and maintain
              meaningful connections with fellow graduates.
            </p>

            <a
              href="/register"
              className="text_link"
              onClick={(e) => handleNavigate(e, "/register")}
            >
              Become part of our community <span>→</span>
            </a>
          </div>

          <div className="intro_highlight">
            <div className="highlight_icon">✦</div>
            <h3>One University. Many Journeys.</h3>
            <p>
              Celebrate the accomplishments of WMSU graduates and
              help create new opportunities for the next generation.
            </p>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="explore_section">
          <div className="section_heading">
            <span className="section_label">EXPLORE WMSU ALUMNI</span>
            <h2>Everything you need to stay connected</h2>
            <p>
              Discover what's happening in your alumni community.
            </p>
          </div>

          <div className="feature_grid">
            <a href="#news" className="feature_card news_card">
              <div className="feature_icon">
                <img src={news} alt="" />
              </div>

              <span className="feature_number">01 / UPDATES</span>
              <h3>News &amp; Updates</h3>
              <p>
                Read the latest university announcements, alumni
                achievements, and community stories.
              </p>

              <span className="feature_link">
                Read the latest <span>→</span>
              </span>
            </a>

            <a href="#events" className="feature_card events_card">
              <div className="feature_icon">
                <img src={events} alt="" />
              </div>

              <span className="feature_number">02 / COMMUNITY</span>
              <h3>Events &amp; Gatherings</h3>
              <p>
                Discover upcoming reunions, university activities,
                and opportunities to reconnect.
              </p>

              <span className="feature_link">
                Explore events <span>→</span>
              </span>
            </a>

            <a href="#merch" className="feature_card merch_card">
              <div className="feature_icon">
                <img src={merch} alt="" />
              </div>

              <span className="feature_number">03 / UNIVERSITY PRIDE</span>
              <h3>WMSU Merchandise</h3>
              <p>
                Show your university pride and explore merchandise
                offered by the student community.
              </p>

              <span className="feature_link">
                Explore merchandise <span>→</span>
              </span>
            </a>
          </div>
        </section>

        {/* NEWS PREVIEW */}
        <section className="updates_section" id="news">
          <div className="section_heading section_heading_row">
            <div>
              <span className="section_label">FROM OUR COMMUNITY</span>
              <h2>News &amp; announcements</h2>
              <p>
                Stay informed about what's happening at WMSU.
              </p>
            </div>

            <a href="#news" className="text_link">
              View all news <span>→</span>
            </a>
          </div>

          <div className="update_placeholder">
            <div className="update_symbol">✦</div>
            <div>
              <span className="update_tag">LATEST UPDATES</span>
              <h3>There's always something happening at WMSU.</h3>
              <p>
                University news, alumni accomplishments, and
                announcements will appear here.
              </p>
            </div>
            <a href="#news" className="btn btn_primary">
              Explore News
            </a>
          </div>
        </section>

        {/* EVENTS PREVIEW */}
        <section className="events_section" id="events">
          <div className="section_heading">
            <span className="section_label">SAVE THE DATE</span>
            <h2>Reconnect through events</h2>
            <p>
              Make new memories with the people who share your WMSU story.
            </p>
          </div>

          <div className="events_preview">
            <div className="event_preview_icon">
              <img src={events} alt="" />
            </div>

            <div className="event_preview_text">
              <span className="update_tag">ALUMNI ACTIVITIES</span>
              <h3>Your next WMSU gathering awaits.</h3>
              <p>
                Check the event calendar for reunions, networking
                opportunities, and community activities.
              </p>
            </div>

            <a href="#events" className="btn btn_primary">
              View Events <span>→</span>
            </a>
          </div>
        </section>

        {/* MERCHANDISE */}
        <section className="merch_section" id="merch">
          <div className="merch_content">
            <span className="section_label">SHOW YOUR WMSU PRIDE</span>
            <h2>Carry your university spirit wherever you go.</h2>
            <p>
              Discover WMSU-inspired merchandise and support the
              creativity and initiatives of the student community.
            </p>

            <a href="#merch" className="btn btn_white">
              Explore Merchandise <span>→</span>
            </a>
          </div>

          <div className="merch_decoration" aria-hidden="true">
            WMSU
          </div>
        </section>

        {/* JOIN COMMUNITY */}
        <section className="join_section">
          <div>
            <span className="section_label">YOUR ALUMNI COMMUNITY</span>
            <h2>Stay connected to the place that shaped you.</h2>
            <p>
              Join fellow graduates and keep your WMSU connection alive.
            </p>
          </div>

          <a
            href="/register"
            className="btn btn_primary"
            onClick={(e) => handleNavigate(e, "/register")}
          >
            Join the Community <span>→</span>
          </a>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer_main">
          <div className="footer_brand">
            <a href="#home" className="brand footer_logo">
              <img src={logo} alt="WMSU logo" />
              <span>WMSU Alumni</span>
            </a>

            <p>
              Keeping generations of WMSU graduates connected,
              informed, and engaged.
            </p>
          </div>

          <div className="footer_links">
            <h3>Explore</h3>
            <a href="#about">About Us</a>
            <a href="#news">News &amp; Updates</a>
            <a href="#events">Events</a>
            <a href="#merch">Merchandise</a>
          </div>

          <div className="footer_links">
            <h3>Get Connected</h3>
            <a
              href="/login_page.jsx"
              onClick={(e) => handleNavigate(e, "/login_page.jsx")}
            >
              Login / Sign Up
            </a>
            <a
              href="/register_page.jsx"
              onClick={(e) => handleNavigate(e, "/register_page.jsx")}
            >
              Join the Community
            </a>
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
            <p>Help us improve your alumni experience.</p>

            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                aria-label="Your feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts..."
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
          <p>Western Mindanao State University</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;