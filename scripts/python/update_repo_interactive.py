#!/usr/bin/env python3
"""
Interactive version for updating repository details.
Prompts for database credentials and allows testing connection first.
"""
import json
import os
import time
import requests
import re
import sys
import psycopg2
import getpass
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

# GitHub API configuration
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

RATE_LIMIT_THRESHOLD = 100
BASE_DELAY = float(os.getenv("GITHUB_RATE_LIMIT_DELAY", "200")) / 1000  # Convert ms to seconds

def get_database_config():
    """Get database configuration from environment variables or prompt interactively"""
    print("🔧 Database Configuration")
    print("=" * 50)
    
    # Try to get from environment variables first
    host = os.getenv('SUPABASE_HOST')
    user = os.getenv('SUPABASE_USER') 
    password = os.getenv('SUPABASE_PASSWORD')
    port = int(os.getenv('SUPABASE_PORT', '5432'))
    database = os.getenv('SUPABASE_DATABASE', 'postgres')
    
    # If environment variables are not set, prompt interactively
    if not host:
        host = input("Database Host: ").strip()
        if not host:
            print("❌ 数据库主机地址是必需的")
            sys.exit(1)
    
    if not user:
        user = input("Database User: ").strip()
        if not user:
            print("❌ 数据库用户名是必需的")
            sys.exit(1)
    
    if not password:
        password = getpass.getpass("Database Password: ")
        if not password:
            print("❌ 数据库密码是必需的")
            sys.exit(1)
    
    return {
        'host': host,
        'port': port,
        'database': database,
        'user': user,
        'password': password
    }

