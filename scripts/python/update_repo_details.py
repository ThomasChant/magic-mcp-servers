#!/usr/bin/env python3
"""
Fetch repository details from GitHub and generate SQL update statements for MCP Hub database.
Optimized version with comprehensive data extraction and SQL output.
"""
import json
import os
import time
import requests
import re
import sys
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

# Rate limiting configuration
RATE_LIMIT_THRESHOLD = 100  # Start slowing down when this many requests remain
BASE_DELAY = 0.2 if GITHUB_API_TOKEN else 0.75  # Delay between requests in seconds

# Quality scoring weights
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
                print(f"Rate limit exceeded. Waiting {wait_time:.0f} seconds...")
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
                response = self.session.get(url, params=params, timeout=30)
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 403:
                    if self._handle_rate_limit(response):
                        continue
                elif response.status_code == 404:
                    return None
                else:
                    print(f"Error {response.status_code} for {url}")
                    return None
                    
            except requests.exceptions.RequestException as e:
                print(f"Request error (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    
        return None
        
    def extract_github_info(self, github_url: str) -> Optional[Dict[str, str]]:
        """Extract owner and repo name from GitHub URL"""
        if not github_url:
            return None
            
        parsed = urlparse(github_url.strip())
        path_parts = parsed.path.strip('/').split('/')
        
        if len(path_parts) >= 2:
            return {
                "owner": path_parts[0],
                "repo": path_parts[1].replace('.git', '')
            }
        return None
        
    def fetch_readme(self, owner: str, repo: str) -> Optional[str]:
        """Fetch README content from GitHub repository"""
        readme_names = ["README.md", "readme.md", "README.MD", "Readme.md", "README", "readme"]
        
        for readme_name in readme_names:
            url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{readme_name}"
            data = self._make_request(url)
            
            if data and 'content' in data:
                return base64.b64decode(data['content']).decode('utf-8')
                
        return None
        
    def fetch_repo_details(self, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """Fetch comprehensive repository details"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
        return self._make_request(url)
        
    def fetch_languages(self, owner: str, repo: str) -> Optional[Dict[str, int]]:
        """Fetch programming languages used in the repository"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/languages"
        return self._make_request(url)
        
    def fetch_contributors_stats(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch contributor statistics"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contributors"
        contributors = self._make_request(url, params={"per_page": 100})
        
        if not contributors:
            return {"count": 0, "top_contributors": []}
            
        return {
            "count": len(contributors),
            "top_contributors": [c['login'] for c in contributors[:5]]
        }
        
    def fetch_commit_activity(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch recent commit activity"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
        commits = self._make_request(url, params={"per_page": 100})
        
        if not commits:
            return {"recent_commits": 0, "commit_frequency": "inactive"}
            
        # Analyze commit frequency
        if len(commits) > 0:
            latest_commit = datetime.fromisoformat(commits[0]['commit']['author']['date'].replace('Z', '+00:00'))
            oldest_commit = datetime.fromisoformat(commits[-1]['commit']['author']['date'].replace('Z', '+00:00'))
            days_span = (latest_commit - oldest_commit).days or 1
            commits_per_day = len(commits) / days_span
            
            if commits_per_day > 1:
                frequency = "very_active"
            elif commits_per_day > 0.3:
                frequency = "active"
            elif commits_per_day > 0.1:
                frequency = "moderate"
            else:
                frequency = "low"
                
            return {
                "recent_commits": len(commits),
                "commit_frequency": frequency,
                "last_commit_date": latest_commit.isoformat()
            }
            
        return {"recent_commits": 0, "commit_frequency": "inactive"}
        
    def fetch_releases(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch release information"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/releases"
        releases = self._make_request(url, params={"per_page": 10})
        
        if not releases:
            return {"release_count": 0, "latest_version": None}
            
        latest = releases[0] if releases else None
        
        return {
            "release_count": len(releases),
            "latest_version": latest.get('tag_name') if latest else None,
            "latest_release_date": latest.get('published_at') if latest else None,
            "has_pre_releases": any(r.get('prerelease', False) for r in releases)
        }
        
    def fetch_issues_stats(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch issue statistics"""
        # Get open issues
        open_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues"
        open_issues = self._make_request(open_url, params={"state": "open", "per_page": 1})
        
        # Get closed issues
        closed_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues"
        closed_issues = self._make_request(closed_url, params={"state": "closed", "per_page": 100})
        
        closed_count = len(closed_issues) if closed_issues else 0
        
        return {
            "open_issues": open_issues[0]['number'] if open_issues else 0,
            "closed_issues": closed_count,
            "issue_close_rate": closed_count / (closed_count + (open_issues[0]['number'] if open_issues else 0)) if closed_count > 0 else 0
        }
        
    def fetch_package_json(self, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """Fetch and parse package.json"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/package.json"
        data = self._make_request(url)
        
        if data and 'content' in data:
            content = base64.b64decode(data['content']).decode('utf-8')
            return json.loads(content)
            
        return None
        
    def fetch_requirements_txt(self, owner: str, repo: str) -> Optional[List[str]]:
        """Fetch requirements.txt content"""
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/requirements.txt"
        data = self._make_request(url)
        
        if data and 'content' in data:
            content = base64.b64decode(data['content']).decode('utf-8')
            return [line.strip() for line in content.split('\n') if line.strip() and not line.startswith('#')]
            
        return None

class QualityAnalyzer:
    """Analyze repository quality metrics"""
    
    @staticmethod
    def analyze_readme(readme_content: str) -> Dict[str, Any]:
        """Analyze README quality and extract information"""
        if not readme_content:
            return {
                'score': 0,
                'has_installation': False,
                'has_usage': False,
                'has_api_docs': False,
                'has_examples': False,
                'has_configuration': False,
                'installation_commands': {}
            }
            
        readme_lower = readme_content.lower()
        
        # Check for sections
        has_installation = bool(re.search(r'#+\s*(installation|install|setup)', readme_lower))
        has_usage = bool(re.search(r'#+\s*(usage|getting started|quick start)', readme_lower))
        has_api_docs = bool(re.search(r'#+\s*(api|documentation|docs)', readme_lower))
        has_examples = bool(re.search(r'#+\s*(example|examples|demo)', readme_lower))
        has_configuration = bool(re.search(r'#+\s*(configuration|config|settings)', readme_lower))
        has_license = bool(re.search(r'#+\s*(license|licensing)', readme_lower))
        
        # Extract installation commands
        installation_commands = QualityAnalyzer._extract_installation_commands(readme_content)
        
        # Calculate documentation score
        score = 0
        if len(readme_content) > 500:
            score += QUALITY_WEIGHTS['documentation']['readme_length']
        if has_installation:
            score += QUALITY_WEIGHTS['documentation']['has_installation']
        if has_usage:
            score += QUALITY_WEIGHTS['documentation']['has_usage']
        if has_api_docs:
            score += QUALITY_WEIGHTS['documentation']['has_api_docs']
        if has_examples:
            score += QUALITY_WEIGHTS['documentation']['has_examples']
        if has_configuration:
            score += QUALITY_WEIGHTS['documentation']['has_configuration']
        if has_license:
            score += QUALITY_WEIGHTS['documentation']['has_license']
            
        return {
            'score': score,
            'has_installation': has_installation,
            'has_usage': has_usage,
            'has_api_docs': has_api_docs,
            'has_examples': has_examples,
            'has_configuration': has_configuration,
            'has_license': has_license,
            'installation_commands': installation_commands
        }
        
    @staticmethod
    def _extract_installation_commands(readme_content: str) -> Dict[str, str]:
        """Extract installation commands from README"""
        commands = {}
        
        # npm/yarn
        npm_match = re.search(r'npm\s+install\s+([^\s\n]+)', readme_content)
        if npm_match:
            commands['npm'] = f"npm install {npm_match.group(1)}"
            
        yarn_match = re.search(r'yarn\s+add\s+([^\s\n]+)', readme_content)
        if yarn_match:
            commands['yarn'] = f"yarn add {yarn_match.group(1)}"
            
        # pip
        pip_match = re.search(r'pip\s+install\s+([^\s\n]+)', readme_content)
        if pip_match:
            commands['pip'] = f"pip install {pip_match.group(1)}"
            
        # uv
        uv_match = re.search(r'uv\s+pip\s+install\s+([^\s\n]+)', readme_content)
        if uv_match:
            commands['uv'] = f"uv pip install {uv_match.group(1)}"
            
        # docker
        docker_match = re.search(r'docker\s+(?:run|pull)\s+([^\s\n]+)', readme_content)
        if docker_match:
            commands['docker'] = f"docker run {docker_match.group(1)}"
            
        return commands
        
    @staticmethod
    def calculate_quality_scores(repo_data: Dict[str, Any], readme_analysis: Dict[str, Any], 
                               commit_activity: Dict[str, Any], issues_stats: Dict[str, Any]) -> Dict[str, int]:
        """Calculate all quality scores"""
        
        # Documentation score
        doc_score = readme_analysis['score']
        
        # Maintenance score
        maint_score = 0
        if commit_activity['commit_frequency'] == 'very_active':
            maint_score += QUALITY_WEIGHTS['maintenance']['recent_commits']
        elif commit_activity['commit_frequency'] == 'active':
            maint_score += QUALITY_WEIGHTS['maintenance']['recent_commits'] * 0.7
        elif commit_activity['commit_frequency'] == 'moderate':
            maint_score += QUALITY_WEIGHTS['maintenance']['recent_commits'] * 0.4
            
        if repo_data.get('has_issues'):
            maint_score += QUALITY_WEIGHTS['maintenance']['issue_response'] * issues_stats['issue_close_rate']
            
        # Community score
        comm_score = 0
        stars = repo_data.get('stargazers_count', 0)
        if stars > 1000:
            comm_score += QUALITY_WEIGHTS['community']['stars']
        elif stars > 100:
            comm_score += QUALITY_WEIGHTS['community']['stars'] * 0.7
        elif stars > 10:
            comm_score += QUALITY_WEIGHTS['community']['stars'] * 0.4
            
        contributors = repo_data.get('contributors_count', 0)
        if contributors > 10:
            comm_score += QUALITY_WEIGHTS['community']['contributors']
        elif contributors > 3:
            comm_score += QUALITY_WEIGHTS['community']['contributors'] * 0.6
            
        # Performance score (simplified)
        perf_score = 50  # Default middle score
        
        # Overall quality score
        overall_score = int((doc_score + maint_score + comm_score + perf_score) / 4)
        
        return {
            'quality_score': overall_score,
            'quality_documentation': int(doc_score),
            'quality_maintenance': int(maint_score),
            'quality_community': int(comm_score),
            'quality_performance': int(perf_score)
        }
        
    @staticmethod
    def determine_complexity(repo_data: Dict[str, Any], languages: Dict[str, int]) -> str:
        """Determine project complexity"""
        size = repo_data.get('size', 0)
        language_count = len(languages) if languages else 0
        
        if size > 10000 or language_count > 5:
            return 'high'
        elif size > 1000 or language_count > 2:
            return 'medium'
        else:
            return 'low'
            
    @staticmethod
    def determine_maturity(repo_data: Dict[str, Any], releases: Dict[str, Any]) -> str:
        """Determine project maturity"""
        created_at = repo_data.get('created_at')
        if not created_at:
            return 'experimental'
            
        created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        age_days = (datetime.now(timezone.utc) - created_date).days
        
        if age_days < 90:
            return 'experimental'
        elif age_days < 365:
            return 'beta'
        elif releases.get('release_count', 0) > 5:
            return 'stable'
        else:
            return 'mature'
            
    @staticmethod
    def is_official_repository(owner: str, repo_data: Dict[str, Any]) -> bool:
        """Determine if repository is official based on owner and verification status"""
        # List of known official organizations for MCP servers
        official_orgs = [
            'anthropics',
            'modelcontextprotocol',
            'anthropic',
            'microsoft',
            'google',
            'facebook',
            'meta',
            'amazon',
            'apple',
            'netflix',
            'uber',
            'airbnb',
            'stripe',
            'square',
            'spotify',
            'twitter',
            'x',
            'github',
            'gitlab',
            'docker',
            'kubernetes',
            'hashicorp',
            'elastic',
            'mongodb',
            'redis',
            'postgresql',
            'mysql',
            'oracle',
            'ibm',
            'intel',
            'nvidia',
            'amd',
            'arm',
            'qualcomm',
            'samsung',
            'sony',
            'nintendo',
            'valve',
            'epic-games',
            'unity',
            'unreal-engine',
            'adobe',
            'autodesk',
            'jetbrains',
            'atlassian',
            'slack',
            'zoom',
            'salesforce',
            'sap',
            'oracle',
            'vmware',
            'redhat',
            'canonical',
            'suse',
            'mozilla',
            'apache',
            'eclipse',
            'linux',
            'python',
            'nodejs',
            'golang',
            'rust-lang',
            'ruby',
            'rails',
            'django',
            'vuejs',
            'angular',
            'react',
            'svelte',
            'emberjs',
            'jquery',
            'webpack',
            'babel',
            'eslint',
            'prettier',
            'typescript',
            'denoland',
            'npm',
            'yarnpkg',
            'pnpm',
            'cloudflare',
            'vercel',
            'netlify',
            'heroku',
            'digitalocean',
            'linode',
            'vultr',
            'aws',
            'azure',
            'gcp',
            'openai',
            'deepmind',
            'huggingface',
            'pytorch',
            'tensorflow',
            'keras',
            'scikit-learn',
            'pandas-dev',
            'numpy',
            'scipy',
            'matplotlib',
            'jupyter',
            'conda',
            'pypa',
            'psf'
        ]
        
        # Check if owner is in official organizations list (case insensitive)
        owner_lower = owner.lower()
        if owner_lower in official_orgs:
            return True
            
        # Check if the repository owner has organization type and is verified
        owner_type = repo_data.get('owner', {}).get('type', '')
        if owner_type == 'Organization':
            # For organizations, check if they have high stars/reputation
            stars = repo_data.get('stargazers_count', 0)
            if stars > 5000:  # High-star organizations are likely official
                return True
                
        # Check for verified badge (GitHub doesn't expose this directly via API,
        # but we can use heuristics like high stars + organization account)
        if owner_type == 'Organization' and repo_data.get('stargazers_count', 0) > 1000:
            # Additional checks for official patterns
            repo_name = repo_data.get('name', '').lower()
            if any(pattern in repo_name for pattern in ['official', 'core', 'foundation']):
                return True
                
        return False

class SQLGenerator:
    """Generate SQL update statements"""
    
    @staticmethod
    def escape_sql_string(value: Any) -> str:
        """Escape string for SQL"""
        if value is None:
            return 'NULL'
        if isinstance(value, bool):
            return 'TRUE' if value else 'FALSE'
        if isinstance(value, (int, float)):
            return str(value)
        if isinstance(value, list):
            # PostgreSQL array format
            escaped_items = [SQLGenerator.escape_sql_string(item) for item in value]
            return "ARRAY[" + ",".join(escaped_items) + "]"
        
        # String escaping
        value = str(value).replace("'", "''")
        return f"'{value}'"
        
    @staticmethod
    def generate_server_update(slug: str, data: Dict[str, Any]) -> List[str]:
        """Generate UPDATE statements for mcp_servers table using slug"""
        statements = []
        
        # Main server update
        update_fields = []
        
        # Repository stats
        if 'stargazers_count' in data:
            update_fields.append(f"stars = {data['stargazers_count']}")
        if 'forks_count' in data:
            update_fields.append(f"forks = {data['forks_count']}")
        if 'watchers_count' in data:
            update_fields.append(f"watchers = {data['watchers_count']}")
        if 'open_issues_count' in data:
            update_fields.append(f"open_issues = {data['open_issues_count']}")
            
        # Dates
        if 'updated_at' in data:
            update_fields.append(f"last_updated = {SQLGenerator.escape_sql_string(data['updated_at'])}")
        if 'created_at' in data:
            update_fields.append(f"repo_created_at = {SQLGenerator.escape_sql_string(data['created_at'])}")
            
        # Quality scores
        if 'quality_scores' in data:
            scores = data['quality_scores']
            update_fields.append(f"quality_score = {scores['quality_score']}")
            update_fields.append(f"quality_documentation = {scores['quality_documentation']}")
            update_fields.append(f"quality_maintenance = {scores['quality_maintenance']}")
            update_fields.append(f"quality_community = {scores['quality_community']}")
            update_fields.append(f"quality_performance = {scores['quality_performance']}")
            
        # Other metadata
        if 'complexity' in data:
            update_fields.append(f"complexity = {SQLGenerator.escape_sql_string(data['complexity'])}")
        if 'maturity' in data:
            update_fields.append(f"maturity = {SQLGenerator.escape_sql_string(data['maturity'])}")
        if 'is_official' in data:
            update_fields.append(f"is_official = {SQLGenerator.escape_sql_string(data['is_official'])}")
            
        # Version information
        if 'latest_version' in data:
            update_fields.append(f"node_version = {SQLGenerator.escape_sql_string(data['latest_version'])}")
            
        if update_fields:
            sql = f"UPDATE mcp_servers SET {', '.join(update_fields)}, updated_at = NOW() WHERE slug = {SQLGenerator.escape_sql_string(slug)};"
            statements.append(sql)
            
        return statements
        
    @staticmethod
    def generate_installation_inserts(server_id: str, commands: Dict[str, str]) -> List[str]:
        """Generate INSERT statements for server_installation table"""
        statements = []
        
        for method, command in commands.items():
            sql = f"""
INSERT INTO server_installation (server_id, method, command) 
VALUES ({SQLGenerator.escape_sql_string(server_id)}, {SQLGenerator.escape_sql_string(method)}, {SQLGenerator.escape_sql_string(command)})
ON CONFLICT (server_id, method) 
DO UPDATE SET command = EXCLUDED.command, created_at = NOW();"""
            statements.append(sql.strip())
            
        return statements
        
    @staticmethod
    def generate_tech_stack_inserts(server_id: str, languages: Dict[str, int]) -> List[str]:
        """Generate INSERT statements for server_tech_stack table"""
        statements = []
        
        if languages:
            # Sort by bytes used (descending)
            sorted_langs = sorted(languages.items(), key=lambda x: x[1], reverse=True)
            
            # Take top 5 languages
            for lang, _ in sorted_langs[:5]:
                sql = f"""
INSERT INTO server_tech_stack (server_id, technology) 
VALUES ({SQLGenerator.escape_sql_string(server_id)}, {SQLGenerator.escape_sql_string(lang)})
ON CONFLICT (server_id, technology) DO NOTHING;"""
                statements.append(sql.strip())
                
        return statements
        
    @staticmethod
    def generate_readme_update(server_id: str, readme_content: str, filename: str = "README.md") -> str:
        """Generate INSERT/UPDATE for server_readmes table"""
        content_hash = hashlib.sha256(readme_content.encode()).hexdigest()
        
        sql = f"""
INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) 
VALUES (
    {SQLGenerator.escape_sql_string(server_id)}, 
    {SQLGenerator.escape_sql_string(filename)}, 
    {SQLGenerator.escape_sql_string(server_id)}, 
    {SQLGenerator.escape_sql_string(readme_content)}, 
    {SQLGenerator.escape_sql_string(content_hash)}, 
    {len(readme_content)}
)
ON CONFLICT (server_id) 
DO UPDATE SET 
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();"""
        
        return sql.strip()

def main():
    # Check for GitHub token
    if not GITHUB_API_TOKEN:
        print("WARNING: No GitHub token found. Using unauthenticated requests (60/hour limit)")
        print("Set GITHUB_TOKEN environment variable for higher rate limits (5000/hour)")
        response = input("Continue without token? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Load server data
    data_file = "/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json"
    output_file = "/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/scripts/sql/update_repo_details.sql"
    
    print(f"Reading servers from {data_file}")
    with open(data_file, 'r', encoding='utf-8') as f:
        servers = json.load(f)
    
    servers = servers[:10]
    
    print(f"Found {len(servers)} servers to process")
    
    # Initialize components
    fetcher = GitHubFetcher()
    sql_statements = []
    
    # Add header to SQL file
    sql_statements.append("-- MCP Servers Repository Details Update")
    sql_statements.append(f"-- Generated at: {datetime.utcnow().isoformat()}Z")
    sql_statements.append("-- This script updates repository information fetched from GitHub\n")
    sql_statements.append("BEGIN;")
    
    # Statistics
    success_count = 0
    skip_count = 0
    error_count = 0
    
    # Process each server
    for i, server in enumerate(servers, 1):
        name = server.get('name', '')
        github_url = server.get('githubUrl', '')
        
        print(f"\n[{i}/{len(servers)}] Processing: {name}")
        print(f"  Remaining API calls: {fetcher.rate_limit_remaining}")
        
        # Skip if no GitHub URL
        if not github_url:
            print("  - No GitHub URL, skipping")
            skip_count += 1
            continue
        
        # Extract GitHub info
        github_info = fetcher.extract_github_info(github_url)
        if not github_info:
            print(f"  - Invalid GitHub URL: {github_url}")
            error_count += 1
            continue
        
        owner = github_info['owner']
        repo = github_info['repo']
        
        # Generate slug and server_id based on owner and repo name
        # Based on existing data format: slug is owner+repo (no separator, lowercase)
        # server_id uses underscore separator
        server_id = f"{owner}_{repo}"
        special_repos = ['modelcontextprotocol','awslabs','rusiaaman','quarkiverse','mastra-ai']
        if repo in special_repos:
            print(f"  - Special repo: {server_id}")
            skip_count += 1
            continue
        
        # slug = f"{owner}_{repo}"
        print(f"- Server ID: {server_id}")
        
        try:
            # Fetch repository details
            print(f"  - Fetching repo details from {owner}/{repo}")
            repo_details = fetcher.fetch_repo_details(owner, repo)
            
            if not repo_details:
                print("  - Repository not found or inaccessible")
                error_count += 1
                continue
            
            # Prepare update data
            update_data = {
                'stargazers_count': repo_details.get('stargazers_count', 0),
                'forks_count': repo_details.get('forks_count', 0),
                'watchers_count': repo_details.get('watchers_count', 0),
                'open_issues_count': repo_details.get('open_issues_count', 0),
                'updated_at': repo_details.get('updated_at'),
                'created_at': repo_details.get('created_at')
            }
            
            # Fetch additional data
            print("  - Fetching languages...")
            languages = fetcher.fetch_languages(owner, repo)
            
            print("  - Fetching commit activity...")
            commit_activity = fetcher.fetch_commit_activity(owner, repo)
            
            print("  - Fetching issue stats...")
            issues_stats = fetcher.fetch_issues_stats(owner, repo)
            
            print("  - Fetching releases...")
            releases = fetcher.fetch_releases(owner, repo)
            if releases['latest_version']:
                update_data['latest_version'] = releases['latest_version']
            
            print("  - Fetching README...")
            readme_content = fetcher.fetch_readme(owner, repo)
            
            # Analyze README
            readme_analysis = QualityAnalyzer.analyze_readme(readme_content)
            
            # Calculate quality scores
            update_data['quality_scores'] = QualityAnalyzer.calculate_quality_scores(
                repo_details, readme_analysis, commit_activity, issues_stats
            )
            
            # Determine complexity and maturity
            update_data['complexity'] = QualityAnalyzer.determine_complexity(repo_details, languages)
            update_data['maturity'] = QualityAnalyzer.determine_maturity(repo_details, releases)
            
            # Determine if repository is official
            update_data['is_official'] = QualityAnalyzer.is_official_repository(owner, repo_details)
            print(f"  - Is official repository: {update_data['is_official']}")
            
            # Generate SQL statements
            print("  - Generating SQL statements...")
            
            # Server update (using slug)
            sql_statements.extend(SQLGenerator.generate_server_update(server_id, update_data))
            
            # Installation commands (using server_id)
            if readme_analysis['installation_commands']:
                sql_statements.extend(SQLGenerator.generate_installation_inserts(
                    server_id, readme_analysis['installation_commands']
                ))
            
            # Tech stack (using server_id)
            if languages:
                sql_statements.extend(SQLGenerator.generate_tech_stack_inserts(server_id, languages))
            
            # README content (using server_id)
            if readme_content:
                sql_statements.append(SQLGenerator.generate_readme_update(server_id, readme_content))
            
            print(f"  - Successfully processed {name}")
            success_count += 1
            
        except Exception as e:
            print(f"  - Error processing {name}: {str(e)}")
            error_count += 1
            continue
    
    # Add footer to SQL file
    sql_statements.append("\nCOMMIT;")
    
    # Write SQL file
    print(f"\nWriting SQL statements to {output_file}")
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(sql_statements))
    
    # Summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Total servers: {len(servers)}")
    print(f"Successfully processed: {success_count}")
    print(f"Skipped: {skip_count}")
    print(f"Errors: {error_count}")
    print(f"\nSQL file saved to: {output_file}")
    print(f"Total SQL statements: {len(sql_statements)}")
    
    if success_count > 0:
        print("\nTo apply updates to database, run:")
        print(f"psql -h <host> -U <user> -d <database> -f {output_file}")

if __name__ == "__main__":
    main()