-- Standard MySQL syntax compatible with all MySQL / MariaDB versions:
ALTER TABLE loyalty_accounts 
ADD points_reserved INT DEFAULT 0 AFTER points_balance;
