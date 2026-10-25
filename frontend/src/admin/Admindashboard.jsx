import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("wmsu_user"));
  } catch {
    return null;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getSessionUser();
    let cancelled = false;

    fetch(`${API_URL}/api/admin/dashboard?requester_id=${user.id}`)
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load dashboard.");
        if (!cancelled) setStats(result.data);
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
  }, []);

  const maxPerYear = stats ? Math.max(1, ...stats.alumni_per_year.map((y) => y.count)) : 1;

  return (
    <div className="adm_page">
      <main className="adm_main">
        <p className="adm_eyebrow">Admin</p>
        <h1 className="adm_title">Admin Dashboard</h1>

        <nav className="adm_tabs">
          <Link to="/admin" className="adm_tab active">Dashboard</Link>
          <Link to="/admin/verification" className="adm_tab">Verification</Link>
        </nav>

        {loading && <p className="adm_muted">Loading dashboard...</p>}
        {error && <p className="adm_error">{error}</p>}

        {stats && (
          <>
            <section className="adm_stats">
              <div className="adm_stat">
                <span>Total Alumni</span>
                <strong>{stats.total_alumni}</strong>
              </div>
              <div className="adm_stat">
                <span>Verified</span>
                <strong>{stats.verified}</strong>
              </div>
              <div className="adm_stat">
                <span>Pending</span>
                <strong>{stats.pending}</strong>
              </div>
              <div className="adm_stat">
                <span>Employment Rate</span>
                <strong>{stats.employment_rate}%</strong>
              </div>
              <div className="adm_stat">
                <span>Upcoming Events</span>
                <strong>{stats.upcoming_events}</strong>
              </div>
              <div className="adm_stat">
                <span>Posts</span>
                <strong>{stats.total_posts}</strong>
              </div>
            </section>

            <section className="adm_columns">
              <div className="adm_card">
                <h2>Recent registrations</h2>
                {stats.recent_signups.length === 0 ? (
                  <p className="adm_muted">No registrations yet.</p>
                ) : (
                  <ul className="adm_list">
                    {stats.recent_signups.map((a) => (
                      <li key={a.id}>
                        <Link to={`/alumni/${a.id}`}>
                          {a.first_name} {a.last_name}
                        </Link>
                        <span className="adm_meta">
                          {a.program || "No program yet"}
                        </span>
                        <span className={`adm_pill ${a.status}`}>{a.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="adm_card">
                <h2>Quick actions</h2>
                <ul className="adm_links">
                  <li>
                    <Link to="/admin/verification">
                      Review pending profiles
                      {stats.pending > 0 && <span className="adm_count">{stats.pending}</span>}
                    </Link>
                  </li>
                  <li>
                    <Link to="/directory">Open alumni directory</Link>
                  </li>
                </ul>
              </div>
            </section>

            <section className="adm_card">
              <h2>Alumni per graduation year</h2>
              {stats.alumni_per_year.length === 0 ? (
                <p className="adm_muted">No graduation years recorded yet.</p>
              ) : (
                <div className="adm_bars">
                  {stats.alumni_per_year.map((y) => (
                    <div key={y.year} className="adm_bar_row">
                      <span className="adm_bar_label">{y.year}</span>
                      <div className="adm_bar_track">
                        <div className="adm_bar_fill" style={{ width: `${(y.count / maxPerYear) * 100}%` }} />
                      </div>
                      <span className="adm_bar_count">{y.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}