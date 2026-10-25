import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./DirectoryPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_FILTERS = { name: "", year: "", program: "", status: "" };

export default function DirectoryPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Re-fetch (with a short delay while typing) whenever the filters change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) params.set(key, value.trim());
      });

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/alumni?${params.toString()}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load alumni.");
        if (!cancelled) {
          setAlumni(result.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  return (
    <div className="dir_page">
      <main className="dir_main">
        <h1 className="dir_title">Alumni Directory</h1>
        <p className="dir_subtitle">Find and reconnect with fellow WMSU graduates.</p>

        <div className="dir_filters">
          <input
            type="text"
            name="name"
            placeholder="Search by name"
            value={filters.name}
            onChange={handleChange}
          />
          <input
            type="number"
            name="year"
            placeholder="Graduation year"
            value={filters.year}
            onChange={handleChange}
          />
          <input
            type="text"
            name="program"
            placeholder="Program / course"
            value={filters.program}
            onChange={handleChange}
          />
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
          <button type="button" className="dir_clear" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear
          </button>
        </div>

        {error && <p className="dir_error">{error}</p>}
        {loading && <p className="dir_muted">Loading alumni...</p>}
        {!loading && !error && alumni.length === 0 && (
          <p className="dir_muted">No alumni match your search.</p>
        )}

        <div className="dir_grid">
          {alumni.map((a) => (
            <Link key={a.id} to={`/alumni/${a.id}`} className="dir_card">
              <div className="dir_avatar">
                {`${a.first_name?.[0] || ""}${a.last_name?.[0] || ""}`.toUpperCase()}
              </div>
              <div className="dir_info">
                <h2>
                  {a.first_name} {a.last_name}
                </h2>
                <p>
                  {[a.program, a.graduation_year && `Batch ${a.graduation_year}`].filter(Boolean).join(" • ") ||
                    "Program not set"}
                </p>
                {a.current_position && (
                  <p className="dir_job">
                    {a.current_position}
                    {a.current_company ? ` at ${a.current_company}` : ""}
                  </p>
                )}
                <span className={`dir_status ${a.status}`}>
                  {a.status === "verified" ? "Verified" : "Pending"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}