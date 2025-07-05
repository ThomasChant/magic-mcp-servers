#!/usr/bin/env python3
"""
Fix watchers data script - GitHub API watchers_count equals stargazers_count bug fix

This script specifically fixes the watchers data issue where GitHub API's watchers_count
field returns the same value as stargazers_count. The correct watchers count is in
the subscribers_count field.

Usage:
    python3 fix_watchers_data.py                    # Start from beginning
    python3 fix_watchers_data.py <server_name>      # Resume from specific server
    python3 fix_watchers_data.py --help             # Show this help
    python3 fix_watchers_data.py --batch-size=20    # Process in batches of 20

Features:
    - Detailed error logging
    - Only updates watchers field (safe operation)
    - Progress tracking and resume capability
    - Rate limiting with dynamic delays
    - Batch processing support
"""
import json
import os
import time
import requests
import sys
import psycopg2
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import urlparse
from datetime import datetime, timezone
import logging
from psycopg2 import sql, extras
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
log_filename = f"fix_watchers_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
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
GITHUB_API_TOKEN = os.getenv('GITHUB_TOKEN')
if not GITHUB_API_TOKEN:
    logger.error("❌ 错误: 未找到 GITHUB_TOKEN 环境变量")
    logger.error("请在 .env.local 文件中设置 GITHUB_TOKEN=your_token_here")
    sys.exit(1)

GITHUB_API_BASE = os.getenv("GITHUB_API_BASE_URL", "https://api.github.com")
HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "MCP-Hub-Watchers-Fix/1.0"
}
if GITHUB_API_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_API_TOKEN}"

# Database configuration from environment
DATABASE_CONFIG = {
    'host': os.getenv('SUPABASE_HOST', 'localhost'),
    'port': int(os.getenv('SUPABASE_PORT', '5432')),
    'database': os.getenv('SUPABASE_DATABASE', 'postgres'),
    'user': os.getenv('SUPABASE_USER'),
    'password': os.getenv('SUPABASE_PASSWORD')
}

# Validate required database configuration
if not all([DATABASE_CONFIG['user'], DATABASE_CONFIG['password']]):
    logger.error("❌ 错误: 数据库配置不完整")
    logger.error("请在 .env.local 文件中设置:")
    logger.error("  SUPABASE_USER=your_database_user")
    logger.error("  SUPABASE_PASSWORD=your_database_password")
    sys.exit(1)

# Rate limiting configuration
RATE_LIMIT_THRESHOLD = 100
BASE_DELAY = float(os.getenv("GITHUB_RATE_LIMIT_DELAY", "750")) / 1000  # Convert ms to seconds
MAX_RETRIES = 3

