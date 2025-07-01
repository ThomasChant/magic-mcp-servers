#!/usr/bin/env python3
"""
Test database connection with different password formats
"""
import psycopg2
import sys
from urllib.parse import quote_plus

def test_connection(host, port, database, user, password):
    """Test database connection"""
    try:
        config = {
            'host': host,
            'port': port,
            'database': database,
            'user': user,
            'password': password
        }
        
        print(f"Testing connection:")
        print(f"  Host: {host}")
        print(f"  Port: {port}")
        print(f"  Database: {database}")
        print(f"  User: {user}")
        print(f"  Password: {'*' * len(password)}")
        
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        
        print(f"✅ Connection successful!")
        print(f"📄 Database version: {version[0]}")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def main():
    print("🔍 Testing database connection with different password formats...")
    
    # Original password from your connection string
    password_original = "kgCT844828190aws"
    
    # Try URL decoded version
    password_decoded = "kgCT844828190aws=0"
    
    # Database details
    host = "aws-0-us-east-2.pooler.supabase.com"
    port = 6543
    database = "postgres"
    user = "postgres.lptsvryohchbklxcyoyc"
    
    print("\n1. Testing with original password...")
    success1 = test_connection(host, port, database, user, password_original)
    
    print("\n2. Testing with decoded password (with =0)...")
    success2 = test_connection(host, port, database, user, password_decoded)
    
    if success1 or success2:
        correct_password = password_original if success1 else password_decoded
        print(f"\n✅ Correct password found: {correct_password}")
        print(f"🔧 Use this for your connection:")
        print(f"   postgresql://{user}:{quote_plus(correct_password)}@{host}:{port}/{database}")
    else:
        print("\n❌ Neither password format worked. Please check your credentials.")

if __name__ == "__main__":
    main()