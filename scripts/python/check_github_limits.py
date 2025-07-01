#!/usr/bin/env python3
"""
Check current GitHub API rate limiting status
"""
import os
import requests
from datetime import datetime

GITHUB_API_TOKEN = os.environ.get('GITHUB_TOKEN', '')
GITHUB_API_BASE = "https://api.github.com"
HEADERS = {
    "Accept": "application/vnd.github.v3+json"
}
if GITHUB_API_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_API_TOKEN}"

def check_rate_limits():
    """Check GitHub API rate limits"""
    print("🔍 Checking GitHub API Rate Limits")
    print("=" * 50)
    
    if GITHUB_API_TOKEN:
        print("✅ GitHub token configured")
    else:
        print("⚠️  No GitHub token - using unauthenticated limits")
    
    try:
        # Check rate limits
        response = requests.get(f"{GITHUB_API_BASE}/rate_limit", headers=HEADERS)
        
        if response.status_code == 200:
            data = response.json()
            
            # Core API limits
            core = data.get('resources', {}).get('core', {})
            print(f"\n📊 Core API:")
            print(f"   Limit: {core.get('limit', 'unknown')}/hour")
            print(f"   Used: {core.get('used', 'unknown')}")
            print(f"   Remaining: {core.get('remaining', 'unknown')}")
            
            reset_time = core.get('reset')
            if reset_time:
                reset_dt = datetime.fromtimestamp(reset_time)
                print(f"   Resets at: {reset_dt.strftime('%H:%M:%S')} ({reset_dt.strftime('%Y-%m-%d')})")
            
            # Search API limits
            search = data.get('resources', {}).get('search', {})
            print(f"\n🔍 Search API:")
            print(f"   Limit: {search.get('limit', 'unknown')}/hour")
            print(f"   Used: {search.get('used', 'unknown')}")
            print(f"   Remaining: {search.get('remaining', 'unknown')}")
            
            # Recommendations
            remaining = core.get('remaining', 0)
            if remaining < 50:
                print(f"\n⚠️  WARNING: Very low rate limit remaining!")
                print(f"   Consider waiting until reset or using shorter delays")
            elif remaining < 200:
                print(f"\n⚠️  CAUTION: Moderate rate limit remaining")
                print(f"   Consider using longer delays between requests")
            else:
                print(f"\n✅ Good rate limit status")
            
            # Calculate recommended delay
            if remaining > 0:
                hours_until_reset = (reset_time - datetime.now().timestamp()) / 3600 if reset_time else 1
                recommended_delay = (hours_until_reset * 3600) / remaining
                print(f"   Recommended delay: {recommended_delay:.1f} seconds between requests")
            
        else:
            print(f"❌ Failed to check rate limits: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking rate limits: {e}")

if __name__ == "__main__":
    check_rate_limits()