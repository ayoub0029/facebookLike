CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    type TEXT,
    reference_id INTEGER,
    content TEXT,
    action TEXT DEFAULT 'view',
    seen BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);