import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "./Admin.css";
import { employmentLabel } from "../colleges.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("wmsu_user"));
  } catch {
    return null;
  }
}

const EMPTY_TEXT = {
  pending: "No profiles are waiting for verification.",
  verified: "No verified alumni yet.",
  rejected: "No rejected profiles.",
};

export default function AdminVerification() {
  const [tab, setTab] = useState("pending"); // "pending" | "verified" | "rejected"
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState([]); // ids ticked for bulk verify
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelected([]);
    setRejectingId(null);

    const url =
      tab === "pending"
        ? `${API_URL}/api/admin/pending?requester_id=${user.id}`
        : `${API_URL}/api/alumni?requester_id=${user.id}&status=${tab}`;

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

  const switchTab = (next) => {
    setTab(next);
    setMessage(null);
  };

  const changeStatus = async (alum, status, why) => {
    const user = getSessionUser();
    setBusyId(alum.id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/alumni/${alum.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: user.id, status, reason: why }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update status.");

      setRows((prev) => prev.filter((r) => r.id !== alum.id));
      setSelected((prev) => prev.filter((id) => id !== alum.id));
      setRejectingId(null);
      setReason("");
      const name = `${alum.first_name} ${alum.last_name}`;
      setMessage(
        status === "verified"
          ? `${name} is now verified.`
          : status === "rejected"
          ? `${name} was rejected.`
          : `${name} was set back to pending.`
      );
    } catch (err) {
      setError(err.message || "Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleSelected = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.length === rows.length ? [] : rows.map((r) => r.id)));
  };

  const verifySelected = async () => {
    if (selected.length === 0) return;
    const user = getSessionUser();
    setBulkBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/verify-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: user.id, ids: selected }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Bulk verify failed.");
      const done = result.data.ids;
      setRows((prev) => prev.filter((r) => !done.includes(r.id)));
      setSelected([]);
      setMessage(`${result.data.verified} profile(s) verified.`);
    } catch (err) {
      setError(err.message || "Could not reach the server.");
    } finally {
      setBulkBusy(false);
    }
  };

  // The certificate is private, so it is fetched with the admin's id and opened as a temporary blob
  const viewCertificate = async (alum) => {
    const user = getSessionUser();
    const tabWindow = window.open("", "_blank");
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/alumni/${alum.id}/certificate?requester_id=${user.id}`);
      if (!res.ok) {
        let msg = "Could not load the certificate.";
        try {
          msg = (await res.json()).error || msg;
        } catch {
          // keep default
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (tabWindow) {
        tabWindow.location = url;
      } else {
        window.location = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      if (tabWindow) tabWindow.close();
      setError(err.message || "Could not reach the server.");
    }
  };

  return (
    <div className="adm_page">
      <main className="adm_main">
        <p className="adm_eyebrow">Admin</p>
        <h1 className="adm_title">Alumni Verification</h1>

        <nav className="adm_tabs">
          <Link to="/admin" className="adm_tab">Dashboard</Link>
          <Link to="/admin/content" className="adm_tab">Content Management</Link>
          <Link to="/admin/verification" className="adm_tab active">Verification</Link>
        </nav>

        <div className="adm_switch">
          {["pending", "verified", "rejected"].map((t) => (
            <button key={t} type="button" className={tab === t ? "active" : ""} onClick={() => switchTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {message && <p className="adm_success">{message}</p>}
        {error && <p className="adm_error">{error}</p>}
        {loading && <p className="adm_muted">Loading...</p>}
        {!loading && !error && rows.length === 0 && <p className="adm_muted">{EMPTY_TEXT[tab]}</p>}

        {tab === "pending" && rows.length > 0 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "8px 0" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={selected.length === rows.length} onChange={toggleAll} />
              Select all
            </label>
            <button
              type="button"
              className="adm_btn primary"
              disabled={selected.length === 0 || bulkBusy}
              onClick={verifySelected}
            >
              {bulkBusy ? "Verifying..." : `Verify selected (${selected.length})`}
            </button>
          </div>
        )}

        <div className="adm_rows">
          {rows.map((a) => (
            <div key={a.id} className="adm_row" style={{ flexWrap: "wrap" }}>
              {tab === "pending" && (
                <input
                  type="checkbox"
                  checked={selected.includes(a.id)}
                  onChange={() => toggleSelected(a.id)}
                  aria-label={`Select ${a.first_name} ${a.last_name}`}
                />
              )}
              <div className="adm_row_info" style={{ flex: 1, textAlign: "left" }}>
                <strong>
                  {a.first_name} {a.last_name}
                </strong>
                <span className="adm_meta">
                  {[
                    a.email,
                    a.college,
                    a.program,
                    a.graduation_year && `Batch ${a.graduation_year}`,
                    a.employment_status && employmentLabel(a.employment_status),
                  ]
                    .filter(Boolean)
                    .join(" • ") || "No details yet"}
                </span>
                {tab === "pending" && (
                  <span className="adm_meta">
                    {a.has_certificate ? "Certificate uploaded" : "No certificate uploaded yet"}
                  </span>
                )}
              </div>
              <div className="adm_row_actions">
                <Link to={`/alumni/${a.id}`} className="adm_btn">
                  View
                </Link>
                {(tab !== "pending" || a.has_certificate) && (
                  <button type="button" className="adm_btn" onClick={() => viewCertificate(a)}>
                    Certificate
                  </button>
                )}
                {tab === "pending" && (
                  <>
                    <button
                      type="button"
                      className="adm_btn primary"
                      disabled={busyId === a.id}
                      onClick={() => changeStatus(a, "verified")}
                    >
                      {busyId === a.id ? "Saving..." : "Verify"}
                    </button>
                    <button
                      type="button"
                      className="adm_btn danger"
                      disabled={busyId === a.id}
                      onClick={() => {
                        setRejectingId(rejectingId === a.id ? null : a.id);
                        setReason("");
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {tab === "verified" && (
                  <button
                    type="button"
                    className="adm_btn danger"
                    disabled={busyId === a.id}
                    onClick={() => changeStatus(a, "pending")}
                  >
                    {busyId === a.id ? "Saving..." : "Revoke"}
                  </button>
                )}
                {tab === "rejected" && (
                  <button
                    type="button"
                    className="adm_btn primary"
                    disabled={busyId === a.id}
                    onClick={() => changeStatus(a, "verified")}
                  >
                    {busyId === a.id ? "Saving..." : "Verify"}
                  </button>
                )}
              </div>

              {rejectingId === a.id && (
                <div style={{ flexBasis: "100%", display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for rejecting (required)"
                    maxLength={500}
                    style={{ flex: 1, padding: "6px 10px" }}
                  />
                  <button
                    type="button"
                    className="adm_btn danger"
                    disabled={!reason.trim() || busyId === a.id}
                    onClick={() => changeStatus(a, "rejected", reason.trim())}
                  >
                    Confirm reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}