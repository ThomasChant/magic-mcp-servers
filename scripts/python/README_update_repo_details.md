# Update Repository Details Script

This script fetches comprehensive repository information from GitHub and generates SQL update statements for the MCP Hub database.

## Features

- **Comprehensive Data Extraction**:
  - Repository statistics (stars, forks, watchers, issues)
  - Programming languages and tech stack
  - Commit activity and maintenance frequency
  - Release information and versions
  - README analysis and quality scoring
  - Installation instructions extraction
  - Contributors and community metrics

- **Quality Scoring System**:
  - Documentation quality (README structure, API docs, examples)
  - Maintenance quality (commit frequency, issue response)
  - Community engagement (stars, contributors, forks)
  - Overall quality score calculation

- **Optimized Performance**:
  - Smart rate limiting with dynamic delays
  - Automatic retry with exponential backoff
  - Progress tracking and API quota monitoring
  - Batch processing support

- **SQL Output**:
  - Generates UPDATE statements for `mcp_servers` table (using `slug` field)
  - INSERT statements for `server_installation` table (using `server_id`)
  - INSERT statements for `server_tech_stack` table (using `server_id`)
  - INSERT/UPDATE for `server_readmes` table (using `server_id`)
  
  Note: 
  - `slug` is formatted as `ownerrepo` (lowercase, no separator, e.g., `facebookreact`)
  - `server_id` is formatted as `owner_repo` (with underscore, e.g., `facebook_react`)

## Setup

1. **Set GitHub Token** (Recommended):
   ```bash
   export GITHUB_TOKEN=your_github_personal_access_token
   ```
   Without a token, you're limited to 60 requests/hour. With a token, you get 5,000 requests/hour.

2. **Install Dependencies**:
   ```bash
   pip install requests
   ```

## Usage

Run the script:
```bash
python update_repo_details.py
```

The script will:
1. Read servers from `src/data/merged_servers.json`
2. Fetch detailed information from GitHub for each server
3. Calculate quality metrics
4. Generate SQL update statements
5. Save output to `scripts/sql/update_repo_details.sql`

## Output

The generated SQL file contains:
- Transaction-wrapped updates (BEGIN/COMMIT)
- UPDATE statements for repository statistics and quality scores
- INSERT statements for installation methods
- INSERT statements for technology stack
- INSERT/UPDATE statements for README content

## Applying Updates

To apply the generated updates to your database:
```bash
psql -h your_host -U your_user -d your_database -f scripts/sql/update_repo_details.sql
```

## Rate Limiting

The script implements intelligent rate limiting:
- Monitors remaining API quota
- Dynamically adjusts delays based on quota
- Automatically waits when rate limit is exceeded
- Shows progress and remaining API calls

## Quality Metrics

The script calculates four quality scores (0-100):

1. **Documentation Quality**: Based on README completeness
2. **Maintenance Quality**: Based on commit activity and issue management
3. **Community Quality**: Based on stars, contributors, and engagement
4. **Performance Quality**: Default score (can be enhanced with code analysis)

## Extracted Information

For each repository, the script extracts:
- Basic stats: stars, forks, watchers, open issues
- Dates: created_at, updated_at
- Languages and tech stack
- Installation commands (npm, pip, docker, etc.)
- Version information from releases and package.json
- README content and structure analysis
- Contributor count and activity metrics
- Project complexity and maturity assessment

## Error Handling

- Graceful handling of missing repositories
- Retry logic for transient failures
- Detailed error reporting
- Continues processing even if individual repos fail

## Performance Tips

- Use a GitHub token for 83x more API requests
- Process during off-peak hours
- Monitor the rate limit display
- The script automatically optimizes request timing