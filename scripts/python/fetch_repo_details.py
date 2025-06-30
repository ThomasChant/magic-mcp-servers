#!/usr/bin/env python3
import json
import os
import time
import requests
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
import base64
from datetime import datetime

# GitHub API configuration
GITHUB_API_TOKEN = "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"
GITHUB_API_BASE = "https://api.github.com"
HEADERS = {
    "Authorization": f"token {GITHUB_API_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

# Rate limiting configuration
REQUESTS_PER_HOUR = 5000  # Authenticated rate limit
DELAY_BETWEEN_REQUESTS = 1  # 750ms delay between requests

def extract_github_info(github_url: str) -> Optional[Dict[str, str]]:
    """Extract owner and repo name from GitHub URL"""
    if not github_url:
        return None
    
    # Parse the URL
    parsed = urlparse(github_url.strip())
    
    # Extract path parts
    path_parts = parsed.path.strip('/').split('/')
    
    # GitHub URLs should have at least owner/repo
    if len(path_parts) >= 2:
        return {
            "owner": path_parts[0],
            "repo": path_parts[1]
        }
    
    return None

def fetch_readme(owner: str, repo: str) -> Optional[str]:
    """Fetch README content from GitHub repository"""
    # Try different README filenames
    readme_names = ["README.md", "readme.md", "README.MD", "Readme.md", "README", "readme"]
    
    for readme_name in readme_names:
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{readme_name}"
        
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Decode base64 content
                content = base64.b64decode(data['content']).decode('utf-8')
                return content
            elif response.status_code == 403:
                # Rate limit exceeded
                handle_rate_limit(response)
                return fetch_readme(owner, repo)  # Retry
            elif response.status_code == 404:
                # Try next README name
                continue
                
        except requests.exceptions.RequestException as e:
            print(f"Error fetching README for {owner}/{repo}: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error for {owner}/{repo}: {e}")
            return None
    
    return None

def fetch_repo_details(owner: str, repo: str) -> Optional[Dict[str, Any]]:
    """Fetch comprehensive repository details from GitHub API"""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract relevant information
            repo_details = {
                "name": data.get("name"),
                "full_name": data.get("full_name"),
                "description": data.get("description"),
                "html_url": data.get("html_url"),
                "created_at": data.get("created_at"),
                "updated_at": data.get("updated_at"),
                "pushed_at": data.get("pushed_at"),
                "size": data.get("size"),
                "stargazers_count": data.get("stargazers_count"),
                "watchers_count": data.get("watchers_count"),
                "forks_count": data.get("forks_count"),
                "open_issues_count": data.get("open_issues_count"),
                "language": data.get("language"),
                "license": data.get("license", {}).get("name") if data.get("license") else None,
                "topics": data.get("topics", []),
                "default_branch": data.get("default_branch"),
                "owner": {
                    "login": data.get("owner", {}).get("login"),
                    "type": data.get("owner", {}).get("type"),
                    "avatar_url": data.get("owner", {}).get("avatar_url"),
                    "html_url": data.get("owner", {}).get("html_url")
                },
                "has_issues": data.get("has_issues"),
                "has_projects": data.get("has_projects"),
                "has_downloads": data.get("has_downloads"),
                "has_wiki": data.get("has_wiki"),
                "has_pages": data.get("has_pages"),
                "archived": data.get("archived"),
                "disabled": data.get("disabled"),
                "visibility": data.get("visibility", "public"),
                "network_count": data.get("network_count"),
                "subscribers_count": data.get("subscribers_count")
            }
            
            return repo_details
            
        elif response.status_code == 403:
            # Rate limit exceeded
            handle_rate_limit(response)
            return fetch_repo_details(owner, repo)  # Retry
        elif response.status_code == 404:
            print(f"Repository not found: {owner}/{repo}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching repo details for {owner}/{repo}: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error for {owner}/{repo}: {e}")
        return None

def fetch_pull_requests_count(owner: str, repo: str) -> Optional[int]:
    """Fetch total count of pull requests"""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls"
    params = {"state": "all", "per_page": 1}
    
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=10)
        
        if response.status_code == 200:
            # Get total count from Link header
            link_header = response.headers.get('Link', '')
            if link_header:
                # Parse last page number from Link header
                import re
                match = re.search(r'page=(\d+)>; rel="last"', link_header)
                if match:
                    return int(match.group(1))
            # If no pagination, count items in response
            return len(response.json())
        elif response.status_code == 403:
            handle_rate_limit(response)
            return fetch_pull_requests_count(owner, repo)
            
    except Exception as e:
        print(f"Error fetching PR count for {owner}/{repo}: {e}")
    
    return None

