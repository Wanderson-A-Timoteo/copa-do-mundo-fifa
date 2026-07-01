-- Add daily pack limit tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ultimo_dia_abertura TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pacotes_abertos_hoje INTEGER DEFAULT 0;
