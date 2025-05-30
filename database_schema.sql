
-- SQL Schema for Climbing Tracker Database
-- PostgreSQL compatible schema with all tables, indexes, and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE climb_type AS ENUM ('boulder', 'sport', 'trad', 'top_rope');
CREATE TYPE location_type AS ENUM ('indoor', 'outdoor');
CREATE TYPE grade_system AS ENUM ('v_scale', 'yds', 'font');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    bio TEXT,
    location VARCHAR(100),
    home_latitude DECIMAL(10, 8),
    home_longitude DECIMAL(11, 8),
    preferred_grade_system grade_system DEFAULT 'v_scale',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (gyms and outdoor spots)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    location_type location_type NOT NULL,
    address VARCHAR(300),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    website VARCHAR(200),
    phone VARCHAR(20),
    
    -- Gym-specific fields
    day_pass_price DECIMAL(8, 2),
    monthly_price DECIMAL(8, 2),
    
    -- Outdoor-specific fields
    approach_time INTEGER, -- minutes
    difficulty_range VARCHAR(50), -- e.g., "V0-V8"
    rock_type VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Climbing sessions table
CREATE TABLE climbing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    conditions VARCHAR(100),
    
    -- Session metrics (calculated from climbs)
    total_climbs INTEGER DEFAULT 0,
    sends INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_grade VARCHAR(10),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual climbs table
CREATE TABLE climbs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES climbing_sessions(id) ON DELETE CASCADE,
    
    climb_type climb_type NOT NULL,
    grade VARCHAR(10) NOT NULL,
    grade_system grade_system NOT NULL,
    
    -- Route/problem details
    route_name VARCHAR(200),
    route_setter VARCHAR(100),
    color VARCHAR(50),
    
    -- Performance tracking
    sent BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 1,
    flash BOOLEAN DEFAULT FALSE, -- sent on first try
    onsight BOOLEAN DEFAULT FALSE, -- sent first try without beta
    
    -- Additional details
    style_notes TEXT,
    beta TEXT, -- sequence description
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friendships table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure users can't befriend themselves
    CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id),
    -- Ensure unique friendship pairs (regardless of direction)
    CONSTRAINT unique_friendship UNIQUE (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))
);

-- Session comments table
CREATE TABLE session_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES climbing_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session likes table
CREATE TABLE session_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES climbing_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure users can only like a session once
    UNIQUE(session_id, user_id)
);

-- Indexes for performance optimization

-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(home_latitude, home_longitude);

-- Location indexes
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_name ON locations(name);

-- Session indexes
CREATE INDEX idx_sessions_user_date ON climbing_sessions(user_id, date DESC);
CREATE INDEX idx_sessions_location ON climbing_sessions(location_id);
CREATE INDEX idx_sessions_date ON climbing_sessions(date DESC);

-- Climb indexes
CREATE INDEX idx_climbs_session ON climbs(session_id);
CREATE INDEX idx_climbs_grade ON climbs(grade, sent);
CREATE INDEX idx_climbs_type ON climbs(climb_type);

-- Friendship indexes
CREATE INDEX idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id, status);

-- Comment indexes
CREATE INDEX idx_comments_session ON session_comments(session_id, created_at DESC);
CREATE INDEX idx_comments_user ON session_comments(user_id);

-- Like indexes
CREATE INDEX idx_likes_session ON session_likes(session_id);
CREATE INDEX idx_likes_user ON session_likes(user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON climbing_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON session_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion (optional for testing)
-- Note: Replace with actual data or remove for production

-- Insert sample users
INSERT INTO users (username, email, first_name, last_name, bio, home_latitude, home_longitude) VALUES
('climber_alex', 'alex@example.com', 'Alex', 'Johnson', 'Boulder enthusiast from Colorado', 39.7392, -104.9903),
('route_sarah', 'sarah@example.com', 'Sarah', 'Chen', 'Sport climber and route developer', 37.7749, -122.4194);

-- Insert sample locations
INSERT INTO locations (name, location_type, latitude, longitude, address, day_pass_price, description) VALUES
('Boulder Rock Club', 'indoor', 40.0150, -105.2705, '2829 Mapleton Ave, Boulder, CO 80301', 25.00, 'Premier bouldering gym in Boulder with extensive route setting'),
('Flatirons', 'outdoor', 39.9990, -105.2927, 'Boulder, CO', NULL, 'Classic sandstone bouldering with stunning views');

-- Insert sample climbing sessions
INSERT INTO climbing_sessions (user_id, location_id, date, duration_minutes, notes, energy_level) VALUES
((SELECT id FROM users WHERE username = 'climber_alex'), 
 (SELECT id FROM locations WHERE name = 'Boulder Rock Club'), 
 NOW() - INTERVAL '1 day', 120, 'Great session, felt strong on overhangs', 8);

-- Insert sample climbs
INSERT INTO climbs (session_id, climb_type, grade, grade_system, sent, attempts, flash) VALUES
((SELECT id FROM climbing_sessions LIMIT 1), 'boulder', 'V4', 'v_scale', true, 3, false),
((SELECT id FROM climbing_sessions LIMIT 1), 'boulder', 'V6', 'v_scale', false, 5, false);