def fetch_contributors_count(owner: str, repo: str) -> Optional[int]:
    """Fetch total count of contributors"""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contributors"
    params = {"per_page": 1, "anon": "true"}
    
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=10)
        
        if response.status_code == 200:
            # Get total count from Link header
            link_header = response.headers.get('Link', '')
            if link_header:
                # Parse last page number from Link header
                import re
                match = re.search(r'page=(\d+)>; rel="last"', link_header)
                if match:
                    return int(match.group(1))
            # If no pagination, count items in response
            return len(response.json())
        elif response.status_code == 403:
            handle_rate_limit(response)
            return fetch_contributors_count(owner, repo)
            
    except Exception as e:
        print(f"Error fetching contributors count for {owner}/{repo}: {e}")
    
    return None

def fetch_latest_release(owner: str, repo: str) -> Optional[Dict[str, Any]]:
    """Fetch latest release information"""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/releases/latest"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "tag_name": data.get("tag_name"),
                "name": data.get("name"),
                "published_at": data.get("published_at"),
                "body": data.get("body"),
                "prerelease": data.get("prerelease", False),
                "draft": data.get("draft", False)
            }
        elif response.status_code == 403:
            handle_rate_limit(response)
            return fetch_latest_release(owner, repo)
            
    except Exception:
        pass
    
    return None

def fetch_tags(owner: str, repo: str) -> Optional[List[Dict[str, Any]]]:
    """Fetch repository tags (versions)"""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/tags"
    params = {"per_page": 10}  # Get latest 10 tags
    
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=10)
        
        if response.status_code == 200:
            tags = response.json()
            return [{"name": tag.get("name"), "commit_sha": tag.get("commit", {}).get("sha")} 
                    for tag in tags]
        elif response.status_code == 403:
            handle_rate_limit(response)
            return fetch_tags(owner, repo)
            
    except Exception as e:
        print(f"Error fetching tags for {owner}/{repo}: {e}")
    
    return None

def fetch_package_json_version(owner: str, repo: str) -> Optional[str]:
    """Fetch version from package.json if it exists"""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/package.json"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            content = base64.b64decode(data['content']).decode('utf-8')
            package_data = json.loads(content)
            return package_data.get('version')
        elif response.status_code == 403:
            handle_rate_limit(response)
            return fetch_package_json_version(owner, repo)
            
    except Exception:
        pass
    
    return None

def fetch_languages(owner: str, repo: str) -> Optional[Dict[str, int]]:
    """Fetch programming languages used in the repository"""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/languages"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 403:
            handle_rate_limit(response)
            return fetch_languages(owner, repo)
            
    except Exception as e:
        print(f"Error fetching languages for {owner}/{repo}: {e}")
    
    return None

def handle_rate_limit(response):
    """Handle GitHub API rate limit"""
    reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
    if reset_time:
        wait_time = reset_time - time.time()
        if wait_time > 0:
            print(f"Rate limit exceeded. Waiting {wait_time:.0f} seconds...")
            time.sleep(wait_time + 1)

def sanitize_filename(name: str) -> str:
    """Sanitize filename for safe file system usage"""
    # Replace invalid characters
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        name = name.replace(char, '_')
    
    # Remove leading/trailing dots and spaces
    name = name.strip('. ')
    
    # Limit length
    if len(name) > 200:
        name = name[:200]
    
    return name

