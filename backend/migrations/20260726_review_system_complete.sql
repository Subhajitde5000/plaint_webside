-- Complete Product Review System Database Migration

ALTER TABLE reviews
  MODIFY COLUMN status ENUM('submitted', 'pending', 'published', 'rejected', 'flagged', 'hidden') DEFAULT 'pending',
  ADD COLUMN deleted_at DATETIME NULL AFTER updated_at,
  ADD COLUMN is_edited TINYINT(1) DEFAULT 0 AFTER is_featured,
  ADD COLUMN edited_at DATETIME NULL AFTER is_edited,
  ADD COLUMN spam_score SMALLINT DEFAULT 0 AFTER rejection_reason,
  ADD COLUMN ai_risk_level VARCHAR(20) DEFAULT 'low' AFTER spam_score,
  ADD COLUMN video_url VARCHAR(500) NULL AFTER body;

CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  review_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  is_helpful TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_review_user (review_id, user_id)
);

ALTER TABLE order_items
  ADD COLUMN review_reminder_sent_at DATETIME NULL;
