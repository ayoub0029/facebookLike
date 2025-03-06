-- Create new table with image column
CREATE TABLE comments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    comment_text TEXT,
    image TEXT,                          -- New column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Copy data from old table to new table
INSERT INTO comments_new (id, user_id, post_id, comment_text, created_at)
SELECT id, user_id, post_id, comment_text, created_at FROM comments;

-- Drop old table
DROP TABLE comments;

-- Rename new table to original name
ALTER TABLE comments_new RENAME TO comments;
