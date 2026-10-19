function DirectoryPage({ alumni, searchTerm, onSearchChange, programFilter, onProgramChange, yearFilter, onYearChange }) {
  return (
    <section className="directory">
      <div className="directory__header">
        <div>
          <p className="directory__eyebrow">Directory</p>
          <h1 className="directory__title">Alumni Directory</h1>
        </div>
        <button className="directory__primary-btn" type="button">Add alumni</button>
      </div>

      <div className="directory__toolbar">
        <input
          type="text"
          placeholder="Search alumni"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <select value={programFilter} onChange={(event) => onProgramChange(event.target.value)}>
          <option value="all">All programs</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Psychology">Psychology</option>
          <option value="Business Administration">Business Administration</option>
        </select>
        <select value={yearFilter} onChange={(event) => onYearChange(event.target.value)}>
          <option value="all">All years</option>
          <option value="2020">2020</option>
          <option value="2021">2021</option>
          <option value="2022">2022</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <div className="directory__grid">
        {alumni.map((person) => (
          <article className="directory__card" key={person.id}>
            <div className="directory__avatar">{person.name.charAt(0)}</div>
            <div>
              <h3>{person.name}</h3>
              <p>{person.program}</p>
              <p>Graduated {person.year}</p>
            </div>
            <div className="directory__meta-row">
              <span>{person.company}</span>
              <span className="directory__status-badge">{person.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DirectoryPage