
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './landing_page.jsx';
import Register from './register.jsx';
import Login from './log-in.jsx';
import Home from './home';
import Events from './EventList_page.jsx';
import News from './NewsAndUpdates_page.jsx';
import Navbar from './navbar.jsx';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Eventlist_page" element={<Events />} />
        <Route path="/NewsAndUpdates_page" element={<News />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
