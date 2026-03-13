CREATE TABLE place_reviews (
    id SERIAL PRIMARY KEY,
    place_id INT NOT NULL,
    tourist_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Database-level constraint
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE guide_reviews (
    id SERIAL PRIMARY KEY,
    guide_id INT NOT NULL, -- Refers to the user_id of the guide
    tourist_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guide_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE
);