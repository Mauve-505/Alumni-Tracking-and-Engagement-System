// Backend hook: this form should eventually save to the education table for the alumni profile.
// The current add/delete behavior is a mock UI state before the database connection is ready.
function EducationForm({ history, form, onFormChange, onAdd, onDelete }) {
  return (
    <div className="card">
      <h3>Education History</h3>
      <ul className="profile__timeline">
        {history.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.school}</strong>
              <span>{item.detail}</span>
            </div>
            <button className="mini-btn" type="button" onClick={() => onDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className="profile__subform">
        <label className="profile__field">
          <span>School</span>
          <input value={form.school} onChange={(event) => onFormChange('school', event.target.value)} />
        </label>
        <label className="profile__field">
          <span>Details</span>
          <input value={form.detail} onChange={(event) => onFormChange('detail', event.target.value)} />
        </label>
        <button className="secondary-btn" type="button" onClick={onAdd}>Add education</button>
      </div>
    </div>
  )
}

export default EducationForm