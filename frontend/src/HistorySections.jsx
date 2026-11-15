import { useState, useEffect } from "react";
import "./HistorySections.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(url, options) {
  const res = await fetch(url, options);
  let result;
  try {
    result = await res.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }
  if (!res.ok) throw new Error(result.error || "Request failed.");
  return result.data;
}

function blankForm(fields) {
  const form = {};
  fields.forEach((f) => {
    if (f.type === "institution") {
      form.institution_id = ""; // "" = nothing chosen, "other" = typed name, otherwise an id
      form.institution = "";
    } else {
      form[f.name] = f.type === "checkbox" ? false : "";
    }
  });
  return form;
}

function formFromItem(fields, item) {
  const form = {};
  fields.forEach((f) => {
    const value = item[f.name];
    if (f.type === "institution") {
      form.institution_id = item.institution_id ? String(item.institution_id) : item.institution ? "other" : "";
      form.institution = item.institution_id ? "" : item.institution || "";
    } else if (f.type === "checkbox") form[f.name] = !!value;
    else if (f.type === "date") form[f.name] = value ? String(value).slice(0, 10) : "";
    else form[f.name] = value ?? "";
  });
  return form;
}

function payloadFromForm(fields, form) {
  const payload = {};
  fields.forEach((f) => {
    const value = form[f.name];
    if (f.type === "institution") {
      if (form.institution_id && form.institution_id !== "other") {
        payload.institution_id = Number(form.institution_id);
      } else {
        payload.institution_id = null;
        payload.institution = String(form.institution).trim() || null;
      }
    } else if (f.type === "checkbox") payload[f.name] = !!value;
    else if (f.type === "number") payload[f.name] = value === "" ? null : Number(value);
    else payload[f.name] = String(value).trim() === "" ? null : String(value).trim();
  });
  return payload;
}

