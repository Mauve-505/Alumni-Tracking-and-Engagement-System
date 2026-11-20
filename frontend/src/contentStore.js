/**
 * CONTENT & INTERACTION STORE (FRONTEND-ONLY)
 * ============================================================================
 * Centralized in-memory and local storage manager for News Posts, Events,
 * RSVPs, Attendee Rosters, and Alumni Census submissions.
 *
 * NOTE:
 * This file maintains frontend state without connecting to a PostgreSQL or
 * server backend. Browser localStorage is used to persist changes across page
 * navigation during testing.
 *
 * BACKEND CONNECTION POINT:
 * Groupmates: When implementing server-side features, replace these helper
 * functions with asynchronous fetch/axios calls to your corresponding backend
 * REST endpoints. Each function below includes documentation indicating the
 * intended backend route and HTTP verb.
 * ============================================================================
 */

import defaultSchoolImg from './assets/wmsu_school_picture.jpg';
import defaultBuildingImg from './assets/wmsu-building.png';
import defaultHeroImg from './assets/hero.png';

// Storage keys for frontend state persistence
const POSTS_KEY = 'wmsu_content_posts_v1';
const EVENTS_KEY = 'wmsu_content_events_v1';
const USER_RSVPS_KEY = 'wmsu_user_rsvps_v1';
const SURVEY_RESPONSES_KEY = 'wmsu_survey_submissions_v1';

// Initial demonstration posts
const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: 'WMSU Ranks Among Top State Universities in Mindanao for Licensure Performance',
    content:
      'Western Mindanao State University has once again demonstrated academic excellence with high passing percentages across the Board Licensure Examination for Professional Teachers, Nursing, and Criminology. The university administration congratulates our dedicated faculty, graduating batches, and college leadership for maintaining rigorous academic standards.',
    category: 'WMSU News',
    image: defaultSchoolImg,
    status: 'published',
    published_at: '2026-11-15T08:00:00Z',
    author: 'WMSU University Communications Office',
    author_email: 'ucomm@wmsu.edu.ph',
    type: 'news',
    featured: true,
  },
  {
    id: 'post-2',
    title: 'Annual Grand Alumni Homecoming 2026: General Assembly & Banquet Announced',
    content:
      'The WMSU Alumni Affairs Office cordially invites all alumni across generations to the 2026 Grand Alumni Homecoming. With this year’s theme "Crimson Legacy: Leading Innovations for Global Community", festivities will include college reunion luncheons, the Alumni Recognition Gala, and networking sessions.',
    category: 'University Updates',
    image: defaultBuildingImg,
    status: 'published',
    published_at: '2026-11-10T09:30:00Z',
    author: 'WMSU Alumni Affairs Office',
    author_email: 'alumni.affairs@wmsu.edu.ph',
    type: 'update',
    featured: false,
  },
  {
    id: 'post-3',
    title: 'College of Computing Studies Alumna Wins International Tech Innovation Award',
    content:
      'Engr. Jasmine Alvarez (BSCS Batch 2018) has been awarded the ASEAN Women in Tech Innovation Prize for her open-source disaster-response routing system. Dr. Ma. Lourdes Santos, Dean of the College of Computing Studies, commended Alvarez for exemplifying the Crimson spirit of service through technology.',
    category: 'Alumni Achievements',
    image: defaultHeroImg,
    status: 'published',
    published_at: '2026-11-05T14:15:00Z',
    author: 'CCS Alumni Chapter',
    author_email: 'ccs.alumni@wmsu.edu.ph',
    type: 'news',
    featured: false,
  },
  {
    id: 'post-4',
    title: 'Call for Nominations: Outstanding WMSU Alumni Awards 2026',
    content:
      'The search is on for outstanding graduates who have made exceptional contributions in public service, industry leadership, healthcare, science, and community development. Submission guidelines, nomination rubrics, and deadlines will be published upon final senate approval.',
    category: 'Announcements',
    image: defaultSchoolImg,
    status: 'draft',
    published_at: '2026-11-01T10:00:00Z',
    author: 'WMSU Alumni Relations Committee',
    author_email: 'alumni.relations@wmsu.edu.ph',
    type: 'update',
    featured: false,
  },
];

