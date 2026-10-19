import './landing_page.css';
import news from './assets/news.png';
import events from './assets/events.png';
// import merch from './assets/merch.png';
import banner from './assets/wmsu_school_picture.jpg';
import logo from './assets/wmsu-logo.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();
  const [active, setActive] = useState('news');

  return (
    <div className="landing_page">
      <div className="hero" style={{ backgroundImage: `url(${banner})` }}>
        <div className="hero_overlay"></div>
        <div className="hero_content">
          <span className="hero_label">Western Mindanao State University</span>
          <h1>
            Home of the Crimsons
            <br />
            <span className="accent">Get connected.</span>
          </h1>
          <p>
            The official WMSU Alumni website. Catch up on the latest news from
            your alma mater, find upcoming events, and grab the newest merch
            from the student body.
          </p>
          <div className="button_row">
            <button className="login" onClick={() => navigate('/login')}>
              Login
            </button>
            <button
              className="register_button"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        </div>
      </div>

      <div className="highlights">
        <h2>Everything for WMSU alumni, in one place</h2>
        <span className="highlights_label">What's happening</span>

        <div className="cards">
          <button
            className={`card news ${active === 'news' ? 'active' : ''}`}
            onClick={() => setActive('news')}
          >
            <div className="card_icon">
              <img src={news} alt="" />
            </div>
            <h3>News</h3>
            <p>Stay current with announcements and stories from around campus.</p>
            <span>Show latest news &darr;</span>
          </button>

          <button
            className={`card events ${active === 'events' ? 'active' : ''}`}
            onClick={() => setActive('events')}
          >
            <div className="card_icon">
              <img src={events} alt="" />
            </div>
            <h3>Events</h3>
            <p>Homecomings, reunions, and gatherings. Find out what is coming up.</p>
            <span>Show latest event &darr;</span>
          </button>

          {/* merch panel button commented out for now for future cases */}
          {/* <button
            className={`card merch ${active === 'merch' ? 'active' : ''}`}
            onClick={() => setActive('merch')}
          >
            <div className="card_icon">
              <img src={merch} alt="" />
            </div>
            <h3>Merch</h3>
            <p>Wear your alma mater with official gear from the student body.</p>
            <span>Show latest merch &darr;</span>
          </button> */}
        </div>
      </div>

      <div className="latest">
        <div className={`panel ${active}`}>
          {active === 'news' && (
            <div>
              <span className="panel_tag">Latest News</span>
              <h3>Alumni Homecoming 2026 Announced</h3>
              <p className="panel_date">October 2026</p>
              <p className="panel_text">
                Registration for this year's homecoming is now open. Join
                fellow Crimsons for a weekend of reunions and campus tours.
              </p>
              <button className="panel_link" onClick={() => navigate('/news')}>
                Read more &rarr;
              </button>
            </div>
          )}

          {active === 'events' && (
            <div>
              <span className="panel_tag">Latest Event</span>
              <h3>Grand Alumni Reunion</h3>
              <p className="panel_date">December 12, 2026 · WMSU Campus</p>
              <p className="panel_text">
                A night of food, music, and stories with batchmates from every
                year. Bring your friends and family.
              </p>
              <button className="panel_link" onClick={() => navigate('/events')}>
                See details &rarr;
              </button>
            </div>
          )}

{/* merch panel commented out for now for future cases */}
          {/* {active === 'merch' && (
            <div>
              <span className="panel_tag">Latest Merch</span>
              <h3>Crimson Alumni Shirt</h3>
              <p className="panel_date">₱350</p>
              <p className="panel_text">
                The newest shirt from the student body. Available in all sizes
                while supplies last.
              </p>
              <button className="panel_link" onClick={() => navigate('/merch')}>
                Shop now &rarr;
              </button>
            </div>
          )} */}
        </div>
      </div>

      <div className="cta">
        <h2>Ready to reconnect?</h2>
        <p>Create your alumni account and stay part of the WMSU family.</p>
        <button className="cta_button" onClick={() => navigate('/register')}>
          Register now
        </button>
      </div>

      <footer className="site_footer">
        <div className="site_footer_inner">
          <div className="site_footer_top">
            <div className="sf_brand">
              <div className="sf_logo_row">
                <img src={logo} alt="WMSU Logo" />
                <span>WMSU Alumni</span>
              </div>
              <p>
                Keeping generations of WMSU graduates connected, informed, and
                engaged across the globe.
              </p>
            </div>

            <div className="sf_col">
              <h5>Explore</h5>
              <button type="button">About Us</button>
              <button type="button" onClick={() => navigate('/news')}>
                News &amp; Updates
              </button>
              <button type="button" onClick={() => navigate('/events')}>
                Events
              </button>
            </div>

            <div className="sf_col">
              <h5>Get Connected</h5>
              <button type="button" onClick={() => navigate('/login')}>
                Login / Sign Up
              </button>
              <button type="button">Join the Community</button>
              <button type="button">WMSU on Facebook &#8599;</button>
            </div>

            <div className="sf_col sf_feedback">
              <h5>Send us feedback</h5>
              <p>Help us improve your alumni experience.</p>
              <textarea placeholder="Share your thoughts or suggestions..."></textarea>
              <button type="button" className="sf_submit">
                Submit Feedback
              </button>
            </div>
          </div>

          <div className="site_footer_bottom">
            <span>&copy; 2026 WMSU Alumni. All rights reserved.</span>
            <span>
              Western Mindanao State University &bull; Normal Road, Baliwasan,
              Zamboanga City
            </span>
          </div>
        </div>
      </footer>
      </div>
  );
}