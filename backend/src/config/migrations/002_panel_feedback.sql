-- ============================================================
-- Migration 002: panel feedback (safe to run more than once)
-- Brings an EXISTING database up to the current schema.sql.
-- ============================================================

ALTER TABLE alumni_profiles
  ADD COLUMN IF NOT EXISTS college VARCHAR(150),
  ADD COLUMN IF NOT EXISTS certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

ALTER TABLE alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_status_check;
ALTER TABLE alumni_profiles
  ADD CONSTRAINT alumni_profiles_status_check CHECK (status IN ('pending', 'verified', 'rejected'));

ALTER TABLE alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_employment_status_check;
ALTER TABLE alumni_profiles
  ADD CONSTRAINT alumni_profiles_employment_status_check
  CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'further_study'));

CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) UNIQUE NOT NULL,
  country VARCHAR(80) NOT NULL DEFAULT 'Philippines',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE education
  ADD COLUMN IF NOT EXISTS institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS level VARCHAR(20);

ALTER TABLE education DROP CONSTRAINT IF EXISTS education_level_check;
ALTER TABLE education
  ADD CONSTRAINT education_level_check
  CHECK (level IN ('certificate', 'diploma', 'bachelors', 'masters', 'doctorate', 'short_course'));

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(10) NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts
  ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'scheduled', 'published'));

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS target_college VARCHAR(150),
  ADD COLUMN IF NOT EXISTS target_batch INTEGER;

ALTER TABLE event_rsvps
  ADD COLUMN IF NOT EXISTS attended BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  achievement_date DATE,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  opens_at TIMESTAMP,
  closes_at TIMESTAMP,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_questions (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL
    CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'rating')),
  options JSONB,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (survey_id, profile_id)
);

CREATE TABLE IF NOT EXISTS survey_answers (
  id SERIAL PRIMARY KEY,
  response_id INTEGER NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  UNIQUE (response_id, question_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  target_type VARCHAR(40),
  target_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON alumni_profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON alumni_profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_year ON alumni_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_employment_profile ON employment_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_profile ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_achievements_featured ON achievements(is_featured);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

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