// Initial demonstration events
const INITIAL_EVENTS = [
  {
    id: 'event-1',
    title: 'WMSU Grand Alumni Homecoming 2026',
    description:
      'Reunite with fellow graduates, celebrate institutional milestones, and participate in the grand alumni parade, college assemblies, and the Crimson Dinner Gala.',
    image: defaultSchoolImg,
    category: 'Alumni Homecoming',
    location: 'WMSU Main Campus Gymnasium, Baliwasan, Zamboanga City',
    event_date: '2026-12-18',
    start_time: '08:00',
    end_time: '18:00',
    rsvp_deadline: '2026-12-12',
    status: 'published',
    rsvp_count: 48,
    organizer: 'WMSU Alumni Affairs Office',
    agenda: [
      '08:00 AM - Registration & Welcome Coffee',
      '09:30 AM - Grand Alumni Parade & Opening Ceremony',
      '12:00 PM - College Alumni Fellowship Luncheons',
      '03:00 PM - General Alumni Association Assembly',
      '06:30 PM - Crimson Banquet & Recognition Gala',
    ],
    attendees: [
      { id: 'att-1', name: 'Maria Elena Santos', email: 'm.santos@alumni.wmsu.edu.ph', course: 'BS Nursing', batch: '2016', status: 'going', registered_at: '2026-11-08' },
      { id: 'att-2', name: 'Juan Carlos Dela Cruz', email: 'jcdelacruz@alumni.wmsu.edu.ph', course: 'BS Computer Science', batch: '2020', status: 'going', registered_at: '2026-11-09' },
      { id: 'att-3', name: 'Dr. Fatima Hadjirul', email: 'f.hadjirul@alumni.wmsu.edu.ph', course: 'Doctor of Medicine', batch: '2014', status: 'going', registered_at: '2026-11-10' },
      { id: 'att-4', name: 'Engr. Reynaldo Tan', email: 'rey.tan@alumni.wmsu.edu.ph', course: 'BS Civil Engineering', batch: '2018', status: 'going', registered_at: '2026-11-12' },
      { id: 'att-5', name: 'Aileen Joy Mendoza', email: 'a.mendoza@alumni.wmsu.edu.ph', course: 'Bachelor of Elementary Education', batch: '2019', status: 'maybe', registered_at: '2026-11-14' },
    ],
  },
  {
    id: 'event-2',
    title: 'Crimson Tech & Career Expo 2026',
    description:
      'Connect with industry leaders, tech recruiters, and alumni entrepreneurs. Featuring on-site career interviews, portfolio reviews, and mentorship matching for upcoming and recent graduates.',
    image: defaultBuildingImg,
    category: 'Career Fair',
    location: 'Dr. Juanito Bruno Social Hall, WMSU Campus',
    event_date: '2026-11-28',
    start_time: '09:00',
    end_time: '16:00',
    rsvp_deadline: '2026-11-25',
    status: 'published',
    rsvp_count: 32,
    organizer: 'College of Computing Studies & Career Services',
    agenda: [
      '09:00 AM - Keynote Address: Tech Landscape in Western Mindanao',
      '10:30 AM - Alumni Tech Panel & Resume Clinics',
      '01:30 PM - Employer Booths & Speed Mentoring',
      '03:45 PM - Closing Remarks & Raffle Draw',
    ],
    attendees: [
      { id: 'att-6', name: 'Arman Guingona', email: 'arman.g@alumni.wmsu.edu.ph', course: 'BS Information Technology', batch: '2022', status: 'going', registered_at: '2026-11-11' },
      { id: 'att-7', name: 'Katherine Lee', email: 'k.lee@alumni.wmsu.edu.ph', course: 'BS Computer Engineering', batch: '2021', status: 'going', registered_at: '2026-11-13' },
    ],
  },
  {
    id: 'event-3',
    title: 'Global Crimson Alumni Leadership Webinar: Navigating AI and Industry 5.0',
    description:
      'An insightful online symposium bringing together overseas WMSU alumni executives to discuss emerging workforce transformations, generative AI applications, and ethical standards.',
    image: defaultHeroImg,
    category: 'Webinar',
    location: 'Online via Zoom Video & Official Facebook Live',
    event_date: '2026-12-05',
    start_time: '14:00',
    end_time: '17:00',
    rsvp_deadline: '2026-12-04',
    status: 'published',
    rsvp_count: 75,
    organizer: 'WMSU Alumni International Chapter',
    agenda: [
      '02:00 PM - Opening Remarks by University President',
      '02:20 PM - Keynote: AI Adoption Across Southeast Asia',
      '03:30 PM - Breakout Discussions by Industry',
      '04:30 PM - Open Q&A Session',
    ],
    attendees: [
      { id: 'att-8', name: 'Michael Angelo Rivera', email: 'm.rivera@alumni.wmsu.edu.ph', course: 'BS Information Systems', batch: '2017', status: 'going', registered_at: '2026-11-12' },
      { id: 'att-9', name: 'Soraya Abubakar', email: 's.abubakar@alumni.wmsu.edu.ph', course: 'BS Public Administration', batch: '2015', status: 'going', registered_at: '2026-11-14' },
    ],
  },
  {
    id: 'event-4',
    title: 'WMSU Alumni Sports Festival & Wellness Fun Run',
    description:
      'A community sports gathering promoting wellness, camaraderie, and student scholarship fundraising. Includes 3K/5K/10K run categories and alumni basketball/volleyball exhibition games.',
    image: defaultSchoolImg,
    category: 'Sports & Culture',
    location: 'WMSU Oval & Grandstand, Main Campus',
    event_date: '2027-01-20',
    start_time: '06:00',
    end_time: '12:00',
    rsvp_deadline: '2027-01-15',
    status: 'draft',
    rsvp_count: 0,
    organizer: 'CSSPE & Alumni Athletics Council',
    agenda: [],
    attendees: [],
  },
];

