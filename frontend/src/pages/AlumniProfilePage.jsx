import EducationForm from '../components/educationform.jsx'
import EmploymentForm from '../components/employmentform.jsx'

function AlumniProfilePage({
  profile,
  isEditing,
  onToggleEdit,
  onProfileChange,
  onSaveProfile,
  employmentHistory,
  jobForm,
  onJobFormChange,
  onAddJob,
  onDeleteJob,
  educationHistory,
  educationForm,
  onEducationFormChange,
  onAddEducation,
  onDeleteEducation,
}) {
  return (
    <section className="profile">
      <div className="profile__header">
        <div>
          <p className="profile__eyebrow">Profile</p>
          <h1 className="profile__title">Alumni Profile</h1>
        </div>
        <button className="profile__primary-btn" type="button" onClick={isEditing ? onSaveProfile : onToggleEdit}>
          {isEditing ? 'Save profile' : 'Edit profile'}
        </button>
      </div>

      <div className="profile__layout">
        <div className="profile__summary card">
          <div className="profile__avatar large">{profile.name.charAt(0)}</div>
          <h2>{profile.name}</h2>
          <p>{profile.program} • {profile.year}</p>
          <span className="profile__status-badge">Verified</span>
        </div>

        <div className="profile__details card">
          {isEditing ? (
            <div className="profile__form-grid">
              <label className="profile__field">
                <span>Full name</span>
                <input value={profile.name} onChange={(event) => onProfileChange('name', event.target.value)} />
              </label>
              <label className="profile__field">
                <span>Program</span>
                <input value={profile.program} onChange={(event) => onProfileChange('program', event.target.value)} />
              </label>
              <label className="profile__field">
                <span>Graduation year</span>
                <input value={profile.year} onChange={(event) => onProfileChange('year', event.target.value)} />
              </label>
              <label className="profile__field">
                <span>Email</span>
                <input value={profile.email} onChange={(event) => onProfileChange('email', event.target.value)} />
              </label>
              <label className="profile__field">
                <span>Phone</span>
                <input value={profile.phone} onChange={(event) => onProfileChange('phone', event.target.value)} />
              </label>
              <label className="profile__field">
                <span>Location</span>
                <input value={profile.location} onChange={(event) => onProfileChange('location', event.target.value)} />
              </label>
              <label className="profile__field profile__field--full">
                <span>About</span>
                <textarea value={profile.about} onChange={(event) => onProfileChange('about', event.target.value)} rows="4" />
              </label>
            </div>
          ) : (
            <>
              <h3>About</h3>
              <p>{profile.about}</p>
              <h3>Contact</h3>
              <ul>
                <li>Email: {profile.email}</li>
                <li>Phone: {profile.phone}</li>
                <li>Location: {profile.location}</li>
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="profile__columns">
        <EmploymentForm
          history={employmentHistory}
          form={jobForm}
          onFormChange={onJobFormChange}
          onAdd={onAddJob}
          onDelete={onDeleteJob}
        />
        <EducationForm
          history={educationHistory}
          form={educationForm}
          onFormChange={onEducationFormChange}
          onAdd={onAddEducation}
          onDelete={onDeleteEducation}
        />
      </div>
    </section>
  )
}

export default AlumniProfilePage