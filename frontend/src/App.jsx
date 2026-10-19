import { useEffect, useState } from 'react'
import './App.css'
import AdminDashboardPage from './admin/admindashboard.jsx'
import VerificationPage from './admin/verification.jsx'
import AlumniProfilePage from './pages/AlumniProfilePage.jsx'
import DirectoryPage from './pages/DirectoryPage.jsx'

const alumniSeed = [
  {
    id: 1,
    name: 'John Stanley B. Reyes',
    program: 'Computer Science',
    year: 2020,
    company: 'Tonitrua Studio',
    role: 'Game Developer',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Lebron D. James',
    program: 'Computer Science',
    year: 2020,
    company: 'National Basketball Association',
    role: 'Power Forward(PF)',
    status: 'Verified',
  },
  {
    id: 3,
    name: 'Alqahhar A. Munjilul',
    program: 'Computer Science',
    year: 2020,
    company: 'No current job',
    role: 'Graduate',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'DJ',
    program: 'Computer Science',
    year: 2020,
    company: 'Mental Health Clinic',
    role: 'Patient',
    status: 'Verified',
  },
  {
    id: 5,
    name: 'Pedro Manalo',
    program: 'Business Administration',
    year: 2021,
    company: 'Southeast Trading',
    role: 'Operations Manager',
    status: 'Pending',
  },
]

const pendingReviewSeed = [
  {
    id: 101,
    name: 'Januar Staney Reyes',
    program: 'Computer Science',
    year: 2025,
    note: 'Waiting for employment update',
  },
  {
    id: 102,
    name: 'Lebron James',
    program: 'Computer Science',
    year: 2025,
    note: 'Education record needs review',
  },
  {
    id: 103,
    name: 'Maria Solis',
    program: 'Psychology',
    year: 2024,
    note: 'Profile verification pending',
  },
]

const initialProfile = {
  name: 'Homo Sapien',
  program: 'Computer Science',
  year: 2020,
  email: 'HomoSapien@email.com',
  phone: '+63 912 345 6789',
  location: 'Zamboanga City',
  about:
    'Computer science graduate focused on product engineering and mentoring students through internship opportunities.',
}

const initialEmployment = [
  { id: 1, company: 'Google', role: 'Software Engineer' },
  { id: 2, company: 'WMSU Research Lab', role: 'Student Developer' },
]

const initialEducation = [
  { id: 1, school: 'Western Mindanao State University', detail: 'B.S. Computer Science' },
  { id: 2, school: 'STEM Senior High School', detail: 'General Academic Strand' },
]

function readCurrentUser() {
  try {
    // Backend contract: login returns { id, email, role }
    // Example: sessionStorage.setItem('user', JSON.stringify({ id: 1, email: 'admin@example.com', role: 'admin' }))
    const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null')
    const user = storedUser?.data ?? storedUser
    return user?.role === 'admin' || user?.role === 'alumni' ? user : null
  } catch {
    return null
  }
}

