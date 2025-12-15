ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';

UPDATE users SET role = 'user' WHERE role IS NULL;

CREATE INDEX idx_users_role ON users(role);

COMMENT ON COLUMN users.role IS 'User role: admin, moderator, user';