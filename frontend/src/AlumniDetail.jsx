import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./ProfilePage.css";
import { CareerHistory, EducationHistory } from "./HistorySections.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("wmsu_user"));
  } catch {
    return null;
  }
}

// Read-only view of any alumni's profile (opened from the directory)
export default function AlumniDetail() {
  const { id } = useParams();
  const [alum, setAlum] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getSessionUser();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/api/alumni/${id}`)
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load profile.");
        if (!cancelled) setAlum(result.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not reach the server.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canEdit = !!user && !!alum && (user.id === alum.user_id || user.role === "admin");
  const initials = alum ? `${alum.first_name?.[0] || ""}${alum.last_name?.[0] || ""}`.toUpperCase() : "";

  return (
    <div className="profile_page">
      <main className="profile_main">
        <p>
          <Link to="/directory">&larr; Back to directory</Link>
        </p>

        {loading && (
          <div className="profile_feedback_banner info">
            <p>Loading profile...</p>
          </div>
        )}
        {error && (
          <div className="profile_feedback_banner error">
            <p>{error}</p>
          </div>
        )}

        {alum && (
          <>
            <section className="profile_header_card">
              <div className="profile_header_left">
                <div className="profile_avatar_circle crimson">
                  <span>{initials}</span>
                </div>
                <div className="profile_header_details">
                  <div className="profile_title_row">
                    <h1 className="profile_user_name">
                      {alum.first_name} {alum.last_name}
                    </h1>
                    {alum.status === "verified" && <span className="verified_badge">Verified Alum</span>}
                  </div>
                  <p className="profile_subtitle">
                    {[alum.program, alum.graduation_year && `Batch ${alum.graduation_year}`].filter(Boolean).join(" • ") ||
                      "Program not set"}
                  </p>
                </div>
              </div>
              {user && user.id === alum.user_id && (
                <div className="profile_header_actions">
                  <Link to="/profile" className="profile_btn btn_edit">
                    Edit Profile
                  </Link>
                </div>
              )}
            </section>

            <div className="profile_view_grid">
              <div className="profile_info_card">
                <h2 className="card_heading">Contact Information</h2>
                <div className="info_rows">
                  <div className="info_row">
                    <span className="info_label">Email Address</span>
                    <span className="info_value">{alum.email || "Not specified"}</span>
                  </div>
                  <div className="info_row">
                    <span className="info_label">Contact Number</span>
                    <span className="info_value">{alum.phone || "Not specified"}</span>
                  </div>
                </div>
              </div>
              <div className="profile_info_card">
                <h2 className="card_heading">About</h2>
                <p className="bio_text">{alum.bio || "No professional summary provided yet."}</p>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <CareerHistory profileId={alum.id} userId={user?.id} canEdit={canEdit} />
              <EducationHistory profileId={alum.id} userId={user?.id} canEdit={canEdit} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}