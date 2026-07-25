-- Apply once to existing MySQL databases after the base schema.
ALTER TABLE discounts MODIFY status ENUM('draft','scheduled','active','paused','expired','archived') DEFAULT 'draft';

CREATE TABLE IF NOT EXISTS discount_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    discount_id BIGINT NOT NULL,
    admin_id BIGINT NULL,
    action VARCHAR(50) NOT NULL,
    details VARCHAR(2000) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_discount_audit_discount_id (discount_id),
    INDEX idx_discount_audit_created_at (created_at)
) ENGINE=InnoDB;
