#!/usr/bin/env python3
"""Test the update_repo_details script with just one server"""

import json
import os
import sys

# Add the script directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from update_repo_details import GitHubFetcher, SQLGenerator

def test_single_server():
    # Load just the first server
    data_file = "/Users/fanchen/AIProjects/mcp-servers/mcp-enhance/src/data/merged_servers.json"
    
    print(f"Reading first server from {data_file}")
    with open(data_file, 'r', encoding='utf-8') as f:
        servers = json.load(f)
    
    if not servers:
        print("No servers found!")
        return
    
    # Test with first server
    server = servers[0]
    name = server.get('name', '')
    github_url = server.get('githubUrl', '')
    
    print(f"\nTesting with server: {name}")
    print(f"GitHub URL: {github_url}")
    
    # Initialize fetcher
    fetcher = GitHubFetcher()
    
    # Extract GitHub info
    github_info = fetcher.extract_github_info(github_url)
    if not github_info:
        print(f"Invalid GitHub URL: {github_url}")
        return
    
    owner = github_info['owner']
    repo = github_info['repo']
    
    # Generate slug and server_id
    slug = f"{owner}{repo}".lower()
    server_id = f"{owner}_{repo}"
    
    print(f"\nGenerated identifiers:")
    print(f"  Owner: {owner}")
    print(f"  Repo: {repo}")
    print(f"  Slug: {slug}")
    print(f"  Server ID: {server_id}")
    
    # Generate sample SQL
    sample_data = {
        'stargazers_count': 42,
        'forks_count': 10,
        'quality_scores': {
            'quality_score': 75,
            'quality_documentation': 80,
            'quality_maintenance': 70,
            'quality_community': 75,
            'quality_performance': 75
        }
    }
    
    print("\nSample SQL statements:")
    statements = SQLGenerator.generate_server_update(slug, sample_data)
    for stmt in statements:
        print(stmt)
    
    # Test installation SQL
    print("\nSample installation SQL:")
    install_cmds = {'npm': 'npm install test-package', 'pip': 'pip install test-package'}
    install_stmts = SQLGenerator.generate_installation_inserts(server_id, install_cmds)
    for stmt in install_stmts:
        print(stmt)

if __name__ == "__main__":
    test_single_server()