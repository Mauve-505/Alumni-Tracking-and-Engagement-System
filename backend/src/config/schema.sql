-- ============================================================
-- Alumni Tracking and Engagement System - full schema
-- For a NEW database. Existing databases: run `npm run db:migrate`.
-- ============================================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'alumni' CHECK (role IN ('alumni', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alumni_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  college VARCHAR(150),
  graduation_year INTEGER,
  program VARCHAR(150),
  phone VARCHAR(30),
  address TEXT,
  bio TEXT,
  photo_url TEXT,
  certificate_url TEXT,
  employment_status VARCHAR(20)
    CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'further_study')),
  status VARCHAR(10) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employment_history (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  company VARCHAR(150) NOT NULL,
  position VARCHAR(150) NOT NULL,
  industry VARCHAR(100),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE
);

-- Dropdown source for the "further education" institution field
CREATE TABLE institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) UNIQUE NOT NULL,
  country VARCHAR(80) NOT NULL DEFAULT 'Philippines',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
  institution VARCHAR(150) NOT NULL,   -- name shown; typed in when "Other" is chosen
  level VARCHAR(20)
    CHECK (level IN ('certificate', 'diploma', 'bachelors', 'masters', 'doctorate', 'short_course')),
  degree VARCHAR(150),
  year INTEGER
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'news' CHECK (type IN ('news', 'update')),
  category VARCHAR(50),
  image_url TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_at TIMESTAMP,              -- visible to alumni once this time has passed
  published_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  event_date TIMESTAMP NOT NULL,
  image_url TEXT,
  target_college VARCHAR(150),         -- optional invitation filters (NULL = everyone)
  target_batch INTEGER,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  response VARCHAR(10) NOT NULL CHECK (response IN ('going', 'maybe', 'declined')),
  attended BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (event_id, profile_id)
);

-- Alumni achievements (shown in the "Alumni Spotlight" when featured)
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  achievement_date DATE,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Surveys and census
CREATE TABLE surveys (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  opens_at TIMESTAMP,
  closes_at TIMESTAMP,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE survey_questions (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL
    CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'rating')),
  options JSONB,                       -- list of choices for choice questions
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE survey_responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (survey_id, profile_id)       -- one response per alumni
);

CREATE TABLE survey_answers (
  id SERIAL PRIMARY KEY,
  response_id INTEGER NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  UNIQUE (response_id, question_id)
);

-- Who did what (verifications, edits, deletions)
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  target_type VARCHAR(40),
  target_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for the searches and lists the app runs most
CREATE INDEX idx_profiles_status ON alumni_profiles(status);
CREATE INDEX idx_profiles_college ON alumni_profiles(college);
CREATE INDEX idx_profiles_year ON alumni_profiles(graduation_year);
CREATE INDEX idx_employment_profile ON employment_history(profile_id);
CREATE INDEX idx_education_profile ON education(profile_id);
CREATE INDEX idx_posts_status ON posts(status, scheduled_at);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_achievements_featured ON achievements(is_featured);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- Starting list for the university dropdown (admins can add more)
INSERT INTO institutions (name) VALUES
  ('Western Mindanao State University'),
  ('Ateneo de Zamboanga University'),
  ('Universidad de Zamboanga'),
  ('Pilar College of Zamboanga City'),
  ('Southern City Colleges'),
  ('Jose Rizal Memorial State University'),
  ('Zamboanga State College of Marine Sciences and Technology'),
  ('Mindanao State University - Marawi'),
  ('Mindanao State University - Iligan Institute of Technology'),
  ('Mindanao State University - General Santos'),
  ('University of the Philippines Diliman'),
  ('University of the Philippines Los Banos'),
  ('University of the Philippines Manila'),
  ('University of the Philippines Mindanao'),
  ('University of the Philippines Visayas'),
  ('University of the Philippines Cebu'),
  ('Ateneo de Manila University'),
  ('De La Salle University'),
  ('University of Santo Tomas'),
  ('Polytechnic University of the Philippines'),
  ('Mapua University'),
  ('Far Eastern University'),
  ('Adamson University'),
  ('Technological University of the Philippines'),
  ('Philippine Normal University'),
  ('Asian Institute of Management'),
  ('Silliman University'),
  ('Xavier University - Ateneo de Cagayan'),
  ('University of San Carlos'),
  ('University of San Jose - Recoletos'),
  ('Cebu Normal University'),
  ('Cebu Technological University'),
  ('University of San Agustin'),
  ('West Visayas State University'),
  ('Central Philippine University'),
  ('Ateneo de Davao University'),
  ('University of Mindanao'),
  ('University of Southeastern Philippines'),
  ('Central Mindanao University'),
  ('Notre Dame University'),
  ('Bicol University'),
  ('Ateneo de Naga University'),
  ('Mariano Marcos State University'),
  ('Benguet State University'),
  ('University of Santo Tomas - Graduate School'),
  ('National University Philippines'),
  ('National University of Singapore'),
  ('Nanyang Technological University'),
  ('University of Malaya'),
  ('Chulalongkorn University'),
  ('University of Tokyo'),
  ('University of Melbourne'),
  ('University of Sydney'),
  ('Harvard University')
ON CONFLICT (name) DO NOTHING;