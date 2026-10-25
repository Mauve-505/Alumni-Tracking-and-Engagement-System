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

export default function AdminVerification() {
  const [tab, setTab] = useState("pending"); // "pending" | "verified"
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const user = getSessionUser();
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url =
      tab === "pending"
        ? `${API_URL}/api/admin/pending?requester_id=${user.id}`
        : `${API_URL}/api/alumni?status=verified`;

    fetch(url)
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load alumni.");
        if (!cancelled) setRows(result.data);
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
  }, [tab]);

  const changeStatus = async (alum, status) => {
    const user = getSessionUser();
    setBusyId(alum.id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/alumni/${alum.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: user.id, status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update status.");

      setRows((prev) => prev.filter((r) => r.id !== alum.id));
      setMessage(
        status === "verified"
          ? `${alum.first_name} ${alum.last_name} is now verified.`
          : `${alum.first_name} ${alum.last_name} was set back to pending.`
      );
    } catch (err) {
      setError(err.message || "Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="adm_page">
      <main className="adm_main">
        <p className="adm_eyebrow">Admin</p>
        <h1 className="adm_title">Alumni Verification</h1>

        <nav className="adm_tabs">
          <Link to="/admin" className="adm_tab">Dashboard</Link>
          <Link to="/admin/verification" className="adm_tab active">Verification</Link>
        </nav>

        <div className="adm_switch">
          <button
            type="button"
            className={tab === "pending" ? "active" : ""}
            onClick={() => {
              setTab("pending");
              setMessage(null);
            }}
          >
            Pending
          </button>
          <button
            type="button"
            className={tab === "verified" ? "active" : ""}
            onClick={() => {
              setTab("verified");
              setMessage(null);
            }}
          >
            Verified
          </button>
        </div>

        {message && <p className="adm_success">{message}</p>}
        {error && <p className="adm_error">{error}</p>}
        {loading && <p className="adm_muted">Loading...</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="adm_muted">
            {tab === "pending" ? "No profiles are waiting for verification." : "No verified alumni yet."}
          </p>
        )}

        <div className="adm_rows">
          {rows.map((a) => (
            <div key={a.id} className="adm_row">
              <div className="adm_row_info">
                <strong>
                  {a.first_name} {a.last_name}
                </strong>
                <span className="adm_meta">
                  {[a.email, a.program, a.graduation_year && `Batch ${a.graduation_year}`].filter(Boolean).join(" • ") ||
                    "No details yet"}
                </span>
              </div>
              <div className="adm_row_actions">
                <Link to={`/alumni/${a.id}`} className="adm_btn">
                  View
                </Link>
                {tab === "pending" ? (
                  <button
                    type="button"
                    className="adm_btn primary"
                    disabled={busyId === a.id}
                    onClick={() => changeStatus(a, "verified")}
                  >
                    {busyId === a.id ? "Saving..." : "Verify"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="adm_btn danger"
                    disabled={busyId === a.id}
                    onClick={() => changeStatus(a, "pending")}
                  >
                    {busyId === a.id ? "Saving..." : "Revoke"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}