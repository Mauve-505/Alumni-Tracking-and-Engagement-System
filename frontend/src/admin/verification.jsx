// Backend hook: this page should receive pending alumni submissions from the admin verification API.
// Approve/Reject buttons should call backend endpoints to update alumni status and remove the request from the queue.
// Role gate: only a logged-in user with role === 'admin' should be allowed to access this page.
// In the real app, the frontend should check sessionStorage / auth state before rendering this screen.
function VerificationPage({ verificationList, onApprove, onReject }) {
  return (
    <section className="verification">
      <div className="verification__header">
        <div>
          <p className="verification__eyebrow">Verification</p>
          <h1 className="verification__title">Admin Verification</h1>
        </div>
      </div>

      <div className="verification__list">
        {verificationList.map((entry) => (
          <div className="verification__card card" key={entry.id}>
            <div>
              <h3>{entry.name}</h3>
              <p>{entry.program} • {entry.year}</p>
              <small>{entry.note}</small>
            </div>
            <div className="verification__actions">
              <button className="verification__approve-btn" type="button" onClick={() => onApprove(entry.id)}>Approve</button>
              <button className="verification__reject-btn" type="button" onClick={() => onReject(entry.id)}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default VerificationPage