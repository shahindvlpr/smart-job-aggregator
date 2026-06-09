CREATE DATABASE IF NOT EXISTS smart_job_aggregator;
USE smart_job_aggregator;

CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user', 'admin') DEFAULT 'user',
  resume_text TEXT,
  skills      JSON,
  location    VARCHAR(100),
  notify_email BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  external_id  VARCHAR(255) UNIQUE,
  source       ENUM('adzuna', 'jsearch') NOT NULL,
  title        VARCHAR(255) NOT NULL,
  company      VARCHAR(255),
  location     VARCHAR(255),
  description  TEXT,
  salary_min   DECIMAL(10,2),
  salary_max   DECIMAL(10,2),
  job_type     VARCHAR(50),
  category     VARCHAR(100),
  url          VARCHAR(500),
  posted_at    TIMESTAMP,
  fetched_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_location (location),
  INDEX idx_category (category)
);

CREATE TABLE saved_jobs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  job_id     INT NOT NULL,
  saved_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE,
  UNIQUE KEY unique_save (user_id, job_id)
);

CREATE TABLE job_matches (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  job_id       INT NOT NULL,
  match_score  DECIMAL(5,2),
  match_reason TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE,
  UNIQUE KEY unique_match (user_id, job_id)
);

CREATE TABLE notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  job_id     INT,
  type       ENUM('new_jobs', 'match_alert', 'saved_reminder') NOT NULL,
  sent_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES (
  'Admin',
  'admin@smartjobs.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
);