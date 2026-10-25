import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './landing_page.jsx';
import Register from './register.jsx';
import Login from './log-in.jsx';
import HomePage from './HomePage.jsx';
import ProfilePage from './ProfilePage.jsx';
import Events from './EventList_page.jsx';
import News from './NewsAndUpdates_page.jsx';
import Navbar from './navbar.jsx';
import DirectoryPage from './DirectoryPage.jsx';
import AlumniDetail from './AlumniDetail.jsx';
import RequireAdmin from './admin/Requireadmin.jsx';
import AdminDashboard from './admin/Admindashboard.jsx';
import AdminVerification from './admin/Adminverification.jsx';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/alumni/:id" element={<AlumniDetail />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <RequireAdmin>
              <AdminVerification />
            </RequireAdmin>
          }
        />
        <Route path="/Eventlist_page" element={<Events />} />
        <Route path="/events" element={<Events />} />
        <Route path="/NewsAndUpdates_page" element={<News />} />
        <Route path="/news" element={<News />} />
        <Route path="/newsandupdates" element={<News />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);