import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import logo from "./assets/wmsu-logo.png";

// List of official WMSU colleges for the dropdown
const WMSU_COLLEGES = [
  "College of Science and Mathematics",
  "College of Engineering",
  "College of Computing Studies",
  "College of Teacher Education",
  "College of Nursing",
  "College of Liberal Arts",
  "College of Agriculture",
  "College of Architecture",
  "College of Criminal Justice Education",
  "College of Home Economics",
  "College of Public Administration and Development Studies",
  "College of Social Work and Community Development",
  "College of Law",
  "College of Medicine",
];

// Baseline demonstration profile data if not present in browser storage
const DEFAULT_PROFILE = {
  firstName: "Crimson",
  middleInitial: "A.",
  lastName: "Alumnus",
  alumniId: "WMSU-2022-0482",
  email: "alumni.demo@wmsu.edu.ph",
  phone: "+63 917 555 0192",
  college: "College of Science and Mathematics",
  degree: "Bachelor of Science in Computer Science",
  gradYear: "2022",
  bio: "Proud Crimson graduate actively working in software technology. Dedicated to mentoring undergraduate students, attending annual homecomings, and giving back to the Western Mindanao community.",
  avatarTheme: "crimson",
};

export default function ProfilePage() {
  const navigate = useNavigate();

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect these frontend states to the actual loading,
  // error, and empty responses from the backend when available.
  const [isLoading] = useState(false);
  const [loadError] = useState(null);

  // Profile data states
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [draft, setDraft] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  // Load existing frontend user / profile data if present
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("wmsu_profile");
      const storedUser = localStorage.getItem("wmsu_user");

      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
        setDraft(parsed);
      } else if (storedUser) {
        const user = JSON.parse(storedUser);
        const merged = {
          ...DEFAULT_PROFILE,
          firstName: user.first_name || user.firstName || "Crimson",
          lastName: user.last_name || user.lastName || "Alumnus",
          email: user.email || DEFAULT_PROFILE.email,
        };
        setProfile(merged);
        setDraft(merged);
      }
    } catch {
      // Storage unavailable; keep defaults
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!draft.firstName || !draft.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!draft.lastName || !draft.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!draft.email || !draft.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (draft.phone && !/^[\d\s+\-()]+$/.test(draft.phone)) {
      newErrors.phone = "Please enter a valid contact number format.";
    }

    if (!draft.gradYear) {
      newErrors.gradYear = "Graduation year is required.";
    } else {
      const year = parseInt(draft.gradYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1940 || year > currentYear + 1) {
        newErrors.gradYear = `Graduation year must be between 1940 and ${currentYear + 1}.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect the profile save handler to the backend
  // profile-update functionality. Do not implement it in this task.
  const handleSave = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFeedback({
        type: "error",
        message: "Please correct the errors in the form before saving.",
      });
      return;
    }

    // Save demonstration edits to React state
    setProfile(draft);
    setIsEditing(false);

    try {
      localStorage.setItem("wmsu_profile", JSON.stringify(draft));
    } catch {
      // Storage unavailable; changes remain in React state only
    }

    setFeedback({
      type: "success",
      message:
        "Profile updated successfully in frontend state! (Demonstration note: Changes are held locally in your browser and will synchronize with the server once backend integration is complete).",
    });
  };

  const handleCancel = () => {
    setDraft(profile);
    setErrors({});
    setIsEditing(false);
    setFeedback({
      type: "info",
      message: "Profile editing was cancelled. Unsaved changes were discarded.",
    });
  };

  // BACKEND CONNECTION POINT:
  // Groupmates: Connect logout to the backend session or token
  // invalidation mechanism when implementing authentication.
  const handleLogout = () => {
    try {
      localStorage.removeItem("wmsu_user");
      localStorage.removeItem("wmsu_role");
    } catch {
      // Storage unavailable
    }
    navigate("/login");
  };

  // User initials for default avatar display
  const avatarInitials = `${profile.firstName ? profile.firstName[0] : "W"}${
    profile.lastName ? profile.lastName[0] : "A"
  }`.toUpperCase();

  const fullName = `${profile.firstName} ${
    profile.middleInitial ? profile.middleInitial + " " : ""
  }${profile.lastName}`.trim();

  return (
    <div className="profile_page">
      {/* DEMO NOTICE BANNER */}
      <div className="profile_demo_bar" role="status">
        <span className="demo_pill">Frontend Demonstration</span>
        <span>
          Profile information is managed in client-side state. Permanent database updates will occur after backend integration.
        </span>
      </div>

      <main className="profile_main">
        {/* Loading / Error States */}
        {isLoading && (
          <div className="profile_feedback_banner info">
            <p>Loading profile information from server...</p>
          </div>
        )}

        {loadError && (
          <div className="profile_feedback_banner error">
            <p>{loadError}</p>
          </div>
        )}

        {/* User Feedback Alert */}
        {feedback && (
          <div
            className={`profile_feedback_banner ${feedback.type}`}
            role="alert"
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              className="feedback_close_btn"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
            >
              &times;
            </button>
          </div>
        )}

        {/* PROFILE HEADER CARD */}
        <section className="profile_header_card">
          <div className="profile_header_left">
            {/* BACKEND CONNECTION POINT:
                Groupmates: Connect profile-picture retrieval and upload to the
                backend or approved file-storage service in the future. */}
            <div className={`profile_avatar_circle ${profile.avatarTheme || "crimson"}`}>
              <span>{avatarInitials}</span>
            </div>

            <div className="profile_header_details">
              <div className="profile_title_row">
                <h1 className="profile_user_name">{fullName}</h1>
                <span className="verified_badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified Alum
                </span>
              </div>
              <p className="profile_subtitle">
                {profile.degree} &bull; Batch {profile.gradYear}
              </p>
              <p className="profile_college_name">{profile.college}</p>
              <span className="alumni_id_tag">ID: {profile.alumniId}</span>
            </div>
          </div>

          <div className="profile_header_actions">
            {!isEditing ? (
              <button
                type="button"
                className="profile_btn btn_edit"
                onClick={() => {
                  setIsEditing(true);
                  setDraft(profile);
                  setFeedback(null);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="editing_action_buttons">
                <button
                  type="button"
                  className="profile_btn btn_save"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="profile_btn btn_cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* PROFILE BODY SECTION */}
        {/* BACKEND CONNECTION POINT:
            Groupmates: Retrieve the authenticated user's profile information
            from the backend for display in this section. */}
        {!isEditing ? (
          /* ================= VIEW PROFILE MODE ================= */
          <div className="profile_view_grid">
            {/* Academic Information Card */}
            <div className="profile_info_card">
              <h2 className="card_heading">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Academic Information
              </h2>
              <div className="info_rows">
                <div className="info_row">
                  <span className="info_label">College / Department</span>
                  <span className="info_value">{profile.college || "Not specified"}</span>
                </div>
                <div className="info_row">
                  <span className="info_label">Degree Program</span>
                  <span className="info_value">{profile.degree || "Not specified"}</span>
                </div>
                <div className="info_row">
                  <span className="info_label">Year Graduated</span>
                  <span className="info_value">{profile.gradYear || "Not specified"}</span>
                </div>
                <div className="info_row">
                  <span className="info_label">Alumni Identifier</span>
                  <span className="info_value">{profile.alumniId || "Not specified"}</span>
                </div>
                <div className="info_row">
                  <span className="info_label">Alumni Status</span>
                  <span className="info_value badge_active">Active &bull; Verified Record</span>
                </div>
              </div>
            </div>

            {/* Personal & Contact Details Card */}
            <div className="profile_info_card">
              <h2 className="card_heading">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Personal &amp; Contact Information
              </h2>
              <div className="info_rows">
                <div className="info_row">
                  <span className="info_label">Full Name</span>
                  <span className="info_value">{fullName}</span>
                </div>
                <div className="info_row">
                  <span className="info_label">Email Address</span>
                  <span className="info_value">{profile.email || "Not specified"}</span>
                </div>
                <div className="info_row">
                  <span className="info_label">Contact Number</span>
                  <span className="info_value">{profile.phone || "Not specified"}</span>
                </div>
                <div className="info_row">
                  <span className="info_label">Campus Affiliation</span>
                  <span className="info_value">WMSU Main Campus (Baliwasan)</span>
                </div>
              </div>
            </div>

            {/* Professional Summary / Bio Card */}
            <div className="profile_info_card full_width_card">
              <h2 className="card_heading">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Professional Summary &amp; Bio
              </h2>
              <p className="bio_text">
                {profile.bio || "No professional summary provided yet. Click 'Edit Profile' to add a short biography."}
              </p>
            </div>
          </div>
        ) : (
          /* ================= EDIT PROFILE MODE ================= */
          <form className="profile_edit_form" onSubmit={handleSave}>
            <div className="form_section_header">
              <h2>Edit Profile Information</h2>
              <p>Update your contact, academic, and biographical information.</p>
            </div>

            <div className="form_grid">
              {/* Name Fields */}
              <div className="form_group">
                <label htmlFor="firstName">
                  First Name <span className="req">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={draft.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "input_error" : ""}
                  placeholder="e.g. Maria"
                />
                {errors.firstName && <span className="field_error">{errors.firstName}</span>}
              </div>

              <div className="form_group initial_group">
                <label htmlFor="middleInitial">M.I.</label>
                <input
                  id="middleInitial"
                  type="text"
                  name="middleInitial"
                  maxLength={4}
                  value={draft.middleInitial}
                  onChange={handleChange}
                  placeholder="e.g. A."
                />
              </div>

              <div className="form_group">
                <label htmlFor="lastName">
                  Last Name <span className="req">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={draft.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "input_error" : ""}
                  placeholder="e.g. Santos"
                />
                {errors.lastName && <span className="field_error">{errors.lastName}</span>}
              </div>

              {/* Alumni ID */}
              <div className="form_group">
                <label htmlFor="alumniId">Student Number / Alumni ID</label>
                <input
                  id="alumniId"
                  type="text"
                  name="alumniId"
                  value={draft.alumniId}
                  onChange={handleChange}
                  placeholder="e.g. 2022-01982"
                />
              </div>

              {/* Email */}
              <div className="form_group">
                <label htmlFor="email">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={draft.email}
                  onChange={handleChange}
                  className={errors.email ? "input_error" : ""}
                  placeholder="e.g. alum@wmsu.edu.ph"
                />
                {errors.email && <span className="field_error">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="form_group">
                <label htmlFor="phone">Contact Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={draft.phone}
                  onChange={handleChange}
                  className={errors.phone ? "input_error" : ""}
                  placeholder="e.g. +63 917 123 4567"
                />
                {errors.phone && <span className="field_error">{errors.phone}</span>}
              </div>

              {/* College */}
              <div className="form_group">
                <label htmlFor="college">College / Department</label>
                <select
                  id="college"
                  name="college"
                  value={draft.college}
                  onChange={handleChange}
                >
                  <option value="">Select College</option>
                  {WMSU_COLLEGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Degree Program */}
              <div className="form_group">
                <label htmlFor="degree">Degree Program / Course</label>
                <input
                  id="degree"
                  type="text"
                  name="degree"
                  value={draft.degree}
                  onChange={handleChange}
                  placeholder="e.g. Bachelor of Science in Computer Science"
                />
              </div>

              {/* Graduation Year */}
              <div className="form_group">
                <label htmlFor="gradYear">
                  Graduation Year <span className="req">*</span>
                </label>
                <input
                  id="gradYear"
                  type="number"
                  name="gradYear"
                  min="1940"
                  max="2030"
                  value={draft.gradYear}
                  onChange={handleChange}
                  className={errors.gradYear ? "input_error" : ""}
                  placeholder="e.g. 2022"
                />
                {errors.gradYear && <span className="field_error">{errors.gradYear}</span>}
              </div>

              {/* Avatar Preset Theme */}
              <div className="form_group">
                <label htmlFor="avatarTheme">Avatar Accent Color</label>
                <select
                  id="avatarTheme"
                  name="avatarTheme"
                  value={draft.avatarTheme || "crimson"}
                  onChange={handleChange}
                >
                  <option value="crimson">WMSU Crimson Red</option>
                  <option value="navy">Crimson Navy</option>
                  <option value="dark">Deep Crimson Maroon</option>
                </select>
              </div>

              {/* Bio / Professional Summary */}
              <div className="form_group full_width">
                <label htmlFor="bio">Professional Summary / Short Biography</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={draft.bio}
                  onChange={handleChange}
                  placeholder="Share a short summary of your current professional work, achievements, and interests..."
                />
                <span className="char_counter">
                  {(draft.bio || "").length} / 500 characters
                </span>
              </div>
            </div>

            <div className="form_actions_bottom">
              <button type="submit" className="profile_btn btn_save">
                Save Changes
              </button>
              <button
                type="button"
                className="profile_btn btn_cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ACCOUNT SETTINGS / LOGOUT SECTION */}
        <section className="profile_account_section">
          <div className="account_actions_box">
            <div>
              <h3>Account Session</h3>
              <p>Log out of your alumni session on this device.</p>
            </div>
            <button
              type="button"
              className="btn_logout"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="profile_footer">
        <div className="profile_footer_inner">
          <div className="footer_brand_small">
            <img src={logo} alt="WMSU Logo" />
            <span>WMSU Alumni Tracking and Engagement System</span>
          </div>
          <p className="footer_copy">
            &copy; 2026 Western Mindanao State University. Normal Road, Baliwasan, Zamboanga City.
          </p>
        </div>
      </footer>
    </div>
  );
}
