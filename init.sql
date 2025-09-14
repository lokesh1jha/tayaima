-- Initialize the database
CREATE DATABASE kiranastore;

-- Create extensions if needed
\c kiranastore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE kiranastore TO kirana_user;
