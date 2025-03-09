-- Create the old table without the image column
CREATE TABLE comments_old (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    comment_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Copy data back (ignoring image column)
INSERT INTO comments_old (id, user_id, post_id, comment_text, created_at)
SELECT id, user_id, post_id, comment_text, created_at FROM comments;

-- Drop the table with image column
DROP TABLE comments;

-- Rename table back
ALTER TABLE comments_old RENAME TO comments;
