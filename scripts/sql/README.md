# MCP Link Database Setup

This directory contains SQL scripts for setting up the MCP Link database schema and initial data.

## Files

### 1. `20250111185500_create_tables.sql`
Complete database schema creation script that includes:

- **Core Tables:**
  - `categories` - Server categories with internationalization
  - `subcategories` - Category subdivisions
  - `servers` - Main server registry
  - `server_readmes` - Structured README content
  - `user_favorites` - User favorite servers
  - `server_comments` - User comments with nested replies

- **Views:**
  - `servers_with_details` - Comprehensive server information
  - `featured_servers` - Featured servers
  - `popular_servers` - Popular servers (high stars/forks)
  - `recent_servers` - Recently updated servers
  - `featured_servers_by_category` - Featured servers grouped by category

- **Indexes and Optimizations:**
  - Performance indexes for search and filtering
  - Full-text search indexes
  - GIN indexes for array fields

- **Triggers and Functions:**
  - Auto-update timestamps
  - Category server count maintenance
  - Comment reply count tracking

- **Security:**
  - Row Level Security (RLS) policies
  - User authentication via Clerk

### 2. `20250111185600_insert_base_data.sql`
Base data insertion script that includes:

- **Categories:** 15 main categories with translations in 7 languages
- **Subcategories:** Common subcategories for better organization
- **Sample Servers:** 5 example MCP servers with realistic data
- **Data Verification:** Count queries to confirm successful insertion

## Usage

### For New Database Setup

1. **Create Database:**
   ```sql
   CREATE DATABASE mcp_link;
   ```

2. **Execute Schema Script:**
   ```bash
   psql -d mcp_link -f 20250111185500_create_tables.sql
   ```

3. **Insert Base Data:**
   ```bash
   psql -d mcp_link -f 20250111185600_insert_base_data.sql
   ```

### For Supabase Setup

1. **In Supabase Dashboard:**
   - Go to SQL Editor
   - Run the schema script first
   - Then run the base data script

2. **Via Supabase CLI:**
   ```bash
   supabase db reset
   supabase db push
   ```

### For Development

1. **Local PostgreSQL:**
   ```bash
   # Start PostgreSQL
   pg_ctl -D /usr/local/var/postgres start
   
   # Create database
   createdb mcp_link
   
   # Execute scripts
   psql -d mcp_link -f scripts/sql/20250111185500_create_tables.sql
   psql -d mcp_link -f scripts/sql/20250111185600_insert_base_data.sql
   ```

2. **Using Docker:**
   ```bash
   # Start PostgreSQL container
   docker run -d --name mcp-postgres \
     -e POSTGRES_DB=mcp_link \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 postgres:15
   
   # Execute scripts
   docker exec -i mcp-postgres psql -U postgres -d mcp_link < scripts/sql/20250111185500_create_tables.sql
   docker exec -i mcp-postgres psql -U postgres -d mcp_link < scripts/sql/20250111185600_insert_base_data.sql
   ```

## Database Schema Overview

### Core Structure

```
categories
├── id (TEXT, PRIMARY KEY)
├── name_* (TEXT, multilingual)
├── description_* (TEXT, multilingual)
├── icon (TEXT)
├── color (TEXT)
└── server_count (INTEGER, auto-maintained)

subcategories
├── id (TEXT, PRIMARY KEY)
├── category_id (TEXT, FOREIGN KEY)
├── name_* (TEXT, multilingual)
└── description_* (TEXT, multilingual)

servers
├── id (TEXT, PRIMARY KEY)
├── name, owner, slug (TEXT)
├── description_* (TEXT, multilingual)
├── category_id, subcategory_id (TEXT, FOREIGN KEY)
├── github_url, demo_url, docs_url (TEXT)
├── stats (stars, forks, watchers, etc.)
├── quality metrics (scores, factors)
├── compatibility (platforms, versions)
└── metadata (complexity, maturity, featured)
```

### Key Features

1. **Multilingual Support:** All user-facing content supports 7 languages
2. **Full-Text Search:** Optimized search across server names and descriptions
3. **User Management:** Integration with Clerk authentication
4. **Performance:** Indexed fields for fast filtering and sorting
5. **Data Integrity:** Foreign key constraints and validation
6. **Scalability:** Efficient queries with proper indexing

## Environment Variables

Ensure these are set in your application:

```env
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_link

# Or for Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
```

## Verification

After running the scripts, verify the setup:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check data
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'Servers', COUNT(*) FROM servers;

-- Test views
SELECT name, category_id, featured FROM servers_with_details LIMIT 5;
```

## Migration Notes

- All scripts are idempotent (safe to run multiple times)
- Use `ON CONFLICT` clauses for upsert operations
- Timestamps are automatically maintained
- Foreign key constraints ensure data integrity

## Troubleshooting

### Common Issues

1. **Permission Errors:**
   ```bash
   # Grant necessary permissions
   GRANT ALL PRIVILEGES ON DATABASE mcp_link TO your_user;
   ```

2. **Extension Errors:**
   ```sql
   -- Install required extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

3. **RLS Errors:**
   ```sql
   -- Disable RLS temporarily for admin operations
   ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;
   ```

For more help, refer to the main project documentation or open an issue.