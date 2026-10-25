import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";
import logo from "./assets/wmsu-logo.png";
import banner from "./assets/wmsu_school_picture.jpg";

// Demonstration News Items consistent with NewsAndUpdates_page data
const DEMO_NEWS = [
  {
    id: 1,
    category: "University News",
    title: "WMSU Achieves Record Passing Rate in 2026 Licensure Examinations",
    description:
      "Western Mindanao State University celebrates another academic milestone as graduates from the College of Engineering, Nursing, and Teacher Education post historic top-ranking results in national board exams.",
    date: "October 14, 2026",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    author: "Office of Academic Affairs",
  },
  {
    id: 2,
    category: "Alumni Achievements",
    title: "Dr. Maria Santos (BS Bio '12) Awarded ASEAN Science & Climate Fellowship",
    description:
      "WMSU alumna and marine conservationist Dr. Maria Santos receives prestigious international recognition for pioneering coral restoration and sustainable fisheries in the Sulu-Sulawesi Seascape.",
    date: "October 12, 2026",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    author: "Alumni Spotlight Bureau",
  },
  {
    id: 3,
    category: "Campus Events",
    title: "Registrations Open for Annual WMSU Alumni Golf & Fellowship Cup",
    description:
      "Alumni golfers and enthusiasts from around the country and overseas chapters prepare to gather for sportsmanship, camaraderie, and fundraising for student calamity grants.",
    date: "October 10, 2026",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    author: "WMSUAAI Sports Committee",
  },
];

