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
  graduation_year INTEGER,
  program VARCHAR(150),
  phone VARCHAR(30),
  address TEXT,
  bio TEXT,
  photo_url TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
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

CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  institution VARCHAR(150) NOT NULL,
  degree VARCHAR(150),
  year INTEGER
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'news' CHECK (type IN ('news', 'update')),
  published_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  event_date TIMESTAMP NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  response VARCHAR(10) NOT NULL CHECK (response IN ('going', 'maybe', 'declined')),
  UNIQUE (event_id, profile_id)
);
