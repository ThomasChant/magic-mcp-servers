#!/usr/bin/env python3
"""
Fixed update script - handles database schema correctly

Usage:
    python3 run_update_fixed.py                    # Start from beginning  
    python3 run_update_fixed.py <server_name>      # Resume from specific server
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
import hashlib
import logging

# Set up logging
log_filename = f"update_fixed_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration
GITHUB_API_TOKEN = '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'
GITHUB_API_BASE = "https://api.github.com"
HEADERS = {
    "Accept": "application/vnd.github.v3+json"
}
if GITHUB_API_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_API_TOKEN}"

# Database configuration
DATABASE_CONFIG = {
    'host': 'aws-0-us-east-2.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.lptsvryohchbklxcyoyc',
    'password': 'xgCT84482819'
}

BASE_DELAY = 0.2

def safe_insert_installation(cursor, server_id: str, method: str, command: str):
    """Safely insert installation method with duplicate handling"""
    try:
        cursor.execute("""
            INSERT INTO server_installation (server_id, method, command)
            VALUES (%s, %s, %s)
            ON CONFLICT (server_id, method) 
            DO UPDATE SET command = EXCLUDED.command
        """, (server_id, method, command))
        return True
    except Exception as e:
        logger.error(f"Error inserting installation: {str(e)}")
        return False

def safe_insert_tech_stack(cursor, server_id: str, technology: str):
    """Safely insert technology with duplicate handling"""
    try:
        cursor.execute("""
            INSERT INTO server_tech_stack (server_id, technology)
            VALUES (%s, %s)
            ON CONFLICT (server_id, technology) DO NOTHING
        """, (server_id, technology))
        return True
    except Exception as e:
        logger.error(f"Error inserting tech stack: {str(e)}")
        return False

def safe_insert_readme(cursor, server_id: str, readme_data: Dict):
    """Safely insert/update README with proper error handling"""
    try:
        cursor.execute("""
            INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (server_id, filename)
            DO UPDATE SET 
                raw_content = EXCLUDED.raw_content,
                content_hash = EXCLUDED.content_hash,
                file_size = EXCLUDED.file_size
        """, (
            server_id,
            readme_data.get('filename', 'README.md'),
            readme_data.get('project_name', ''),
            readme_data.get('content', ''),
            readme_data.get('content_hash', ''),
            readme_data.get('file_size', 0)
        ))
        return True
    except Exception as e:
        logger.error(f"Error inserting README for {server_id}: {str(e)}")
        return False

def calculate_quality_scores(repo_data: Dict, readme_content: str) -> Dict[str, int]:
    """Calculate quality scores based on repository data"""
    scores = {
        'documentation': 0,
        'maintenance': 0,
        'community': 0,
        'performance': 50
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
        community_score += min(stars // 10, 20)
    if forks > 0:
        community_score += min(forks // 5, 15)
    
    scores['community'] = min(community_score, 100)
    
    # Maintenance scoring
    maintenance_score = 0
    last_updated = repo_data.get('updated_at')
    if last_updated:
        try:
            last_update = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
            days_since_update = (datetime.now(timezone.utc) - last_update).days
            if days_since_update < 30:
                maintenance_score += 25
            elif days_since_update < 90:
                maintenance_score += 12
        except:
            pass
    
    scores['maintenance'] = min(maintenance_score, 100)
    
    return scores

def determine_complexity_and_maturity(repo_data: Dict, languages: Dict) -> Tuple[str, str]:
    """Determine complexity and maturity levels"""
    complexity = 'medium'
    if len(languages) > 3 or repo_data.get('size', 0) > 10000:
        complexity = 'high'
    elif len(languages) <= 1 and repo_data.get('size', 0) < 1000:
        complexity = 'low'
    
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
        for match in matches[:2]:
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
    
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h', 'help']:
        print(__doc__)
        sys.exit(0)
    
    logger.info("🚀 Starting Fixed Repository Update")
    logger.info(f"Log file: {log_filename}")
    
    # Check for resume option
    start_from = None
    if len(sys.argv) > 1:
        start_from = sys.argv[1]
        logger.info(f"Resume mode: Starting from '{start_from}'")
    
    # Test database connection
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM mcp_servers;")
        server_count = cursor.fetchone()[0]
        logger.info(f"Connected to database ({server_count} servers found)")
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        sys.exit(1)
    
    # Load servers
    servers_file = '/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json'
    with open(servers_file, 'r') as f:
        servers = json.load(f)
    
    logger.info(f"Found {len(servers)} servers to process")
    
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
                logger.info(f"Found starting point: {slug} at position {i+1}")
                break
        
        if not found_start:
            logger.error(f"Could not find server '{start_from}' in the list")
            sys.exit(1)
        
        servers = servers[start_index:]
        logger.info(f"Skipping {start_index} servers, processing {len(servers)} remaining")
    
    # Set up GitHub fetcher
    session = requests.Session()
    session.headers.update(HEADERS)
    
    # Connect to database
    conn = psycopg2.connect(**DATABASE_CONFIG)
    conn.autocommit = False
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
            
            actual_position = start_index + i
            total_servers = start_index + len(servers)
            
            logger.info(f"[{actual_position}/{total_servers}] Processing: {slug}")
            
            if not github_url:
                logger.warning(f"Skipping {slug}: No GitHub URL")
                skipped += 1
                continue
            
            # Check if server exists
            cursor.execute("SELECT id FROM mcp_servers WHERE github_url = %s", (github_url,))
            result = cursor.fetchone()
            
            if not result:
                logger.warning(f"Skipping {slug}: Not found in database")
                skipped += 1
                continue
            
            server_id = result[0]
            
            # Parse GitHub URL
            try:
                parsed = urlparse(github_url)
                path_parts = parsed.path.strip('/').split('/')
                if len(path_parts) < 2:
                    logger.warning(f"Skipping {slug}: Invalid GitHub URL")
                    skipped += 1
                    continue
                
                owner, repo = path_parts[0], path_parts[1]
            except Exception as e:
                logger.error(f"Skipping {slug}: Error parsing URL - {e}")
                skipped += 1
                continue
            
            try:
                # Fetch repo data
                repo_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
                response = session.get(repo_url)
                
                rate_remaining = response.headers.get('X-RateLimit-Remaining', 'unknown')
                logger.info(f"Rate limit: {rate_remaining} remaining")
                
                if response.status_code != 200:
                    logger.warning(f"Skipping {slug}: API error {response.status_code}")
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
                        except Exception as e:
                            logger.warning(f"Failed to decode README for {slug}: {e}")
                
                # Fetch languages
                lang_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/languages"
                lang_response = session.get(lang_url)
                languages = {}
                
                if lang_response.status_code == 200:
                    languages = lang_response.json()
                
                # Calculate quality scores
                quality_scores = calculate_quality_scores(repo_data, readme_content)
                complexity, maturity = determine_complexity_and_maturity(repo_data, languages)
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
                        safe_insert_installation(cursor, server_id, install['method'], install['command'])
                
                # Update tech stack
                tech_stack = list(languages.keys())[:5]
                if tech_stack:
                    cursor.execute("DELETE FROM server_tech_stack WHERE server_id = %s", (server_id,))
                    for tech in tech_stack:
                        safe_insert_tech_stack(cursor, server_id, tech)
                
                # Update README
                if readme_content:
                    readme_data = {
                        'filename': 'README.md',
                        'project_name': slug,
                        'content': readme_content,
                        'content_hash': hashlib.md5(readme_content.encode()).hexdigest(),
                        'file_size': len(readme_content.encode())
                    }
                    safe_insert_readme(cursor, server_id, readme_data)
                
                conn.commit()
                logger.info(f"✅ Successfully updated {slug} ({repo_data.get('stargazers_count', 0)}⭐)")
                updated += 1
                
                # Progress report every 25 servers
                if i % 25 == 0:
                    elapsed = time.time() - start_time
                    remaining = len(servers) - i
                    eta = (elapsed / i) * remaining if i > 0 else 0
                    
                    logger.info(f"\n📈 Progress: {actual_position}/{total_servers} ({actual_position/total_servers*100:.1f}%)")
                    logger.info(f"   Updated: {updated}, Skipped: {skipped}, Errors: {errors}")
                    logger.info(f"   Time: {elapsed/60:.1f}m elapsed, {eta/60:.1f}m remaining")
                    logger.info(f"   💡 To resume: python3 run_update_fixed.py {slug}")
                
                time.sleep(BASE_DELAY)
                
            except Exception as e:
                logger.error(f"Error updating {slug}: {str(e)}")
                conn.rollback()
                errors += 1
                time.sleep(BASE_DELAY * 2)
        
        elapsed = time.time() - start_time
        logger.info(f"\n🎉 Update Complete!")
        logger.info(f"   Total time: {elapsed/60:.1f} minutes")
        logger.info(f"   Updated: {updated}, Skipped: {skipped}, Errors: {errors}")
        
    except KeyboardInterrupt:
        logger.info(f"\n⏹️  Update interrupted!")
        conn.rollback()
        if i < len(servers):
            next_server = servers[i].get('name', '').replace('/', '_') if i < len(servers) else None
            if next_server:
                logger.info(f"   💡 To resume: python3 run_update_fixed.py {next_server}")
    finally:
        cursor.close()
        conn.close()
        logger.info(f"Log saved to: {log_filename}")

if __name__ == "__main__":
    main()