def test_database_connection(config):
    """Test database connection"""
    print("\n🔍 Testing database connection...")
    try:
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        cursor.execute("SELECT COUNT(*) FROM mcp_servers;")
        server_count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        print(f"✅ Connection successful!")
        print(f"📄 Database version: {version[0][:50]}...")
        print(f"📊 Found {server_count} servers in mcp_servers table")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def quick_update_sample():
    """Update just a few servers as a test"""
    print("\n🧪 Quick Test Mode")
    print("=" * 50)
    
    # Get database config
    db_config = get_database_config()
    
    if not test_database_connection(db_config):
        print("❌ Cannot proceed without database connection")
        return
    
    # Load servers
    servers_file = '/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json'
    if not os.path.exists(servers_file):
        print(f"❌ Servers file not found: {servers_file}")
        return
    
    with open(servers_file, 'r') as f:
        servers = json.load(f)
    
    # Take first 5 servers for testing
    test_servers = servers[:5]
    
    print(f"\n🔄 Testing with {len(test_servers)} servers:")
    for i, server in enumerate(test_servers, 1):
        name = server.get('name', '')
        slug = name.replace('/', '_')
        print(f"   {i}. {slug}")
    
    confirm = input("\nProceed with test update? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Test cancelled")
        return
    
    # Connect to database
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()
    
    updated = 0
    skipped = 0
    
    try:
        for i, server in enumerate(test_servers, 1):
            name = server.get('name', '')
            slug = name.replace('/', '_')
            github_url = server.get('githubUrl', '')
            
            print(f"\n[{i}/{len(test_servers)}] Processing: {slug}")
            
            if not github_url:
                print(f"⏭️  Skipping: No GitHub URL")
                skipped += 1
                continue
            
            # Check if server exists
            cursor.execute("SELECT id FROM mcp_servers WHERE github_url = %s", (github_url,))
            result = cursor.fetchone()
            
            if not result:
                print(f"⏭️  Skipping: Not found in database")
                skipped += 1
                continue
            
            server_id = result[0]
            
            # Parse GitHub URL
            try:
                parsed = urlparse(github_url)
                path_parts = parsed.path.strip('/').split('/')
                if len(path_parts) < 2:
                    print(f"⏭️  Skipping: Invalid GitHub URL")
                    skipped += 1
                    continue
                
                owner, repo = path_parts[0], path_parts[1]
            except Exception as e:
                print(f"⏭️  Skipping: Error parsing URL - {e}")
                skipped += 1
                continue
            
            # Fetch basic repo data
            try:
                repo_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
                response = requests.get(repo_url, headers=HEADERS)
                
                if response.status_code != 200:
                    print(f"⏭️  Skipping: Could not fetch repo data (status: {response.status_code})")
                    skipped += 1
                    time.sleep(BASE_DELAY)
                    continue
                
                repo_data = response.json()
                
                # Simple update - just basic stats
                cursor.execute("""
                    UPDATE mcp_servers SET 
                        stars = %s, forks = %s, watchers = %s, 
                        open_issues = %s, last_updated = %s,
                        updated_at = NOW()
                    WHERE github_url = %s
                """, (
                    repo_data.get('stargazers_count', 0),
                    repo_data.get('forks_count', 0),
                    repo_data.get('watchers_count', 0),
                    repo_data.get('open_issues_count', 0),
                    repo_data.get('updated_at'),
                    github_url
                ))
                
                conn.commit()
                print(f"✅ Updated basic stats for {slug}")
                updated += 1
                
                time.sleep(BASE_DELAY)
                
            except Exception as e:
                print(f"❌ Error updating {slug}: {e}")
                conn.rollback()
                
        print(f"\n🎉 Test complete!")
        print(f"   Updated: {updated}")
        print(f"   Skipped: {skipped}")
        
    except KeyboardInterrupt:
        print(f"\n⏹️  Test interrupted")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def full_update_servers():
    """Update all servers with comprehensive data"""
    print("\n🚀 Full Update Mode")
    print("=" * 50)
    
    # Get database config
    db_config = get_database_config()
    
    if not test_database_connection(db_config):
        print("❌ Cannot proceed without database connection")
        return
    
    # Load servers
    servers_file = '/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json'
    if not os.path.exists(servers_file):
        print(f"❌ Servers file not found: {servers_file}")
        return
    
    with open(servers_file, 'r') as f:
        servers = json.load(f)
    
    print(f"\n📊 Found {len(servers)} servers to update")
    
    # Ask for confirmation
    print("\n⚠️  This will update ALL servers in the database with:")
    print("   - Repository statistics (stars, forks, watchers)")
    print("   - Quality scores (documentation, maintenance, community)")
    print("   - Installation instructions")
    print("   - Technology stack")
    print("   - README content")
    print()
    print("   This process may take several hours depending on rate limits.")
    
    confirm = input("Proceed with FULL update? Type 'YES' to confirm: ").strip()
    if confirm != 'YES':
        print("❌ Full update cancelled")
        return
    
    # Set up GitHub fetcher with rate limiting
    session = requests.Session()
    session.headers.update(HEADERS)
    
    # Connect to database
    conn = psycopg2.connect(**db_config)
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
            
            print(f"\n[{i}/{len(servers)}] Processing: {slug}")
            
            if not github_url:
                print(f"⏭️  Skipping: No GitHub URL")
                skipped += 1
                continue
            
            # Check if server exists in database
            cursor.execute("SELECT id FROM mcp_servers WHERE github_url = %s", (github_url,))
            result = cursor.fetchone()
            
            if not result:
                print(f"⏭️  Skipping: Not found in database")
                skipped += 1
                continue
            
            server_id = result[0]
            
            # Parse GitHub URL
            try:
                parsed = urlparse(github_url)
                path_parts = parsed.path.strip('/').split('/')
                if len(path_parts) < 2:
                    print(f"⏭️  Skipping: Invalid GitHub URL")
                    skipped += 1
                    continue
                
                owner, repo = path_parts[0], path_parts[1]
            except Exception as e:
                print(f"⏭️  Skipping: Error parsing URL - {e}")
                skipped += 1
                continue
            
            try:
                # Fetch comprehensive repo data
                print(f"   🔍 Fetching repository data...")
                repo_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
                response = session.get(repo_url)
                
                if response.status_code != 200:
                    print(f"⏭️  Skipping: Could not fetch repo data (status: {response.status_code})")
                    skipped += 1
                    time.sleep(BASE_DELAY)
                    continue
                
                repo_data = response.json()
                
                # Fetch README
                print(f"   📄 Fetching README...")
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
                print(f"   💻 Fetching languages...")
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
                print(f"   💾 Updating server metadata...")
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
                    print(f"   📦 Updating installation methods...")
                    cursor.execute("DELETE FROM server_installation WHERE server_id = %s", (server_id,))
                    for install in installations:
                        cursor.execute("""
                            INSERT INTO server_installation (server_id, method, command)
                            VALUES (%s, %s, %s)
                        """, (server_id, install['method'], install['command']))
                
                # Update tech stack
                tech_stack = list(languages.keys())[:5]  # Top 5 languages
                if tech_stack:
                    print(f"   🔧 Updating technology stack...")
                    cursor.execute("DELETE FROM server_tech_stack WHERE server_id = %s", (server_id,))
                    for tech in tech_stack:
                        cursor.execute("""
                            INSERT INTO server_tech_stack (server_id, technology)
                            VALUES (%s, %s)
                        """, (server_id, tech))
                
                # Update README
                if readme_content:
                    print(f"   📖 Updating README content...")
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
                print(f"✅ Successfully updated {slug}")
                updated += 1
                
                # Progress report every 10 servers
                if i % 10 == 0:
                    elapsed = time.time() - start_time
                    remaining = len(servers) - i
                    eta = (elapsed / i) * remaining if i > 0 else 0
                    
                    print(f"\n📈 Progress Report:")
                    print(f"   Processed: {i}/{len(servers)} ({i/len(servers)*100:.1f}%)")
                    print(f"   Updated: {updated}, Skipped: {skipped}, Errors: {errors}")
                    print(f"   Elapsed: {elapsed/60:.1f}m, ETA: {eta/60:.1f}m")
                    print(f"   Rate limit remaining: {response.headers.get('X-RateLimit-Remaining', 'unknown')}")
                
                # Rate limiting
                time.sleep(BASE_DELAY)
                
            except Exception as e:
                print(f"❌ Error updating {slug}: {e}")
                conn.rollback()
                errors += 1
                time.sleep(BASE_DELAY * 2)  # Longer delay on errors
        
        elapsed = time.time() - start_time
        print(f"\n🎉 Full update complete!")
        print(f"   Total time: {elapsed/60:.1f} minutes")
        print(f"   Updated: {updated}")
        print(f"   Skipped: {skipped}")
        print(f"   Errors: {errors}")
        
    except KeyboardInterrupt:
        print(f"\n⏹️  Update interrupted by user")
        conn.rollback()
        print(f"   Progress: {updated} updated, {skipped} skipped, {errors} errors")
    finally:
        cursor.close()
        conn.close()

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
    """Main interactive function"""
    print("🚀 Interactive MCP Repository Updater")
    print("=" * 50)
    
    if not GITHUB_API_TOKEN:
        print("⚠️  No GITHUB_TOKEN found in environment")
        print("   Without a token, you're limited to 60 requests/hour")
        print("   Consider setting GITHUB_TOKEN for higher limits (5000/hour)")
        print()
    else:
        print("✅ GitHub token found - using higher rate limits")
        print()
    
    print("Choose an option:")
    print("1. Quick test (update 5 servers)")
    print("2. Full update (all servers)")
    print("3. Exit")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        quick_update_sample()
    elif choice == "2":
        full_update_servers()
    elif choice == "3":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()