// Helper to safely read JSON from localStorage
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to safely write JSON to localStorage
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

// ============================================================================
// NEWS POSTS OPERATIONS
// ============================================================================

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Replace this with `GET /api/posts` (or `GET /api/posts?status=all`
 * for administrators) to retrieve news posts from the database.
 */
export function getStoredPosts() {
  return readStorage(POSTS_KEY, INITIAL_POSTS);
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Connect creating and updating news posts to:
 * - `POST /api/posts` (for new posts)
 * - `PATCH /api/posts/:id` (for existing post edits)
 * Include `title`, `content`, `category`, `image`, `status`, and `author_id`.
 */
export function saveStoredPost(postData) {
  const posts = getStoredPosts();
  let updatedPosts;

  if (postData.id) {
    // Update existing post
    updatedPosts = posts.map((p) =>
      p.id === postData.id
        ? {
            ...p,
            ...postData,
            updated_at: new Date().toISOString(),
          }
        : p
    );
  } else {
    // Create new post
    const newPost = {
      ...postData,
      id: `post-${Date.now()}`,
      published_at: new Date().toISOString(),
      status: postData.status || 'published',
      featured: Boolean(postData.featured),
    };
    updatedPosts = [newPost, ...posts];
  }

  writeStorage(POSTS_KEY, updatedPosts);
  return updatedPosts;
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Replace this with `DELETE /api/posts/:id?requester_id=...`
 * to remove a post record permanently from PostgreSQL.
 */
export function deleteStoredPost(postId) {
  const posts = getStoredPosts();
  const updatedPosts = posts.filter((p) => p.id !== postId);
  writeStorage(POSTS_KEY, updatedPosts);
  return updatedPosts;
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Connect publication status toggle to `PATCH /api/posts/:id`
 * with `{ status: "published" | "draft" }`.
 */
export function toggleStoredPostStatus(postId) {
  const posts = getStoredPosts();
  const updatedPosts = posts.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        status: p.status === 'published' ? 'draft' : 'published',
      };
    }
    return p;
  });
  writeStorage(POSTS_KEY, updatedPosts);
  return updatedPosts;
}

// ============================================================================
// EVENTS & RSVP OPERATIONS
// ============================================================================

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Replace this with `GET /api/events` (or `GET /api/events?include_drafts=true`
 * for administrators) to retrieve scheduled events and current RSVP counts.
 */
