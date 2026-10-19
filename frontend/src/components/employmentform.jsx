// Backend hook: this form should eventually save to the employment_history table for the logged-in alumni profile.
// It currently uses local state from App.jsx; replace with API calls when the backend is ready.
function EmploymentForm({ history, form, onFormChange, onAdd, onDelete }) {
  return (
    <div className="card">
      <h3>Employment History</h3>
      <ul className="profile__timeline">
        {history.map((job) => (
          <li key={job.id}>
            <div>
              <strong>{job.company}</strong>
              <span>{job.role}</span>
            </div>
            <button className="mini-btn" type="button" onClick={() => onDelete(job.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className="profile__subform">
        <label className="profile__field">
          <span>Company</span>
          <input value={form.company} onChange={(event) => onFormChange('company', event.target.value)} />
        </label>
        <label className="profile__field">
          <span>Role</span>
          <input value={form.role} onChange={(event) => onFormChange('role', event.target.value)} />
        </label>
        <button className="secondary-btn" type="button" onClick={onAdd}>Add employment</button>
      </div>
    </div>
  )
}

export default EmploymentForm