// Demonstration Events Items consistent with EventList_page data
const DEMO_EVENTS = [
  {
    id: 1,
    title: "WMSU Grand Alumni Homecoming 2026",
    category: "Alumni Gathering",
    date: "November 21, 2026",
    month: "NOV",
    day: "21",
    time: "8:00 AM – 5:00 PM",
    location: "WMSU University Gymnasium & Quadrangle",
    description:
      "Reconnect with former professors, classmates, and friends. Celebrate milestones, university advancements, and the lifelong Crimson spirit across all colleges.",
  },
  {
    id: 2,
    title: "Alumni Career & Leadership Summit",
    category: "Career Development",
    date: "November 28, 2026",
    month: "NOV",
    day: "28",
    time: "9:00 AM – 3:30 PM",
    location: "Dr. Juanito Bruno Gymnasium & Online Stream",
    description:
      "A premier platform connecting seasoned professionals, emerging alumni leaders, and graduating students for mentorship and high-impact career panels.",
  },
  {
    id: 3,
    title: "Crimson Reach Community Outreach Mission",
    category: "Community Service",
    date: "December 5, 2026",
    month: "DEC",
    day: "05",
    time: "7:30 AM – 1:00 PM",
    location: "Barangay Limpapa & Remote Centers, Zamboanga City",
    description:
      "Give back to the broader Zamboanga Peninsula community through free medical-dental clinics, book drives, and digital literacy workshops.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  // BACKEND CONNECTION POINT:
  // Groupmates: Supply the authenticated user's name and profile
  // information here when connecting the backend in the future.
  const [user, setUser] = useState(null);

  // BACKEND CONNECTION POINT:
  // Groupmates: Replace demonstration news data with published
  // news supplied by the backend. No API integration in this task.
  const [newsList] = useState(DEMO_NEWS);

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect this section to backend event data,
  // including event titles, dates, locations, and descriptions.
  const [eventList] = useState(DEMO_EVENTS);

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect these frontend states to the actual loading,
  // error, and empty responses from the backend when available.
  const [isLoading] = useState(false);
  const [loadError] = useState(null);

  useEffect(() => {
    // Attempt to read frontend user/profile data stored from login or profile page
    try {
      const storedUser = localStorage.getItem("wmsu_user");
      const storedProfile = localStorage.getItem("wmsu_profile");

      if (storedProfile) {
        setUser(JSON.parse(storedProfile));
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Storage unavailable or invalid JSON; use neutral state
      setUser(null);
    }
  }, []);

  // Determine greeting based on available frontend data
  const userName =
    user?.firstName ||
    user?.first_name ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : null);

  const greetingTitle = userName
    ? `Welcome back, ${userName}!`
    : "Welcome to WMSU Alumni Portal";

  return (
    <div className="homepage">
      {/* DEMO NOTICE BANNER */}
      <div className="homepage_demo_bar" role="status">
        <span className="demo_pill">Frontend Demonstration</span>
        <span>
          You are viewing the authenticated WMSU Alumni Portal Homepage. Content is currently loaded from frontend demonstration data.
        </span>
      </div>

      {/* A. WELCOME / HERO SECTION */}
      <section
        className="homepage_hero"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="homepage_hero_overlay"></div>
        <div className="homepage_hero_content">
          <div className="homepage_hero_badge">
            <img src={logo} alt="WMSU Seal" className="badge_logo" />
            <span>Western Mindanao State University &bull; Alumni Engagement</span>
          </div>

          <h1 className="homepage_hero_title">{greetingTitle}</h1>

          <p className="homepage_hero_desc">
            Stay connected with your alma mater and fellow Crimsons worldwide.
            Explore campus developments, register for upcoming alumni gatherings,
            and keep your alumni profile up to date.
          </p>

          {/* Quick Shortcuts */}
          <div className="homepage_shortcuts">
            <button
              type="button"
              className="shortcut_btn shortcut_primary"
              onClick={() => navigate("/NewsAndUpdates_page")}
            >
              Latest News &rarr;
            </button>
            <button
              type="button"
              className="shortcut_btn shortcut_secondary"
              onClick={() => navigate("/Eventlist_page")}
            >
              Upcoming Events &rarr;
            </button>
            <button
              type="button"
              className="shortcut_btn shortcut_outline"
              onClick={() => navigate("/profile")}
            >
              View My Profile &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT WRAPPER */}
      <main className="homepage_main">
        {isLoading && (
          <div className="homepage_status_box">
            <p>Loading alumni portal data...</p>
          </div>
        )}

        {loadError && (
          <div className="homepage_status_box error">
            <p>{loadError}</p>
          </div>
        )}

        {/* B. LATEST NEWS AND UPDATES */}
        <section className="homepage_section" aria-labelledby="news-heading">
          <div className="section_header">
            <div>
              <span className="section_eyebrow">Campus Milestones &amp; Stories</span>
              <h2 id="news-heading" className="section_title">
                Latest News &amp; Updates
              </h2>
            </div>
            <Link to="/NewsAndUpdates_page" className="section_view_all">
              View All News &rarr;
            </Link>
          </div>

          <div className="news_cards_grid">
            {newsList.map((item) => (
              <article key={item.id} className="news_card">
                <div className="news_card_media">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span className="news_category_pill">{item.category}</span>
                </div>
                <div className="news_card_body">
                  <time className="news_card_date">{item.date}</time>
                  <h3 className="news_card_title">{item.title}</h3>
                  <p className="news_card_excerpt">{item.description}</p>
                  <div className="news_card_footer">
                    <span className="news_author">{item.author}</span>
                    <button
                      type="button"
                      className="news_read_more"
                      onClick={() => navigate("/NewsAndUpdates_page")}
                    >
                      Read full story &rarr;
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* C. UPCOMING EVENTS */}
        <section className="homepage_section" aria-labelledby="events-heading">
          <div className="section_header">
            <div>
              <span className="section_eyebrow">Gatherings &amp; Reunions</span>
              <h2 id="events-heading" className="section_title">
                Upcoming Alumni Events
              </h2>
            </div>
            <Link to="/Eventlist_page" className="section_view_all">
              View All Events &rarr;
            </Link>
          </div>

          <div className="events_cards_grid">
            {eventList.map((ev) => (
              <article key={ev.id} className="event_card">
                <div className="event_date_badge">
                  <span className="event_month">{ev.month}</span>
                  <span className="event_day">{ev.day}</span>
                </div>
                <div className="event_card_body">
                  <div className="event_card_top">
                    <span className="event_category_pill">{ev.category}</span>
                    <span className="event_time">{ev.time}</span>
                  </div>
                  <h3 className="event_card_title">{ev.title}</h3>
                  <p className="event_location">
                    <svg
                      className="geo_icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {ev.location}
                  </p>
                  <p className="event_card_desc">{ev.description}</p>
                  <div className="event_card_actions">
                    <button
                      type="button"
                      className="event_details_btn"
                      onClick={() => navigate("/Eventlist_page")}
                    >
                      Details &amp; RSVP &rarr;
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* D. ALUMNI ENGAGEMENT SHORTCUTS */}
        <section className="homepage_section" aria-labelledby="engagement-heading">
          <div className="section_header">
            <div>
              <span className="section_eyebrow">Get Involved</span>
              <h2 id="engagement-heading" className="section_title">
                Alumni Engagement Opportunities
              </h2>
            </div>
          </div>

          <div className="engagement_grid">
            <div className="engagement_card">
              <div className="engagement_icon_wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Maintain Your Profile</h3>
              <p>
                Keep your degree program, current organization, and contact
                details updated so the Alumni Affairs office can reach you with
                relevant career and reunion invitations.
              </p>
              <button
                type="button"
                className="engagement_btn"
                onClick={() => navigate("/profile")}
              >
                Go to Profile &rarr;
              </button>
            </div>

            <div className="engagement_card">
              <div className="engagement_icon_wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>Alumni Gatherings &amp; Reunions</h3>
              <p>
                Confirm your attendance for the Grand Homecoming and local chapter
                fellowship sessions. Reconnect with batchmates and former faculty.
              </p>
              <button
                type="button"
                className="engagement_btn"
                onClick={() => navigate("/Eventlist_page")}
              >
                Browse Events &rarr;
              </button>
            </div>

            <div className="engagement_card">
              <div className="engagement_icon_wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3>Campus Developments</h3>
              <p>
                Follow research advancements, college achievements, and licensure
                milestones achieved by our alma mater across all fourteen colleges.
              </p>
              <button
                type="button"
                className="engagement_btn"
                onClick={() => navigate("/NewsAndUpdates_page")}
              >
                Read News &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* E. ALUMNI HIGHLIGHT (GROUNDED IN EXISTING SITE DATA) */}
        <section className="homepage_section spotlight_section">
          <div className="spotlight_card">
            <div className="spotlight_badge">
              <span>Alumni Spotlight</span>
            </div>
            <div className="spotlight_content">
              <h3>Dr. Maria Santos &bull; BS Biology (Class of 2012)</h3>
              <p className="spotlight_quote">
                &ldquo;The hands-on field biology expeditions led by our WMSU
                professors instilled in me a deep respect for our local waters
                and biodiversity.&rdquo;
              </p>
              <p className="spotlight_meta">
                Recipient of the 2026 ASEAN Science and Climate Innovation Fellowship for marine ecosystem conservation in Zamboanga Peninsula.
              </p>
              <div className="spotlight_actions">
                <button
                  type="button"
                  className="spotlight_link"
                  onClick={() => navigate("/NewsAndUpdates_page")}
                >
                  Read full feature in News &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* F. FOOTER */}
      <footer className="homepage_footer">
        <div className="homepage_footer_inner">
          <div className="homepage_footer_top">
            <div className="footer_brand">
              <div className="footer_logo_row">
                <img src={logo} alt="WMSU Logo" />
                <span>WMSU Alumni</span>
              </div>
              <p>
                Western Mindanao State University Alumni Tracking &amp; Engagement System.
                Keeping generations of Crimsons connected, informed, and engaged across the globe.
              </p>
            </div>

            <div className="footer_nav_col">
              <h4>Navigation</h4>
              <button type="button" onClick={() => navigate("/home")}>Home</button>
              <button type="button" onClick={() => navigate("/NewsAndUpdates_page")}>News &amp; Updates</button>
              <button type="button" onClick={() => navigate("/Eventlist_page")}>Events</button>
              <button type="button" onClick={() => navigate("/profile")}>My Profile</button>
            </div>

            <div className="footer_nav_col">
              <h4>University</h4>
              <a href="https://www.wmsu.edu.ph" target="_blank" rel="noopener noreferrer">
                Official WMSU Website &#8599;
              </a>
              <a href="https://www.facebook.com/wmsu.edu.ph" target="_blank" rel="noopener noreferrer">
                WMSU on Facebook &#8599;
              </a>
              <span>Office of Alumni Affairs</span>
            </div>
          </div>

          <div className="homepage_footer_bottom">
            <span>&copy; 2026 Western Mindanao State University Alumni. All rights reserved.</span>
            <span>Normal Road, Baliwasan, Zamboanga City, 7000 Philippines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
