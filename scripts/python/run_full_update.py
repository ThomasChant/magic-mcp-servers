#!/usr/bin/env python3
"""
Direct full update script - runs complete repository update without interactive prompts

Usage:
    python3 run_full_update.py                    # Start from beginning
    python3 run_full_update.py <server_name>      # Resume from specific server
    python3 run_full_update.py --help             # Show this help

Examples:
    python3 run_full_update.py                             # Process all servers
    python3 run_full_update.py 0kenx_filesystem-mcp       # Resume from this server
    python3 run_full_update.py "microsoft/mcp-server"     # Resume (use quotes if has special chars)

Features:
    - Automatic constraint setup
    - Rate limiting with GitHub API
    - Progress reports every 25 servers
    - Resume instructions on interrupt
    - Comprehensive error handling
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

# 加载环境变量
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Environment variables must be set manually.")

# Configuration
GITHUB_API_TOKEN = os.getenv('GITHUB_TOKEN')
if not GITHUB_API_TOKEN:
    print("❌ 错误: 未找到 GITHUB_TOKEN 环境变量")
    print("请在 .env.local 文件中设置 GITHUB_TOKEN=your_token_here")
    sys.exit(1)

GITHUB_API_BASE = os.getenv("GITHUB_API_BASE_URL", "https://api.github.com")
HEADERS = {
    "Accept": "application/vnd.github.v3+json"
}
if GITHUB_API_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_API_TOKEN}"

# Database configuration
DATABASE_CONFIG = {
    'host': os.getenv('SUPABASE_HOST', 'localhost'),
    'port': int(os.getenv('SUPABASE_PORT', '5432')),
    'database': os.getenv('SUPABASE_DATABASE', 'postgres'),
    'user': os.getenv('SUPABASE_USER'),
    'password': os.getenv('SUPABASE_PASSWORD')
}

# Validate required database configuration
if not all([DATABASE_CONFIG['user'], DATABASE_CONFIG['password']]):
    print("❌ 错误: 数据库配置不完整")
    print("请在 .env.local 文件中设置:")
    print("  SUPABASE_USER=your_database_user")
    print("  SUPABASE_PASSWORD=your_database_password")
    sys.exit(1)

RATE_LIMIT_THRESHOLD = 100
BASE_DELAY = float(os.getenv("GITHUB_RATE_LIMIT_DELAY", "200")) / 1000  # Convert ms to seconds

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
        doc_score += 10  # has_readme
        if len(readme_content) > 1000:
            doc_score += 15  # readme_length
        if any(keyword in readme_content.lower() for keyword in ['install', 'setup', 'getting started']):
            doc_score += 10  # has_installation
        if any(keyword in readme_content.lower() for keyword in ['usage', 'example', 'how to']):
            doc_score += 10  # has_usage
        if any(keyword in readme_content.lower() for keyword in ['api', 'reference', 'documentation']):
            doc_score += 20  # has_api_docs
        if any(keyword in readme_content.lower() for keyword in ['license', 'mit', 'apache']):
            doc_score += 10  # has_license
    
    scores['documentation'] = min(doc_score, 100)
    
    # Community scoring
    stars = repo_data.get('stargazers_count', 0)
    forks = repo_data.get('forks_count', 0)
    
    community_score = 0
    if stars > 0:
        community_score += min(stars // 10, 20)  # stars weight
    if forks > 0:
        community_score += min(forks // 5, 15)   # forks weight
    
    scores['community'] = min(community_score, 100)
    
    # Maintenance scoring
    maintenance_score = 0
    last_updated = repo_data.get('updated_at')
    if last_updated:
        try:
            last_update = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
            days_since_update = (datetime.now(timezone.utc) - last_update).days
            if days_since_update < 30:
                maintenance_score += 25  # recent_commits
            elif days_since_update < 90:
                maintenance_score += 12  # somewhat recent
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
        r'npm install\s+([^\s\n\`]+)',
        r'npm i\s+([^\s\n\`]+)'
    ]
    
    for pattern in npm_patterns:
        matches = re.findall(pattern, readme_content, re.IGNORECASE)
        for match in matches[:2]:  # Limit to 2 matches
            if not any(char in match for char in ['<', '>', '[', ']', '```']):
                installations.append({
                    'method': 'npm',
                    'command': f'npm install {match.strip()}'
                })
    
    # pip install patterns
    pip_patterns = [
        r'pip install\s+([^\s\n\`]+)',
        r'pip3 install\s+([^\s\n\`]+)'
    ]
    
    for pattern in pip_patterns:
        matches = re.findall(pattern, readme_content, re.IGNORECASE)
        for match in matches[:2]:
            if not any(char in match for char in ['<', '>', '[', ']', '```']):
                installations.append({
                    'method': 'pip',
                    'command': f'pip install {match.strip()}'
                })
    
    return installations

def main():
    """Run full update of all servers"""
    
    # Check for help
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h', 'help']:
        print(__doc__)
        sys.exit(0)
    
    print("🚀 Starting Full Repository Update")
    print("=" * 60)
    
    # Check for resume option
    start_from = None
    if len(sys.argv) > 1:
        start_from = sys.argv[1]
        print(f"🔄 Resume mode: Starting from '{start_from}'")
    else:
        print("💡 Tip: Use 'python3 run_full_update.py <server_name>' to resume from a specific server")
    
    # Test database connection and add constraints
    print("🔍 Testing database connection and setting up constraints...")
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor()
        
        # Check server count
        cursor.execute("SELECT COUNT(*) FROM mcp_servers;")
        server_count = cursor.fetchone()[0]
        print(f"✅ Connected to database ({server_count} servers found)")
        
        # Add missing constraints
        print("🔧 Adding database constraints...")
        
        # Check and add constraint for server_installation
        cursor.execute("""
            SELECT constraint_name FROM information_schema.table_constraints 
            WHERE table_name = 'server_installation' 
            AND constraint_type = 'UNIQUE' 
            AND constraint_name LIKE '%server_method%'
        """)
        if not cursor.fetchone():
            cursor.execute("""
                ALTER TABLE server_installation 
                ADD CONSTRAINT uk_server_installation_server_method 
                UNIQUE (server_id, method)
            """)
            print("   ✅ Added server_installation unique constraint")
        else:
            print("   ✅ server_installation constraint already exists")
        
        # Check and add constraint for server_tech_stack
        cursor.execute("""
            SELECT constraint_name FROM information_schema.table_constraints 
            WHERE table_name = 'server_tech_stack' 
            AND constraint_type = 'UNIQUE' 
            AND constraint_name LIKE '%server_technology%'
        """)
        if not cursor.fetchone():
            cursor.execute("""
                ALTER TABLE server_tech_stack 
                ADD CONSTRAINT uk_server_tech_stack_server_technology 
                UNIQUE (server_id, technology)
            """)
            print("   ✅ Added server_tech_stack unique constraint")
        else:
            print("   ✅ server_tech_stack constraint already exists")
        
        # Check and add constraint for server_readmes
        cursor.execute("""
            SELECT constraint_name FROM information_schema.table_constraints 
            WHERE table_name = 'server_readmes' 
            AND constraint_type = 'UNIQUE' 
            AND constraint_name LIKE '%server_filename%'
        """)
        if not cursor.fetchone():
            cursor.execute("""
                ALTER TABLE server_readmes 
                ADD CONSTRAINT uk_server_readmes_server_filename 
                UNIQUE (server_id, filename)
            """)
            print("   ✅ Added server_readmes unique constraint")
        else:
            print("   ✅ server_readmes constraint already exists")
        
        conn.commit()
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        sys.exit(1)
    
    # Load servers
    servers_file = '/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json'
    if not os.path.exists(servers_file):
        print(f"❌ Servers file not found: {servers_file}")
        sys.exit(1)
    
    with open(servers_file, 'r') as f:
        servers = json.load(f)
    
    print(f"📊 Found {len(servers)} servers to process")
    
    # Handle resume functionality
    start_index = 0
    if start_from:
        found_start = False
        for i, server in enumerate(servers):
            name = server.get('name', '')
            slug = name.replace('/', '_')
            if slug == start_from or name == start_from:
                start_index = i
                found_start = True
                print(f"📍 Found starting point: {slug} at position {i+1}")
                break
        
        if not found_start:
            print(f"❌ Could not find server '{start_from}' in the list")
            print("Available servers (first 10):")
            for i, server in enumerate(servers[:10]):
                name = server.get('name', '')
                slug = name.replace('/', '_')
                print(f"   {i+1}. {slug}")
            print("   ...")
            sys.exit(1)
        
        # Skip already processed servers
        servers = servers[start_index:]
        print(f"⏭️  Skipping {start_index} servers, processing {len(servers)} remaining")
    
    if GITHUB_API_TOKEN:
        print(f"✅ GitHub token configured - using higher rate limits")
    else:
        print(f"⚠️  No GitHub token - limited to 60 requests/hour")
    
    print(f"⏱️  Estimated time: {len(servers) * BASE_DELAY / 60:.0f}-{len(servers) * BASE_DELAY * 2 / 60:.0f} minutes")
    print()
    
    # Set up GitHub fetcher
    session = requests.Session()
    session.headers.update(HEADERS)
    
    # Connect to database
    conn = psycopg2.connect(**DATABASE_CONFIG)
    cursor = conn.cursor()
    
    updated = 0
    skipped = 0
    errors = 0
    start_time = time.time()
    
    try:
        for i, server in enumerate(servers, 1):
            name = server.get('name', '')
            slug = name.replace('/', '_')
            github_url = server.get('githubUrl', '')
            
            # Calculate actual position in original list
            actual_position = start_index + i
            total_servers = start_index + len(servers)
            
            print(f"[{actual_position}/{total_servers}] {slug}")
            
            if not github_url:
                print(f"   ⏭️  No GitHub URL")
                skipped += 1
                continue
            
            # Check if server exists in database
            cursor.execute("SELECT id FROM mcp_servers WHERE github_url = %s", (github_url,))
            result = cursor.fetchone()
            
            if not result:
                print(f"   ⏭️  Not in database")
                skipped += 1
                continue
            
            server_id = result[0]
            
            # Parse GitHub URL
            try:
                parsed = urlparse(github_url)
                path_parts = parsed.path.strip('/').split('/')
                if len(path_parts) < 2:
                    print(f"   ⏭️  Invalid URL")
                    skipped += 1
                    continue
                
                owner, repo = path_parts[0], path_parts[1]
            except Exception as e:
                print(f"   ⏭️  URL parse error: {e}")
                skipped += 1
                continue
            
            try:
                # Fetch repo data
                repo_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
                response = session.get(repo_url)
                
                # Print rate limit info and adjust delay
                rate_remaining = response.headers.get('X-RateLimit-Remaining', 'unknown')
                rate_reset = response.headers.get('X-RateLimit-Reset', 'unknown')
                
                # Calculate dynamic delay based on remaining requests
                current_delay = BASE_DELAY
                if rate_remaining != 'unknown':
                    remaining_int = int(rate_remaining)
                    if remaining_int < 50:
                        current_delay = BASE_DELAY * 4  # Very slow
                        warning = "⚠️  VERY LOW"
                    elif remaining_int < 100:
                        current_delay = BASE_DELAY * 2  # Slow down
                        warning = "⚠️  LOW"
                    elif remaining_int < 200:
                        current_delay = BASE_DELAY * 1.5  # Slightly slower
                        warning = "⚠️  MODERATE"
                    else:
                        warning = "✅ OK"
                    
                    if rate_reset != 'unknown':
                        reset_time = datetime.fromtimestamp(int(rate_reset)).strftime('%H:%M:%S')
                        print(f"   🔄 Rate limit: {rate_remaining} left {warning} (resets at {reset_time}) [delay: {current_delay:.1f}s]")
                    else:
                        print(f"   🔄 Rate limit: {rate_remaining} left {warning} [delay: {current_delay:.1f}s]")
                else:
                    print(f"   🔄 Rate limit: {rate_remaining} requests left [delay: {current_delay:.1f}s]")
                
                if response.status_code != 200:
                    print(f"   ⏭️  API error: {response.status_code}")
                    skipped += 1
                    time.sleep(BASE_DELAY)
                    continue
                
                repo_data = response.json()
                
                # Fetch README
                readme_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/readme"
                readme_response = session.get(readme_url)
                readme_content = ""
                
                if readme_response.status_code == 200:
                    readme_data = readme_response.json()
                    if 'content' in readme_data:
                        try:
                            readme_content = base64.b64decode(readme_data['content']).decode('utf-8')
                        except:
                            readme_content = ""
                
                # Fetch languages
                lang_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/languages"
                lang_response = session.get(lang_url)
                languages = {}
                
                if lang_response.status_code == 200:
                    languages = lang_response.json()
                
                # Calculate quality scores
                quality_scores = calculate_quality_scores(repo_data, readme_content)
                
                # Determine complexity and maturity
                complexity, maturity = determine_complexity_and_maturity(repo_data, languages)
                
                # Extract installation commands
                installations = extract_installation_commands(readme_content)
                
                # Update main server data
                cursor.execute("""
                    UPDATE mcp_servers SET 
                        stars = %s, forks = %s, watchers = %s, 
                        open_issues = %s, last_updated = %s, repo_created_at = %s,
                        quality_score = %s, quality_documentation = %s,
                        quality_maintenance = %s, quality_community = %s,
                        quality_performance = %s, complexity = %s, maturity = %s,
                        is_official = %s, updated_at = NOW()
                    WHERE github_url = %s
                """, (
                    repo_data.get('stargazers_count', 0),
                    repo_data.get('forks_count', 0),
                    repo_data.get('watchers_count', 0),
                    repo_data.get('open_issues_count', 0),
                    repo_data.get('updated_at'),
                    repo_data.get('created_at'),
                    sum(quality_scores.values()) // len(quality_scores),
                    quality_scores['documentation'],
                    quality_scores['maintenance'],
                    quality_scores['community'],
                    quality_scores['performance'],
                    complexity,
                    maturity,
                    owner.lower() in ['microsoft', 'google', 'amazon', 'facebook', 'apple', 'anthropic'],
                    github_url
                ))
                
                # Update installation methods
                if installations:
                    cursor.execute("DELETE FROM server_installation WHERE server_id = %s", (server_id,))
                    for install in installations:
                        cursor.execute("""
                            INSERT INTO server_installation (server_id, method, command)
                            VALUES (%s, %s, %s)
                        """, (server_id, install['method'], install['command']))
                
                # Update tech stack
                tech_stack = list(languages.keys())[:5]  # Top 5 languages
                if tech_stack:
                    cursor.execute("DELETE FROM server_tech_stack WHERE server_id = %s", (server_id,))
                    for tech in tech_stack:
                        cursor.execute("""
                            INSERT INTO server_tech_stack (server_id, technology)
                            VALUES (%s, %s)
                        """, (server_id, tech))
                
                # Update README
                if readme_content:
                    content_hash = hashlib.md5(readme_content.encode()).hexdigest()
                    cursor.execute("""
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
                        'README.md',
                        slug,
                        readme_content,
                        content_hash,
                        len(readme_content.encode())
                    ))
                
                conn.commit()
                print(f"   ✅ Updated ({repo_data.get('stargazers_count', 0)}⭐)")
                updated += 1
                
                # Progress report every 25 servers
                if i % 25 == 0:
                    elapsed = time.time() - start_time
                    remaining = len(servers) - i
                    eta = (elapsed / i) * remaining if i > 0 else 0
                    
                    print(f"\n📈 Progress: {actual_position}/{total_servers} ({actual_position/total_servers*100:.1f}%)")
                    print(f"   Updated: {updated}, Skipped: {skipped}, Errors: {errors}")
                    print(f"   Time: {elapsed/60:.1f}m elapsed, {eta/60:.1f}m remaining")
                    print(f"   Rate limit: {response.headers.get('X-RateLimit-Remaining', 'unknown')} requests left")
                    print(f"   Last processed: {slug}")
                    print(f"   💡 To resume from here: python3 run_full_update.py {slug}")
                    print()
                
                # Rate limiting with dynamic delay
                time.sleep(current_delay)
                
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:50]}...")
                conn.rollback()
                errors += 1
                time.sleep(current_delay * 2)  # Longer delay on errors
        
        elapsed = time.time() - start_time
        print(f"\n🎉 Update Complete!")
        print(f"   Total time: {elapsed/60:.1f} minutes")
        print(f"   Range processed: {start_index+1} to {start_index+len(servers)}")
        print(f"   Updated: {updated}")
        print(f"   Skipped: {skipped}")
        print(f"   Errors: {errors}")
        print(f"   Success rate: {updated/(updated+errors)*100:.1f}%" if (updated+errors) > 0 else "   No updates attempted")
        
    except KeyboardInterrupt:
        print(f"\n⏹️  Update interrupted!")
        conn.rollback()
        elapsed = time.time() - start_time
        print(f"   Progress after {elapsed/60:.1f}m: {updated} updated, {skipped} skipped, {errors} errors")
        if i < len(servers):
            next_server = servers[i].get('name', '').replace('/', '_') if i < len(servers) else None
            if next_server:
                print(f"   💡 To resume from next server: python3 run_full_update.py {next_server}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()