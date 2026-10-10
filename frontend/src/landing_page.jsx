import { useState } from 'react';
import 'landing_page.css';
import logo from './assets/wmsu-logo.png';
import menu from './assets/menu-dots.png';
import news from './assets/news.png';
import events from './assets/events.png';
import merch from './assets/merch.png';

function App() {

  const [open, setOpen] = useState(false);

  return (
    <div className="landing_page">
      <div className="header">
        <img src={logo} alt="WMSU Logo" />
        <p>WMSU Alumni</p>
<div className="menu_wrap">
  <button className="menu_button" onClick={() => setOpen(!open)}>
    <img src={menu} alt="Menu" />
  </button>
  {open && (
    <div className="dropdown">
      <a href="#" onClick={() => setOpen(false)}>Login/Signup</a>
      <a href="#" onClick={() => setOpen(false)}>News</a>
      <a href="#" onClick={() => setOpen(false)}>Events</a>
      <a href="#" onClick={() => setOpen(false)}>Merch</a>
      <a href="#" onClick={() => setOpen(false)}>About</a>
      <a href="#" onClick={() => setOpen(false)}>Contact</a>
      <a href="#" onClick={() => setOpen(false)}>Feedback</a>
    </div>
  )}
</div>
      </div>

      <div className="body">
        <div className="B1">
          <p>Welcome to the <br /> WMSU Alumni page</p>
        </div>
        <div className="B2">
          <p className="B2_title">WMSU Alumni</p>
          <p className="B2_text">
            Welcome to the official WMSU Alumni website where you can browse
            the latest news about your alma mater the latest events and even
            the latest merch brought to you by the student body.
          </p>
          <button><img src={news} alt="" /> News</button>
          <button><img src={events} alt="" /> Events</button>
          <button><img src={merch} alt="" /> Merch</button>
          <button className='login_signup'>Login/Signup</button>
        </div>
      </div>

      <div className="footer">
        <div className="F1">
          <p>&copy; 2026 WMSU Alumni. All rights reserved.</p>
          <p>Message: @wmsualumni.org</p>
          <p>Phone: (+63) 987 6543 210</p>
        </div>

        <div className="F2">
          <div className="question_group">
            <label htmlFor="question_box">Feedback:</label>
            <div className="input_container">
              <textarea
                id="question_box"
                name="question_box"
                placeholder="Enter your feedback here..."
              ></textarea>
              <button type="button" className="submit_btn">Submit</button>
            </div>
          </div>

          <div className="social_group">
            <span>Follow us on:</span>
            <br />
            <a href="https://www.facebook.com/wmsu.edu.ph" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;