function App() {
  // Frontend rule: only role === 'admin' should show admin pages.
  // The backend must also enforce this, because frontend checks alone are not secure.
  const [currentUser, setCurrentUser] = useState(readCurrentUser)
  const role = currentUser?.role === 'admin' ? 'admin' : 'alumni'
  const [activePage, setActivePage] = useState(role === 'admin' ? 'Admin Dashboard' : 'Directory')
  const [alumni, setAlumni] = useState(alumniSeed)
  const [searchTerm, setSearchTerm] = useState('')
  const [programFilter, setProgramFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [verificationList, setVerificationList] = useState(pendingReviewSeed)
  const [profile, setProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [employmentHistory, setEmploymentHistory] = useState(initialEmployment)
  const [educationHistory, setEducationHistory] = useState(initialEducation)
  const [jobForm, setJobForm] = useState({ company: '', role: '' })
  const [educationForm, setEducationForm] = useState({ school: '', detail: '' })

  useEffect(() => {
    const syncCurrentUser = () => {
      const nextUser = readCurrentUser()
      setCurrentUser(nextUser)
      setActivePage(nextUser?.role === 'admin' ? 'Admin Dashboard' : 'Directory')
    }

    window.addEventListener('auth:changed', syncCurrentUser)
    window.addEventListener('storage', syncCurrentUser)

    return () => {
      window.removeEventListener('auth:changed', syncCurrentUser)
      window.removeEventListener('storage', syncCurrentUser)
    }
  }, [])

  const filteredAlumni = alumni.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProgram = programFilter === 'all' || person.program === programFilter
    const matchesYear = yearFilter === 'all' || String(person.year) === yearFilter
    return matchesSearch && matchesProgram && matchesYear
  })

  const stats = [
    { label: 'Total Alumni', value: String(alumni.length) },
    { label: 'Verified', value: String(alumni.filter((person) => person.status === 'Verified').length) },
    { label: 'Pending', value: String(alumni.filter((person) => person.status === 'Pending').length) },
    { label: 'Awaiting review', value: String(verificationList.length) },
  ]

  const recentRegistrations = [
    { id: 1, name: 'Rina Santos', program: 'Psychology' },
    { id: 2, name: 'Pedro Manalo', program: 'Education' },
    { id: 3, name: 'Shaira Lim', program: 'IT' },
  ]

  const handleProfileChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const handleSaveProfile = () => {
    setIsEditing(false)
  }

  const handleAddJob = () => {
    if (!jobForm.company || !jobForm.role) return

    setEmploymentHistory((current) => [
      ...current,
      { id: Date.now(), company: jobForm.company, role: jobForm.role },
    ])
    setJobForm({ company: '', role: '' })
  }

  const handleDeleteJob = (id) => {
    setEmploymentHistory((current) => current.filter((job) => job.id !== id))
  }

  const handleAddEducation = () => {
    if (!educationForm.school || !educationForm.detail) return

    setEducationHistory((current) => [
      ...current,
      { id: Date.now(), school: educationForm.school, detail: educationForm.detail },
    ])
    setEducationForm({ school: '', detail: '' })
  }

  const handleDeleteEducation = (id) => {
    setEducationHistory((current) => current.filter((item) => item.id !== id))
  }

  const handleApprove = (id) => {
    setVerificationList((current) => current.filter((entry) => entry.id !== id))
    setAlumni((current) => current.map((person) => (person.name === 'Homo Sapien' ? { ...person, status: 'Verified' } : person)))
  }

  const handleReject = (id) => {
    setVerificationList((current) => current.filter((entry) => entry.id !== id))
  }

  const pages = {
    Directory: (
      <DirectoryPage
        alumni={filteredAlumni}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        programFilter={programFilter}
        onProgramChange={setProgramFilter}
        yearFilter={yearFilter}
        onYearChange={setYearFilter}
      />
    ),
    'Alumni Profile': (
      <AlumniProfilePage
        profile={profile}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((current) => !current)}
        onProfileChange={handleProfileChange}
        onSaveProfile={handleSaveProfile}
        employmentHistory={employmentHistory}
        jobForm={jobForm}
        onJobFormChange={(field, value) => setJobForm((current) => ({ ...current, [field]: value }))}
        onAddJob={handleAddJob}
        onDeleteJob={handleDeleteJob}
        educationHistory={educationHistory}
        educationForm={educationForm}
        onEducationFormChange={(field, value) => setEducationForm((current) => ({ ...current, [field]: value }))}
        onAddEducation={handleAddEducation}
        onDeleteEducation={handleDeleteEducation}
      />
    ),
    'Admin Dashboard': <AdminDashboardPage stats={stats} recentRegistrations={recentRegistrations} />,
    Verification: (
      <VerificationPage verificationList={verificationList} onApprove={handleApprove} onReject={handleReject} />
    ),
  }

  const rolePages = role === 'admin'
    ? ['Admin Dashboard', 'Verification']
    : ['Directory', 'Alumni Profile']

  return (
    <div className="frontend">
      <header className="topbar">
        <div className="topbar__brand-column">
          <h1 className="topbar__brand-kicker">WMSU</h1>
          <h2 className="topbar__title">Alumni Tracker</h2>
        </div>

        <div className="topbar__navigation-group">
          <nav className="topbar__nav" aria-label={`${role} pages`}>
            {rolePages.map((page) => (
              <button
                key={page}
                type="button"
                className={activePage === page ? 'topbar__nav-btn topbar__nav-btn--active' : 'topbar__nav-btn'}
                onClick={() => setActivePage(page)}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="frontend__main-content">{pages[rolePages.includes(activePage) ? activePage : rolePages[0]]}</main>
    </div>
  )
}

export default App
