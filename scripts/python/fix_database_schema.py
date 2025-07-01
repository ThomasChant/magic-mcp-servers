#!/usr/bin/env python3
"""
Fix database schema issues - add missing columns and constraints
"""
import psycopg2
import sys

# Database configuration
DATABASE_CONFIG = {
    'host': 'aws-0-us-east-2.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.lptsvryohchbklxcyoyc',
    'password': 'xgCT84482819'
}

def fix_database_schema():
    """Fix database schema issues"""
    print("🔧 Fixing database schema...")
    
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor()
        
        # 1. Check and add missing columns
        tables_to_fix = [
            ('server_installation', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()'),
            ('server_tech_stack', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()'),
            ('server_readmes', 'updated_at', 'TIMESTAMPTZ DEFAULT NOW()')
        ]
        
        for table, column, definition in tables_to_fix:
            print(f"Checking {table}.{column}...")
            
            # Check if column exists
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = %s AND column_name = %s
            """, (table, column))
            
            if not cursor.fetchone():
                print(f"  ➕ Adding {column} to {table}")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
            else:
                print(f"  ✅ {column} already exists in {table}")
        
        # 2. Add missing constraints (with proper syntax)
        constraints_to_add = [
            {
                'table': 'server_installation',
                'name': 'uk_server_installation_server_method',
                'columns': '(server_id, method)'
            },
            {
                'table': 'server_tech_stack', 
                'name': 'uk_server_tech_stack_server_technology',
                'columns': '(server_id, technology)'
            },
            {
                'table': 'server_readmes',
                'name': 'uk_server_readmes_server_filename', 
                'columns': '(server_id, filename)'
            }
        ]
        
        for constraint in constraints_to_add:
            print(f"Checking constraint {constraint['name']}...")
            
            # Check if constraint exists
            cursor.execute("""
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = %s AND constraint_name = %s
            """, (constraint['table'], constraint['name']))
            
            if not cursor.fetchone():
                print(f"  ➕ Adding constraint {constraint['name']}")
                try:
                    cursor.execute(f"""
                        ALTER TABLE {constraint['table']} 
                        ADD CONSTRAINT {constraint['name']} 
                        UNIQUE {constraint['columns']}
                    """)
                except psycopg2.errors.DuplicateTable:
                    print(f"  ⚠️  Constraint {constraint['name']} might already exist")
            else:
                print(f"  ✅ Constraint {constraint['name']} already exists")
        
        # 3. Add created_at columns if missing
        for table, _, _ in tables_to_fix:
            print(f"Checking {table}.created_at...")
            
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = %s AND column_name = 'created_at'
            """, (table,))
            
            if not cursor.fetchone():
                print(f"  ➕ Adding created_at to {table}")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()")
            else:
                print(f"  ✅ created_at already exists in {table}")
        
        conn.commit()
        print("✅ Database schema fixed successfully!")
        
        # 4. Show table structures
        print("\n📊 Current table structures:")
        for table, _, _ in tables_to_fix:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = %s
                ORDER BY ordinal_position
            """, (table,))
            
            columns = cursor.fetchall()
            print(f"\n{table}:")
            for col_name, data_type, nullable, default in columns:
                print(f"  - {col_name}: {data_type} ({'NULL' if nullable == 'YES' else 'NOT NULL'}) {f'DEFAULT {default}' if default else ''}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error fixing schema: {e}")
        sys.exit(1)

if __name__ == "__main__":
    fix_database_schema()