def main():
    # Load merged servers data
    data_file = "/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json"
    output_dir = "/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/repodetails"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Reading servers from {data_file}")
    with open(data_file, 'r', encoding='utf-8') as f:
        servers = json.load(f)
    
    print(f"Found {len(servers)} servers to process")
    
    # Statistics
    success_count = 0
    skip_count = 0
    error_count = 0
    
    # Process each server
    for i, server in enumerate(servers, 1):
        name = server.get('name', '')
        github_url = server.get('githubUrl', '')
        
        print(f"\n[{i}/{len(servers)}] Processing: {name}")
        
        # Skip if no GitHub URL
        if not github_url:
            print("  - No GitHub URL, skipping")
            skip_count += 1
            continue
        
        # Extract GitHub info
        github_info = extract_github_info(github_url)
        if not github_info:
            print(f"  - Invalid GitHub URL: {github_url}")
            error_count += 1
            continue
        
        owner = github_info['owner']
        repo = github_info['repo']
        
        # Check if details already exist
        safe_name = sanitize_filename(name)
        output_file = os.path.join(output_dir, f"{safe_name}.json")
        
        if os.path.exists(output_file):
            print(f"  - Details already exist: {output_file}")
            skip_count += 1
            continue
        
        # Initialize result object
        result = {
            "mcp_name": name,
            "mcp_description": server.get('description', ''),
            "mcp_id": server.get('id', ''),
            "fetch_timestamp": datetime.utcnow().isoformat() + "Z",
            "github_url": github_url
        }
        
        # Fetch repository details
        print(f"  - Fetching repo details from {owner}/{repo}")
        repo_details = fetch_repo_details(owner, repo)
        
        if repo_details:
            result["repository"] = repo_details
            
            # Fetch additional metrics with rate limiting
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Fetch programming languages
            print("  - Fetching programming languages...")
            languages = fetch_languages(owner, repo)
            if languages:
                result["repository"]["languages"] = languages
                # Calculate language percentages
                total_bytes = sum(languages.values())
                if total_bytes > 0:
                    language_percentages = {
                        lang: round(bytes_count / total_bytes * 100, 2)
                        for lang, bytes_count in languages.items()
                    }
                    result["repository"]["language_percentages"] = language_percentages
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Fetch PR count
            print("  - Fetching pull requests count...")
            pr_count = fetch_pull_requests_count(owner, repo)
            if pr_count is not None:
                result["repository"]["pull_requests_count"] = pr_count
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Fetch contributors count
            print("  - Fetching contributors count...")
            contributors_count = fetch_contributors_count(owner, repo)
            if contributors_count is not None:
                result["repository"]["contributors_count"] = contributors_count
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Fetch latest release
            print("  - Fetching latest release...")
            latest_release = fetch_latest_release(owner, repo)
            if latest_release:
                result["repository"]["latest_release"] = latest_release
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Fetch tags (versions)
            print("  - Fetching repository tags/versions...")
            tags = fetch_tags(owner, repo)
            if tags:
                result["repository"]["tags"] = tags
                # Extract current version from latest tag
                if tags and tags[0]:
                    result["repository"]["latest_version"] = tags[0]["name"]
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Try to fetch version from package.json
            print("  - Checking for package.json version...")
            package_version = fetch_package_json_version(owner, repo)
            if package_version:
                result["repository"]["package_json_version"] = package_version
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Fetch README
            print("  - Fetching README...")
            readme_content = fetch_readme(owner, repo)
            if readme_content:
                result["readme"] = readme_content
            
            # Save result
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
                print(f"  - Saved details to: {output_file}")
                success_count += 1
            except Exception as e:
                print(f"  - Error saving file: {e}")
                error_count += 1
        else:
            print("  - Failed to fetch repository details")
            error_count += 1
        
        # Rate limiting delay
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Total servers: {len(servers)}")
    print(f"Successfully fetched: {success_count}")
    print(f"Skipped: {skip_count}")
    print(f"Errors: {error_count}")
    print(f"\nRepository details saved to: {output_dir}")

if __name__ == "__main__":
    main()