def get_github_repo_data(owner: str, repo: str, session: requests.Session) -> Optional[Dict]:
    """Fetch repository data from GitHub API with retry logic"""
    repo_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
    
    for attempt in range(MAX_RETRIES):
        try:
            response = session.get(repo_url)
            
            # Log rate limit info
            rate_remaining = response.headers.get('X-RateLimit-Remaining', 'unknown')
            rate_reset = response.headers.get('X-RateLimit-Reset', 'unknown')
            
            # Calculate dynamic delay
            current_delay = BASE_DELAY
            if rate_remaining != 'unknown':
                remaining_int = int(rate_remaining)
                if remaining_int < 50:
                    current_delay = BASE_DELAY * 4
                elif remaining_int < 100:
                    current_delay = BASE_DELAY * 2
                elif remaining_int < 200:
                    current_delay = BASE_DELAY * 1.5
            
            logger.info(f"Rate limit: {rate_remaining} remaining (delay: {current_delay:.1f}s)")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Repository {owner}/{repo} not found (404)")
                return None
            elif response.status_code == 403:
                reset_time = response.headers.get('X-RateLimit-Reset', 'unknown')
                if reset_time != 'unknown':
                    reset_datetime = datetime.fromtimestamp(int(reset_time))
                    logger.warning(f"Rate limited. Reset at: {reset_datetime}")
                    # Wait until reset time
                    current_time = datetime.now().timestamp()
                    wait_time = max(0, int(reset_time) - current_time + 1)
                    if wait_time > 0:
                        logger.info(f"Waiting {wait_time}s for rate limit reset...")
                        time.sleep(wait_time)
                        continue
                else:
                    logger.warning(f"Rate limited for {owner}/{repo}")
                    time.sleep(current_delay * 4)
                    continue
            else:
                logger.warning(f"API error {response.status_code} for {owner}/{repo}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(current_delay * (attempt + 1))
                    continue
                return None
            
            # Add delay between requests
            time.sleep(current_delay)
            
        except Exception as e:
            logger.error(f"Error fetching {owner}/{repo} (attempt {attempt + 1}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(current_delay * (attempt + 1))
                continue
            return None
    
    return None

def fix_watchers_for_server(cursor, server_id: str, github_url: str, session: requests.Session) -> bool:
    """Fix watchers data for a single server"""
    try:
        # Parse GitHub URL
        parsed = urlparse(github_url)
        path_parts = parsed.path.strip('/').split('/')
        if len(path_parts) < 2:
            logger.warning(f"Invalid GitHub URL: {github_url}")
            return False
        
        owner, repo = path_parts[0], path_parts[1]
        
        # Fetch repository data
        repo_data = get_github_repo_data(owner, repo, session)
        if not repo_data:
            return False
        
        # Get the correct watchers count (subscribers_count)
        correct_watchers = repo_data.get('subscribers_count', 0)
        stars = repo_data.get('stargazers_count', 0)
        old_watchers = repo_data.get('watchers_count', 0)  # This is wrong (equals stars)
        
        logger.info(f"📊 {owner}/{repo}: Stars={stars}, Old_Watchers={old_watchers}, Correct_Watchers={correct_watchers}")
        
        # Update only the watchers field
        cursor.execute("""
            UPDATE mcp_servers 
            SET watchers = %s, updated_at = NOW()
            WHERE id = %s
        """, (correct_watchers, server_id))
        
        logger.info(f"✅ Fixed watchers for {owner}/{repo}: {old_watchers} → {correct_watchers}")
        return True
        
    except Exception as e:
        logger.error(f"Error fixing watchers for server {server_id}: {e}")
        return False

def get_servers_from_database(cursor, batch_size: int = None, offset: int = 0) -> List[Dict]:
    """Get servers from database with optional batching"""
    query = """
        SELECT id, name, github_url, watchers, stars 
        FROM mcp_servers 
        WHERE github_url IS NOT NULL 
        AND github_url != ''
        ORDER BY stars DESC
    """
    
    if batch_size:
        query += f" LIMIT {batch_size} OFFSET {offset}"
    
    cursor.execute(query)
    return cursor.fetchall()

def main():
    """Main function to fix watchers data"""
    
    # Parse command line arguments
    batch_size = None
    start_from = None
    
    for arg in sys.argv[1:]:
        if arg in ['--help', '-h', 'help']:
            print(__doc__)
            sys.exit(0)
        elif arg.startswith('--batch-size='):
            batch_size = int(arg.split('=')[1])
        elif not arg.startswith('--'):
            start_from = arg
    
    logger.info("🔧 Starting Watchers Data Fix Script")
    logger.info(f"Log file: {log_filename}")
    if batch_size:
        logger.info(f"Batch processing mode: {batch_size} servers per batch")
    if start_from:
        logger.info(f"Resume mode: Starting from '{start_from}'")
    
    # Test database connection
    logger.info("Testing database connection...")
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor()
        
        # Check server count
        cursor.execute("SELECT COUNT(*) FROM mcp_servers WHERE github_url IS NOT NULL AND github_url != '';")
        server_count = cursor.fetchone()[0]
        logger.info(f"Connected to database ({server_count} servers with GitHub URLs found)")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        sys.exit(1)
    
    # Set up GitHub session
    session = requests.Session()
    session.headers.update(HEADERS)
    
    # Connect to database
    conn = psycopg2.connect(**DATABASE_CONFIG)
    conn.autocommit = False  # Use transactions
    cursor = conn.cursor()
    
    updated = 0
    skipped = 0
    errors = 0
    start_time = time.time()
    
    try:
        if batch_size:
            # Batch processing mode
            offset = 0
            batch_num = 1
            
            while True:
                logger.info(f"\n📦 Processing batch {batch_num} (offset: {offset})...")
                
                # Get batch of servers
                servers = get_servers_from_database(cursor, batch_size, offset)
                
                if not servers:
                    logger.info("No more servers to process")
                    break
                
                logger.info(f"Processing {len(servers)} servers in batch {batch_num}")
                
                # Process servers in batch
                for i, server in enumerate(servers, 1):
                    server_id, name, github_url, current_watchers, stars = server
                    
                    logger.info(f"[{i}/{len(servers)}] Processing: {name}")
                    
                    # Skip if we're in resume mode and haven't reached start point
                    if start_from and name.replace('/', '_') != start_from:
                        if not start_from in [name, name.replace('/', '_')]:
                            continue
                        else:
                            start_from = None  # Found start point, continue normally
                    
                    try:
                        # Start transaction
                        success = fix_watchers_for_server(cursor, server_id, github_url, session)
                        
                        if success:
                            conn.commit()
                            updated += 1
                        else:
                            conn.rollback()
                            skipped += 1
                            
                    except Exception as e:
                        logger.error(f"Error processing {name}: {e}")
                        conn.rollback()
                        errors += 1
                
                logger.info(f"✅ Batch {batch_num} completed: {updated} updated, {skipped} skipped, {errors} errors")
                
                # Move to next batch
                offset += batch_size
                batch_num += 1
                
                # Brief pause between batches
                if servers and len(servers) == batch_size:  # More batches to come
                    logger.info("⏸️  Pausing 2 seconds between batches...")
                    time.sleep(2)
        
        else:
            # Single pass mode
            servers = get_servers_from_database(cursor)
            logger.info(f"Processing {len(servers)} servers")
            
            start_processing = not start_from
            
            for i, server in enumerate(servers, 1):
                server_id, name, github_url, current_watchers, stars = server
                
                # Handle resume functionality
                if start_from and not start_processing:
                    if name.replace('/', '_') == start_from or name == start_from:
                        start_processing = True
                        logger.info(f"Found starting point: {name}")
                    else:
                        continue
                
                if not start_processing:
                    continue
                
                logger.info(f"[{i}/{len(servers)}] Processing: {name}")
                
                try:
                    success = fix_watchers_for_server(cursor, server_id, github_url, session)
                    
                    if success:
                        conn.commit()
                        updated += 1
                    else:
                        conn.rollback()
                        skipped += 1
                        
                    # Progress report every 25 servers
                    if i % 25 == 0:
                        elapsed = time.time() - start_time
                        remaining = len(servers) - i
                        eta = (elapsed / i) * remaining if i > 0 else 0
                        
                        logger.info(f"\n📈 Progress Report:")
                        logger.info(f"   Processed: {i}/{len(servers)} ({i/len(servers)*100:.1f}%)")
                        logger.info(f"   Updated: {updated}, Skipped: {skipped}, Errors: {errors}")
                        logger.info(f"   Time: {elapsed/60:.1f}m elapsed, {eta/60:.1f}m remaining")
                        logger.info(f"   Last processed: {name}")
                        
                except Exception as e:
                    logger.error(f"Error processing {name}: {e}")
                    conn.rollback()
                    errors += 1
        
        elapsed = time.time() - start_time
        logger.info(f"\n🎉 Watchers Fix Complete!")
        logger.info(f"   Total time: {elapsed/60:.1f} minutes")
        logger.info(f"   Updated: {updated}")
        logger.info(f"   Skipped: {skipped}")
        logger.info(f"   Errors: {errors}")
        logger.info(f"   Success rate: {updated/(updated+errors)*100:.1f}%" if (updated+errors) > 0 else "   No updates attempted")
        
        # Show some examples of fixed data
        logger.info(f"\n📊 Verification - checking some updated servers:")
        cursor.execute("""
            SELECT name, stars, watchers, forks 
            FROM mcp_servers 
            WHERE github_url IS NOT NULL 
            AND stars != watchers
            ORDER BY stars DESC 
            LIMIT 10
        """)
        
        fixed_servers = cursor.fetchall()
        if fixed_servers:
            logger.info("✅ Servers with correctly fixed watchers data:")
            for server in fixed_servers:
                name, stars, watchers, forks = server
                logger.info(f"   {name}: ⭐{stars} 👀{watchers} 🍴{forks}")
        else:
            logger.info("⚠️  No servers found with different stars/watchers values")
        
    except KeyboardInterrupt:
        logger.info(f"\n⏹️  Fix interrupted!")
        conn.rollback()
        elapsed = time.time() - start_time
        logger.info(f"   Progress after {elapsed/60:.1f}m: {updated} updated, {skipped} skipped, {errors} errors")
    
    finally:
        cursor.close()
        conn.close()
        logger.info(f"Log saved to: {log_filename}")

if __name__ == "__main__":
    main()