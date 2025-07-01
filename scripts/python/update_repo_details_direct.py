#!/usr/bin/env python3
"""
Fetch repository details from GitHub and update MCP Hub database directly.
Modified version that updates the database instead of generating SQL files.

Usage:
    python3 update_repo_details_direct.py [database_connection_string]

Examples:
    # Use environment variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
    python3 update_repo_details_direct.py
    
    # Use connection string
    python3 update_repo_details_direct.py "postgresql://user:password@host:port/database"

Environment Variables:
    GITHUB_TOKEN - GitHub personal access token (recommended for higher rate limits)
    DB_HOST - Database host (default: aws-0-us-east-2.pooler.supabase.com)
    DB_PORT - Database port (default: 6543)
    DB_NAME - Database name (default: postgres)
    DB_USER - Database user
    DB_PASSWORD - Database password
"""
import json
import os
import time
import requests
import re
import sys
import psycopg2
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import urlparse
import base64
from datetime import datetime, timezone
from collections import defaultdict
import hashlib
import uuid

# Configuration
GITHUB_API_TOKEN = os.environ.get('GITHUB_TOKEN', '')
GITHUB_API_BASE = "https://api.github.com"
HEADERS = {
    "Accept": "application/vnd.github.v3+json"
}
if GITHUB_API_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_API_TOKEN}"

# Database configuration - can be overridden with environment variables
DATABASE_CONFIG = {
    'host': os.environ.get('DB_HOST', 'aws-0-us-east-2.pooler.supabase.com'),
    'port': int(os.environ.get('DB_PORT', 6543)),
    'database': os.environ.get('DB_NAME', 'postgres'),
    'user': os.environ.get('DB_USER', 'postgres.lptsvryohchbklxcyoyc'),
    'password': os.environ.get('DB_PASSWORD', 'kgCT844828190aws')
}

# Rate limiting configuration
RATE_LIMIT_THRESHOLD = 100
BASE_DELAY = 0.2 if GITHUB_API_TOKEN else 0.75

# Quality scoring weights (same as original)
QUALITY_WEIGHTS = {
    'documentation': {
        'has_readme': 10,
        'readme_length': 15,
        'has_api_docs': 20,
        'has_examples': 15,
        'has_installation': 10,
        'has_usage': 10,
        'has_configuration': 10,
        'has_license': 10
    },
    'maintenance': {
        'recent_commits': 25,
        'regular_updates': 20,
        'issue_response': 20,
        'release_frequency': 15,
        'dependency_updates': 10,
        'ci_status': 10
    },
    'community': {
        'stars': 20,
        'contributors': 20,
        'forks': 15,
        'issues_closed_ratio': 15,
        'pr_merged_ratio': 15,
        'community_engagement': 15
    },
    'performance': {
        'code_quality': 30,
        'test_coverage': 25,
        'documentation_quality': 25,
        'security_score': 20
    }
}

