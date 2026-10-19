// App.jsx handles authentication/role routing and renders this page only when the logged-in user is admin.
// Backend connection: replace the mock stats/recentRegistrations with API data from the admin dashboard endpoint.
function AdminDashboardPage({ stats, recentRegistrations }) {
  return (
    // CSS hooks are in App.css; these class names help style the admin dashboard layout and cards.
    <section className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">Admin</p>
          <h1 className="admin-dashboard__title">Admin Dashboard</h1>
        </div>
      </div>

      <div className="admin-dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-dashboard__stat card">
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-dashboard__columns">
        <div className="card">
          <h3>Recent registrations</h3>
          <ul className="admin-dashboard__list">
            {recentRegistrations.map((entry) => (
              <li key={entry.id}>{entry.name} — {entry.program}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <ul className="admin-dashboard__list">
            <li>Review pending profiles</li>
            <li>Create event</li>
            <li>Publish newsletter</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboardPage