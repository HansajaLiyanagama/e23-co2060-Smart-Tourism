-- 012_update_quoted_price_type.sql
-- Change quoted_price from DECIMAL to VARCHAR to support currency symbols and flexible pricing
ALTER TABLE bookings ALTER COLUMN quoted_price TYPE VARCHAR(50);