export function getStoredEvents() {
  return readStorage(EVENTS_KEY, INITIAL_EVENTS);
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Connect creating and updating events to:
 * - `POST /api/events` (for scheduling new events)
 * - `PATCH /api/events/:id` (for updating event details)
 * Include `title`, `description`, `image`, `category`, `location`,
 * `event_date`, `start_time`, `end_time`, `rsvp_deadline`, and `status`.
 */
export function saveStoredEvent(eventData) {
  const events = getStoredEvents();
  let updatedEvents;

  if (eventData.id) {
    // Update existing event
    updatedEvents = events.map((e) =>
      e.id === eventData.id
        ? {
            ...e,
            ...eventData,
            updated_at: new Date().toISOString(),
          }
        : e
    );
  } else {
    // Create new event
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      status: eventData.status || 'published',
      rsvp_count: 0,
      attendees: [],
      agenda: eventData.agenda || [],
      organizer: eventData.organizer || 'WMSU Alumni Affairs',
    };
    updatedEvents = [newEvent, ...events];
  }

  writeStorage(EVENTS_KEY, updatedEvents);
  return updatedEvents;
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Replace this with `DELETE /api/events/:id?requester_id=...`
 * to cancel/remove an event from PostgreSQL.
 */
export function deleteStoredEvent(eventId) {
  const events = getStoredEvents();
  const updatedEvents = events.filter((e) => e.id !== eventId);
  writeStorage(EVENTS_KEY, updatedEvents);
  return updatedEvents;
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Connect publication status toggle to `PATCH /api/events/:id`
 * with `{ status: "published" | "draft" }`.
 */
export function toggleStoredEventStatus(eventId) {
  const events = getStoredEvents();
  const updatedEvents = events.map((e) => {
    if (e.id === eventId) {
      return {
        ...e,
        status: e.status === 'published' ? 'draft' : 'published',
      };
    }
    return e;
  });
  writeStorage(EVENTS_KEY, updatedEvents);
  return updatedEvents;
}

/**
 * Get the current user's session RSVPs map
 */
export function getUserRsvps() {
  return readStorage(USER_RSVPS_KEY, {});
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Connect RSVP submission and attendee count updates to:
 * - `POST /api/events/:eventId/rsvp` with `{ requester_id, response: "going" | "maybe" | "declined" }`
 * The backend should insert/update the RSVP row and recalculate the event's attendee count.
 *
 * FRONTEND-ONLY INTERACTIVE BEHAVIOR:
 * - Updates attendee count immediately in state without page refresh.
 * - Prevents multiple clicks by the same user from inflating the count.
 * - Updates attendee list roster for admin viewing.
 */
export function recordEventRsvp(eventId, user, response = 'going') {
  const userRsvps = getUserRsvps();
  const previousResponse = userRsvps[eventId];
  const events = getStoredEvents();

  // If already responded with the exact same response, return unchanged
  if (previousResponse === response) {
    return { events, currentResponse: response };
  }

  const updatedEvents = events.map((ev) => {
    if (ev.id !== eventId) return ev;

    let newCount = ev.rsvp_count || 0;
    const attendees = Array.isArray(ev.attendees) ? [...ev.attendees] : [];
    const userIdentifier = user?.email || user?.id || 'demo_alumni_user';
    const attendeeName =
      user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : user?.name || 'Verified Alumni Attendee';

    // Check if user was already in the attendees list
    const existingIndex = attendees.findIndex(
      (a) => a.email === userIdentifier || a.id === userIdentifier
    );

    if (response === 'going') {
      // If switching from non-going to going, increment count
      if (previousResponse !== 'going') {
        newCount += 1;
      }
      const attendeeRecord = {
        id: `att-${Date.now()}`,
        name: attendeeName,
        email: user?.email || 'alumni.session@wmsu.edu.ph',
        course: user?.course || user?.degree || 'WMSU Alumni',
        batch: user?.graduation_year || user?.gradYear || 'Recent Batch',
        status: 'going',
        registered_at: new Date().toISOString().split('T')[0],
      };
      if (existingIndex >= 0) {
        attendees[existingIndex] = attendeeRecord;
      } else {
        attendees.push(attendeeRecord);
      }
    } else if (response === 'maybe') {
      // If switching from going to maybe, decrement count
      if (previousResponse === 'going' && newCount > 0) {
        newCount -= 1;
      }
      const attendeeRecord = {
        id: `att-${Date.now()}`,
        name: attendeeName,
        email: user?.email || 'alumni.session@wmsu.edu.ph',
        course: user?.course || user?.degree || 'WMSU Alumni',
        batch: user?.graduation_year || user?.gradYear || 'Recent Batch',
        status: 'maybe',
        registered_at: new Date().toISOString().split('T')[0],
      };
      if (existingIndex >= 0) {
        attendees[existingIndex] = attendeeRecord;
      } else {
        attendees.push(attendeeRecord);
      }
    } else {
      // Declined / cancel RSVP
      if (previousResponse === 'going' && newCount > 0) {
        newCount -= 1;
      }
      if (existingIndex >= 0) {
        attendees.splice(existingIndex, 1);
      }
    }

    return {
      ...ev,
      rsvp_count: Math.max(0, newCount),
      attendees,
    };
  });

  // Record user's session RSVP
  userRsvps[eventId] = response;
  writeStorage(USER_RSVPS_KEY, userRsvps);
  writeStorage(EVENTS_KEY, updatedEvents);

  return { events: updatedEvents, currentResponse: response };
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Connect RSVP cancellation to `DELETE /api/events/:eventId/rsvp`
 * or `POST /api/events/:eventId/rsvp` with `{ response: "declined" }`.
 *
 * FRONTEND-ONLY BEHAVIOR:
 * Decrements attendee count immediately if user was marked 'going' and clears response.
 */
export function cancelEventRsvp(eventId) {
  const userRsvps = getUserRsvps();
  const previousResponse = userRsvps[eventId];
  const events = getStoredEvents();

  if (!previousResponse) {
    return { events, currentResponse: null };
  }

  const updatedEvents = events.map((ev) => {
    if (ev.id !== eventId) return ev;
    const newCount = previousResponse === 'going' ? Math.max(0, (ev.rsvp_count || 1) - 1) : ev.rsvp_count;
    const attendees = (ev.attendees || []).filter((a) => !a.email.includes('session'));
    return {
      ...ev,
      rsvp_count: newCount,
      attendees,
    };
  });

  delete userRsvps[eventId];
  writeStorage(USER_RSVPS_KEY, userRsvps);
  writeStorage(EVENTS_KEY, updatedEvents);

  return { events: updatedEvents, currentResponse: null };
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Replace this with `GET /api/admin/events/:eventId/attendees`
 * or `GET /api/admin/rsvps?event_id=...` to query attendees from the database.
 */
export function getEventAttendees(eventId) {
  const events = getStoredEvents();
  const event = events.find((e) => e.id === eventId);
  return event?.attendees || [];
}

// ============================================================================
// ALUMNI SURVEY & CENSUS OPERATIONS
// ============================================================================

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Connect survey responses to `POST /api/alumni/survey-census`
 * or update the alumni profile directly with `PUT /api/alumni/:profileId`.
 * Fields submitted should include:
 * - full_name, email, phone
 * - degree_course, college_department, graduation_year
 * - employment_status, occupation, company, location
 */
export function submitSurveyCensus(surveyData) {
  const existingSubmissions = readStorage(SURVEY_RESPONSES_KEY, []);
  const newSubmission = {
    ...surveyData,
    id: `survey-${Date.now()}`,
    submitted_at: new Date().toISOString(),
  };
  const updatedSubmissions = [newSubmission, ...existingSubmissions];
  writeStorage(SURVEY_RESPONSES_KEY, updatedSubmissions);
  return newSubmission;
}

/**
 * BACKEND CONNECTION POINT:
 * Groupmates: Retrieve survey census responses using `GET /api/admin/surveys`
 * for alumni tracking analytics and accreditation reports.
 */
export function getStoredSurveyResponses() {
  return readStorage(SURVEY_RESPONSES_KEY, []);
}