function RecordSection({ title, path, fields, profileId, userId, canEdit, emptyText, renderItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // null | "new" | record id
  const [form, setForm] = useState(blankForm(fields));
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(0);
  const [institutions, setInstitutions] = useState([]);
  const hasInstitutionField = fields.some((f) => f.type === "institution");

  // The university dropdown comes from the database
  useEffect(() => {
    if (!hasInstitutionField) return;
    request(`${API_URL}/api/institutions`)
      .then(setInstitutions)
      .catch(() => setInstitutions([]));
  }, [hasInstitutionField]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    request(`${API_URL}/api/alumni/${profileId}/${path}`)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, path, version]);

  const startAdd = () => {
    setForm(blankForm(fields));
    setEditingId("new");
    setError(null);
  };

  const startEdit = (item) => {
    setForm(formFromItem(fields, item));
    setEditingId(item.id);
    setError(null);
  };

  const cancel = () => {
    setEditingId(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const f of fields) {
      if (f.type === "institution") {
        if (f.required && !form.institution_id) {
          setError(`${f.label} is required.`);
          return;
        }
        if (form.institution_id === "other" && String(form.institution).trim() === "") {
          setError("Please type the institution name.");
          return;
        }
        continue;
      }
      if (f.required && String(form[f.name]).trim() === "") {
        setError(`${f.label} is required.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const body = JSON.stringify({ requester_id: userId, ...payloadFromForm(fields, form) });
      const headers = { "Content-Type": "application/json" };
      if (editingId === "new") {
        await request(`${API_URL}/api/alumni/${profileId}/${path}`, { method: "POST", headers, body });
      } else {
        await request(`${API_URL}/api/${path}/${editingId}`, { method: "PUT", headers, body });
      }
      setEditingId(null);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await request(`${API_URL}/api/${path}/${item.id}?requester_id=${userId}`, { method: "DELETE" });
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="hist_card">
      <div className="hist_header">
        <h2>{title}</h2>
        {canEdit && editingId === null && (
          <button type="button" className="hist_btn hist_btn_primary" onClick={startAdd}>
            + Add
          </button>
        )}
      </div>

      {error && <p className="hist_error">{error}</p>}

      {editingId !== null && (
        <form className="hist_form" onSubmit={handleSubmit}>
          {fields.map((f) =>
            f.type === "institution" ? (
              <div key={f.name} className="hist_field">
                <label htmlFor={`${path}_institution_id`}>
                  {f.label}
                  {f.required && <span className="hist_req"> *</span>}
                </label>
                <select
                  id={`${path}_institution_id`}
                  name="institution_id"
                  value={form.institution_id}
                  onChange={handleChange}
                >
                  <option value="">Select a university</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                  <option value="other">Other (type the name)</option>
                </select>
                {form.institution_id === "other" && (
                  <input
                    type="text"
                    name="institution"
                    value={form.institution}
                    onChange={handleChange}
                    placeholder={f.placeholder || ""}
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            ) : f.type === "select" ? (
              <div key={f.name} className="hist_field">
                <label htmlFor={`${path}_${f.name}`}>{f.label}</label>
                <select id={`${path}_${f.name}`} name={f.name} value={form[f.name]} onChange={handleChange}>
                  <option value="">Select {f.label.toLowerCase()}</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : f.type === "checkbox" ? (
              <label key={f.name} className="hist_check">
                <input type="checkbox" name={f.name} checked={form[f.name]} onChange={handleChange} />
                {f.label}
              </label>
            ) : (
              <div key={f.name} className="hist_field">
                <label htmlFor={`${path}_${f.name}`}>
                  {f.label}
                  {f.required && <span className="hist_req"> *</span>}
                </label>
                <input
                  id={`${path}_${f.name}`}
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder || ""}
                  disabled={f.name === "end_date" && form.is_current}
                />
              </div>
            )
          )}
          <div className="hist_form_actions">
            <button type="submit" className="hist_btn hist_btn_primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="hist_btn" onClick={cancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="hist_muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="hist_muted">{emptyText}</p>
      ) : (
        <ul className="hist_list">
          {items.map((item) => (
            <li key={item.id} className="hist_item">
              <div className="hist_item_body">{renderItem(item)}</div>
              {canEdit && (
                <div className="hist_item_actions">
                  <button type="button" className="hist_btn" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className="hist_btn hist_btn_danger" onClick={() => handleDelete(item)}>
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const EMPLOYMENT_FIELDS = [
  { name: "company", label: "Company", type: "text", required: true, placeholder: "e.g. Accenture" },
  { name: "position", label: "Position", type: "text", required: true, placeholder: "e.g. Software Developer" },
  { name: "industry", label: "Industry", type: "text", placeholder: "e.g. Information Technology" },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "end_date", label: "End date", type: "date" },
  { name: "is_current", label: "I currently work here", type: "checkbox" },
];

const LEVEL_OPTIONS = [
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
  { value: "short_course", label: "Short course" },
];

const EDUCATION_FIELDS = [
  { name: "institution", label: "Institution", type: "institution", required: true, placeholder: "Type the institution name" },
  { name: "level", label: "Level", type: "select", options: LEVEL_OPTIONS },
  { name: "degree", label: "Degree / Program", type: "text", placeholder: "e.g. Master of Information Technology" },
  { name: "year", label: "Year", type: "number", placeholder: "e.g. 2025" },
];

function formatDate(value) {
  if (!value) return "";
  const [y, m] = String(value).slice(0, 10).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1] || ""} ${y}`.trim();
}

export function CareerHistory(props) {
  return (
    <RecordSection
      {...props}
      title="Career History"
      path="employment"
      fields={EMPLOYMENT_FIELDS}
      emptyText="No employment records yet."
      renderItem={(job) => (
        <>
          <strong>{job.position}</strong> at {job.company}
          {job.is_current && <span className="hist_badge">Current</span>}
          <div className="hist_meta">
            {[job.industry, [formatDate(job.start_date), job.is_current ? "Present" : formatDate(job.end_date)].filter(Boolean).join(" - ")]
              .filter(Boolean)
              .join(" • ")}
          </div>
        </>
      )}
    />
  );
}

export function EducationHistory(props) {
  return (
    <RecordSection
      {...props}
      title="Further Education"
      path="education"
      fields={EDUCATION_FIELDS}
      emptyText="No education records yet."
      renderItem={(edu) => (
        <>
          <strong>{edu.institution}</strong>
          <div className="hist_meta">
            {[LEVEL_OPTIONS.find((l) => l.value === edu.level)?.label, edu.degree, edu.year]
              .filter(Boolean)
              .join(" • ")}
          </div>
        </>
      )}
    />
  );
}