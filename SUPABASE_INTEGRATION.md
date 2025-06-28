# Supabase Integration Guide

This document explains how to set up and use Supabase as the data backend for the MCP Hub application.

## Overview

The MCP Hub now supports two data sources:
1. **JSON Files** (default) - Static data files for development and simple deployments
2. **Supabase Database** - Scalable PostgreSQL database for production use

## Features

### Supabase Integration Benefits
- **Real-time updates** - Data changes are reflected immediately
- **Advanced search** - Full-text search capabilities with PostgreSQL
- **Scalability** - Handle thousands of MCP servers efficiently
- **Analytics** - Built-in analytics and monitoring
- **Multi-language support** - Full internationalization support
- **Comments system** - Already integrated with Supabase

### Database Schema
- **categories** - Server categories with multi-language support
- **subcategories** - Category subdivisions
- **mcp_servers** - Main server data with comprehensive metadata
- **tags** - Normalized tag system
- **server_tags** - Many-to-many relationship between servers and tags
- **server_tech_stack** - Technology stack information
- **server_installation** - Installation methods and instructions
- **Optimized views** - Pre-joined data for better performance

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Wait for the project to be initialized

### 2. Database Setup

#### Option A: Using Supabase Dashboard
1. Go to your project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Run the SQL script to create all tables and views

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push --include-all
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables:
   ```env
   # Enable Supabase
   VITE_USE_SUPABASE=true
   
   # Your Supabase project details
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   
   # For data migration (keep secret)
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```

3. Find your keys in Supabase Dashboard > Settings > API

### 4. Data Migration

Run the migration script to import existing JSON data into Supabase:

```bash
# Install dependencies
npm install

# Run migration (requires SUPABASE_SERVICE_KEY)
npx tsx scripts/migrate-to-supabase.ts
```

The migration script will:
- Import all categories and subcategories
- Create normalized tags table
- Import all MCP servers with full metadata
- Establish all relationships between entities
- Preserve all existing data structure

## Usage

### Development Mode
```bash
# Use JSON files (default)
VITE_USE_SUPABASE=false npm run dev

# Use Supabase database
VITE_USE_SUPABASE=true npm run dev
```

### Production Deployment

1. Set environment variables in your hosting platform
2. Ensure `VITE_USE_SUPABASE=true`
3. Deploy the application

### Data Management

#### Adding New Servers
You can add servers in two ways:

1. **Supabase Dashboard**: Direct database manipulation
2. **API Integration**: Build admin interface using Supabase client

#### Updating Server Data
```typescript
import { supabase } from './src/lib/supabase';

// Update server information
const { error } = await supabase
  .from('mcp_servers')
  .update({ 
    stars: newStarCount,
    last_updated: new Date().toISOString()
  })
  .eq('id', serverId);
```

#### Real-time Subscriptions
```typescript
// Listen for server updates
const subscription = supabase
  .channel('server-updates')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'mcp_servers' 
    }, 
    (payload) => {
      console.log('Server updated:', payload);
      // Invalidate React Query cache
      queryClient.invalidateQueries(['supabase', 'servers']);
    }
  )
  .subscribe();
```

## Performance Optimization

### Database Indexes
The schema includes optimized indexes for:
- Category and subcategory lookups
- Server searches by name and description
- Tag-based filtering
- Quality score sorting
- Star count sorting

### Caching Strategy
- React Query handles client-side caching
- Supabase provides edge caching
- Views pre-compute complex joins

### Search Performance
Full-text search is enabled on:
- Server names
- Descriptions
- Full descriptions

Example search query:
```sql
SELECT * FROM servers_with_details 
WHERE to_tsvector('english', name || ' ' || description_en) 
@@ plainto_tsquery('english', 'search terms');
```

## Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Public read access for all data
- Write access controlled via service keys

### API Keys
- **Anon Key**: Safe for client-side use, read-only access
- **Service Key**: Server-side only, full access (keep secret)

### Environment Variables
Never commit the following to version control:
- `SUPABASE_SERVICE_KEY`
- Production environment files

## Monitoring

### Supabase Dashboard
Monitor your database usage:
- Query performance
- Storage usage
- API requests
- Real-time connections

### Application Metrics
```typescript
// Monitor data source in development
console.log('Data source:', getDataSource()); // 'supabase' or 'json'
console.log('Using Supabase:', isUsingSupabase()); // true/false
```

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check SUPABASE_SERVICE_KEY is set correctly
   - Ensure database schema is created first
   - Verify network connectivity

2. **Data Not Loading**
   - Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Verify environment variables are prefixed with VITE_
   - Check browser network tab for API errors

3. **Performance Issues**
   - Enable query optimization in Supabase
   - Check if indexes are properly created
   - Monitor query execution plans

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('supabase.debug', 'true');
```

### Fallback to JSON
If Supabase is unavailable, quickly switch back:
```bash
VITE_USE_SUPABASE=false npm run build
```

## Future Enhancements

- **Real-time server status monitoring**
- **Advanced analytics dashboard**
- **Automated server discovery**
- **Quality score algorithms**
- **Community voting system**
- **API rate limiting**
- **Data export/import tools**

## Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

For integration issues:
- Check this repository's issues
- Review the migration logs
- Verify environment configuration