class DatabaseUpdater:
    def __init__(self, database_config: Dict):
        self.database_config = database_config
        self.conn = None
        self.cursor = None
        
    def connect(self):
        """Connect to the database"""
        try:
            self.conn = psycopg2.connect(**self.database_config)
            self.cursor = self.conn.cursor()
            print("✅ Connected to database")
        except Exception as e:
            print(f"❌ Failed to connect to database: {e}")
            sys.exit(1)
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def server_exists(self, slug: str) -> Optional[str]:
        """Check if server exists and return its ID"""
        try:
            self.cursor.execute("SELECT id FROM mcp_servers WHERE slug = %s", (slug,))
            result = self.cursor.fetchone()
            return result[0] if result else None
        except Exception as e:
            print(f"❌ Error checking server existence for {slug}: {e}")
            return None
    
    def update_server_metadata(self, slug: str, data: Dict) -> bool:
        """Update server metadata in mcp_servers table"""
        try:
            update_query = """
                UPDATE mcp_servers SET 
                    stars = %s, forks = %s, watchers = %s, open_issues = %s,
                    last_updated = %s, repo_created_at = %s,
                    quality_score = %s, quality_documentation = %s,
                    quality_maintenance = %s, quality_community = %s,
                    quality_performance = %s, complexity = %s, maturity = %s,
                    is_official = %s, updated_at = NOW()
                WHERE slug = %s
            """
            
            self.cursor.execute(update_query, (
                data.get('stars', 0),
                data.get('forks', 0),
                data.get('watchers', 0),
                data.get('open_issues', 0),
                data.get('last_updated'),
                data.get('repo_created_at'),
                data.get('quality_score', 0),
                data.get('quality_documentation', 0),
                data.get('quality_maintenance', 0),
                data.get('quality_community', 0),
                data.get('quality_performance', 50),
                data.get('complexity', 'medium'),
                data.get('maturity', 'experimental'),
                data.get('is_official', False),
                slug
            ))
            
            return True
        except Exception as e:
            print(f"❌ Error updating server metadata for {slug}: {e}")
            return False
    
    def update_installation_methods(self, server_id: str, installations: List[Dict]) -> bool:
        """Update installation methods for a server"""
        try:
            # Delete existing installation methods
            self.cursor.execute("DELETE FROM server_installation WHERE server_id = %s", (server_id,))
            
            # Insert new installation methods
            for install in installations:
                self.cursor.execute("""
                    INSERT INTO server_installation (server_id, method, command)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (server_id, method) 
                    DO UPDATE SET command = EXCLUDED.command, updated_at = NOW()
                """, (server_id, install['method'], install['command']))
            
            return True
        except Exception as e:
            print(f"❌ Error updating installation methods for {server_id}: {e}")
            return False
    
    def update_tech_stack(self, server_id: str, technologies: List[str]) -> bool:
        """Update technology stack for a server"""
        try:
            # Delete existing tech stack
            self.cursor.execute("DELETE FROM server_tech_stack WHERE server_id = %s", (server_id,))
            
            # Insert new tech stack
            for tech in technologies:
                self.cursor.execute("""
                    INSERT INTO server_tech_stack (server_id, technology)
                    VALUES (%s, %s)
                    ON CONFLICT (server_id, technology) DO NOTHING
                """, (server_id, tech))
            
            return True
        except Exception as e:
            print(f"❌ Error updating tech stack for {server_id}: {e}")
            return False
    
    def update_readme(self, server_id: str, readme_data: Dict) -> bool:
        """Update README content for a server"""
        try:
            self.cursor.execute("""
                INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (server_id, filename)
                DO UPDATE SET 
                    raw_content = EXCLUDED.raw_content,
                    content_hash = EXCLUDED.content_hash,
                    file_size = EXCLUDED.file_size,
                    updated_at = NOW()
            """, (
                server_id,
                readme_data.get('filename', 'README.md'),
                readme_data.get('project_name', server_id),
                readme_data.get('content', ''),
                readme_data.get('content_hash', ''),
                readme_data.get('file_size', 0)
            ))
            
            return True
        except Exception as e:
            print(f"❌ Error updating README for {server_id}: {e}")
            return False
    
    def commit_transaction(self):
        """Commit the current transaction"""
        if self.conn:
            self.conn.commit()
    
    def rollback_transaction(self):
        """Rollback the current transaction"""
        if self.conn:
            self.conn.rollback()

class GitHubFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.rate_limit_remaining = 5000 if GITHUB_API_TOKEN else 60
        self.rate_limit_reset = 0
        
    def _handle_rate_limit(self, response):
        """Handle GitHub API rate limiting"""
        self.rate_limit_remaining = int(response.headers.get('X-RateLimit-Remaining', 0))
        self.rate_limit_reset = int(response.headers.get('X-RateLimit-Reset', 0))
        
        if response.status_code == 403 and self.rate_limit_remaining == 0:
            wait_time = self.rate_limit_reset - time.time()
            if wait_time > 0:
                print(f"⏳ Rate limit exceeded. Waiting {wait_time:.0f} seconds...")
                time.sleep(wait_time + 1)
                return True
        
        # Dynamic delay based on remaining requests
        if self.rate_limit_remaining < RATE_LIMIT_THRESHOLD:
            delay_multiplier = RATE_LIMIT_THRESHOLD / max(self.rate_limit_remaining, 1)
            time.sleep(BASE_DELAY * delay_multiplier)
        else:
            time.sleep(BASE_DELAY)
            
        return False
        
    def _make_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make a request with rate limit handling"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, params=params)
                
                if self._handle_rate_limit(response):
                    continue
                    
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    return None
                else:
                    print(f"⚠️  API request failed with status {response.status_code}: {url}")
                    
            except Exception as e:
                print(f"⚠️  Request failed (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    
        return None
    
    def get_repo_data(self, owner: str, repo: str) -> Optional[Dict]:
        """Get basic repository data"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
        return self._make_request(url)
    
    def get_readme(self, owner: str, repo: str) -> Optional[str]:
        """Get README content"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/readme"
        data = self._make_request(url)
        if data and 'content' in data:
            try:
                return base64.b64decode(data['content']).decode('utf-8')
            except:
                return None
        return None
    
    def get_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Get programming languages"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/languages"
        return self._make_request(url) or {}

def calculate_quality_scores(repo_data: Dict, readme_content: str) -> Dict[str, int]:
    """Calculate quality scores based on repository data"""
    scores = {
        'documentation': 0,
        'maintenance': 0,
        'community': 0,
        'performance': 50  # Default performance score
    }
    
    # Documentation scoring
    doc_score = 0
    if readme_content:
        doc_score += QUALITY_WEIGHTS['documentation']['has_readme']
        if len(readme_content) > 1000:
            doc_score += QUALITY_WEIGHTS['documentation']['readme_length']
        if any(keyword in readme_content.lower() for keyword in ['install', 'setup', 'getting started']):
            doc_score += QUALITY_WEIGHTS['documentation']['has_installation']
        if any(keyword in readme_content.lower() for keyword in ['usage', 'example', 'how to']):
            doc_score += QUALITY_WEIGHTS['documentation']['has_usage']
        if any(keyword in readme_content.lower() for keyword in ['api', 'reference', 'documentation']):
            doc_score += QUALITY_WEIGHTS['documentation']['has_api_docs']
    
    scores['documentation'] = min(doc_score, 100)
    
    # Community scoring
    stars = repo_data.get('stargazers_count', 0)
    forks = repo_data.get('forks_count', 0)
    
    community_score = 0
    if stars > 0:
        community_score += min(stars // 10, QUALITY_WEIGHTS['community']['stars'])
    if forks > 0:
        community_score += min(forks // 5, QUALITY_WEIGHTS['community']['forks'])
    
    scores['community'] = min(community_score, 100)
    
    # Maintenance scoring (simplified)
    maintenance_score = 0
    last_updated = repo_data.get('updated_at')
    if last_updated:
        try:
            last_update = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
            days_since_update = (datetime.now(timezone.utc) - last_update).days
            if days_since_update < 30:
                maintenance_score += QUALITY_WEIGHTS['maintenance']['recent_commits']
            elif days_since_update < 90:
                maintenance_score += QUALITY_WEIGHTS['maintenance']['recent_commits'] // 2
        except:
            pass
    
    scores['maintenance'] = min(maintenance_score, 100)
    
    return scores

def determine_complexity_and_maturity(repo_data: Dict, languages: Dict) -> Tuple[str, str]:
    """Determine complexity and maturity levels"""
    # Complexity based on languages and size
    complexity = 'medium'
    if len(languages) > 3 or repo_data.get('size', 0) > 10000:
        complexity = 'high'
    elif len(languages) <= 1 and repo_data.get('size', 0) < 1000:
        complexity = 'low'
    
    # Maturity based on age and activity
    maturity = 'experimental'
    created_at = repo_data.get('created_at')
    if created_at:
        try:
            created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            age_days = (datetime.now(timezone.utc) - created).days
            stars = repo_data.get('stargazers_count', 0)
            
            if age_days > 365 and stars > 100:
                maturity = 'stable'
            elif age_days > 180 and stars > 10:
                maturity = 'beta'
        except:
            pass
    
    return complexity, maturity

def extract_installation_commands(readme_content: str) -> List[Dict[str, str]]:
    """Extract installation commands from README"""
    installations = []
    
    if not readme_content:
        return installations
    
    # npm install patterns
    npm_patterns = [
        r'npm install\s+([^\s\n]+)',
        r'npm i\s+([^\s\n]+)'
    ]
    
    for pattern in npm_patterns:
        matches = re.findall(pattern, readme_content, re.IGNORECASE)
        for match in matches[:3]:  # Limit to 3 matches
            installations.append({
                'method': 'npm',
                'command': f'npm install {match.strip()}'
            })
    
    # pip install patterns
    pip_patterns = [
        r'pip install\s+([^\s\n]+)',
        r'pip3 install\s+([^\s\n]+)'
    ]
    
    for pattern in pip_patterns:
        matches = re.findall(pattern, readme_content, re.IGNORECASE)
        for match in matches[:3]:
            installations.append({
                'method': 'pip',
                'command': f'pip install {match.strip()}'
            })
    
    return installations

def main():
    """Main function to update repository details in database"""
    print("🚀 Starting direct database update for MCP servers...")
    print("📝 Database configuration:")
    print(f"   Host: {DATABASE_CONFIG['host']}")
    print(f"   Port: {DATABASE_CONFIG['port']}")
    print(f"   Database: {DATABASE_CONFIG['database']}")
    print(f"   User: {DATABASE_CONFIG['user']}")
    print(f"   Password: {'*' * len(DATABASE_CONFIG['password'])}")
    print()
    
    # Check if custom database connection is provided
    if len(sys.argv) > 1:
        connection_string = sys.argv[1]
        print(f"🔧 Using provided connection string: {connection_string[:50]}...")
        
        # Parse psql-style connection string
        try:
            import re
            # Extract components from postgresql://user:password@host:port/database
            match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', connection_string)
            if match:
                user, password, host, port, database = match.groups()
                DATABASE_CONFIG.update({
                    'user': user,
                    'password': password,
                    'host': host,
                    'port': int(port),
                    'database': database
                })
                print(f"✅ Parsed connection string successfully")
            else:
                print(f"❌ Invalid connection string format")
                sys.exit(1)
        except Exception as e:
            print(f"❌ Error parsing connection string: {e}")
            sys.exit(1)
    
    # Initialize database connection
    db = DatabaseUpdater(DATABASE_CONFIG)
    db.connect()
    
    # Initialize GitHub fetcher
    fetcher = GitHubFetcher()
    
    try:
        # Load servers data
        servers_file = '/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json'
        
        if not os.path.exists(servers_file):
            print(f"❌ Servers file not found: {servers_file}")
            sys.exit(1)
        
        with open(servers_file, 'r') as f:
            servers = json.load(f)
        
        print(f"📊 Found {len(servers)} servers to process")
        
        processed = 0
        updated = 0
        skipped = 0
        
        for i, server in enumerate(servers, 1):
            slug = server.get('slug', '')
            github_url = server.get('github_url', '')
            
            print(f"\n[{i}/{len(servers)}] Processing: {slug}")
            
            if not github_url:
                print(f"⏭️  Skipping {slug}: No GitHub URL")
                skipped += 1
                continue
            
            # Check if server exists in database
            server_id = db.server_exists(slug)
            if not server_id:
                print(f"⏭️  Skipping {slug}: Not found in database")
                skipped += 1
                continue
            
            # Parse GitHub URL
            try:
                parsed = urlparse(github_url)
                path_parts = parsed.path.strip('/').split('/')
                if len(path_parts) < 2:
                    print(f"⏭️  Skipping {slug}: Invalid GitHub URL format")
                    skipped += 1
                    continue
                
                owner, repo = path_parts[0], path_parts[1]
            except Exception as e:
                print(f"⏭️  Skipping {slug}: Error parsing URL - {e}")
                skipped += 1
                continue
            
            print(f"🔍 Fetching data for {owner}/{repo}")
            
            # Fetch repository data
            repo_data = fetcher.get_repo_data(owner, repo)
            if not repo_data:
                print(f"⏭️  Skipping {slug}: Could not fetch repository data")
                skipped += 1
                continue
            
            # Fetch README
            readme_content = fetcher.get_readme(owner, repo) or ""
            
            # Fetch languages
            languages = fetcher.get_languages(owner, repo)
            
            # Calculate quality scores
            quality_scores = calculate_quality_scores(repo_data, readme_content)
            
            # Determine complexity and maturity
            complexity, maturity = determine_complexity_and_maturity(repo_data, languages)
            
            # Extract installation commands
            installations = extract_installation_commands(readme_content)
            
            # Prepare update data
            update_data = {
                'stars': repo_data.get('stargazers_count', 0),
                'forks': repo_data.get('forks_count', 0),
                'watchers': repo_data.get('watchers_count', 0),
                'open_issues': repo_data.get('open_issues_count', 0),
                'last_updated': repo_data.get('updated_at'),
                'repo_created_at': repo_data.get('created_at'),
                'quality_score': sum(quality_scores.values()) // len(quality_scores),
                'quality_documentation': quality_scores['documentation'],
                'quality_maintenance': quality_scores['maintenance'],
                'quality_community': quality_scores['community'],
                'quality_performance': quality_scores['performance'],
                'complexity': complexity,
                'maturity': maturity,
                'is_official': owner.lower() in ['microsoft', 'google', 'amazon', 'facebook', 'apple', 'anthropic']
            }
            
            # Update database
            success = True
            
            # Update server metadata
            if not db.update_server_metadata(slug, update_data):
                success = False
            
            # Update installation methods
            if installations and not db.update_installation_methods(server_id, installations):
                success = False
            
            # Update tech stack
            tech_stack = list(languages.keys())[:5]  # Top 5 languages
            if tech_stack and not db.update_tech_stack(server_id, tech_stack):
                success = False
            
            # Update README
            if readme_content:
                readme_data = {
                    'filename': 'README.md',
                    'project_name': slug,
                    'content': readme_content,
                    'content_hash': hashlib.md5(readme_content.encode()).hexdigest(),
                    'file_size': len(readme_content.encode())
                }
                if not db.update_readme(server_id, readme_data):
                    success = False
            
            if success:
                db.commit_transaction()
                print(f"✅ Updated {slug}")
                updated += 1
            else:
                db.rollback_transaction()
                print(f"❌ Failed to update {slug}")
            
            processed += 1
            
            # Progress update
            if processed % 10 == 0:
                print(f"\n📈 Progress: {processed}/{len(servers)} processed, {updated} updated, {skipped} skipped")
                print(f"🔄 Rate limit remaining: {fetcher.rate_limit_remaining}")
        
        print(f"\n🎉 Complete! Processed: {processed}, Updated: {updated}, Skipped: {skipped}")
        
    except KeyboardInterrupt:
        print(f"\n⏹️  Operation interrupted by user")
        db.rollback_transaction()
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        db.rollback_transaction()
    finally:
        db.disconnect()

if __name__ == "__main__":
    main()