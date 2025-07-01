#!/usr/bin/env python3
"""
Split large SQL file into smaller chunks for execution.
Each chunk will contain a complete set of server updates.
"""

import os
import sys
from pathlib import Path


def split_sql_file(input_file, output_dir, servers_per_chunk=100):
    """
    Split SQL file into smaller chunks based on number of servers.
    
    Args:
        input_file: Path to the large SQL file
        output_dir: Directory to save split files
        servers_per_chunk: Number of server updates per chunk
    """
    input_path = Path(input_file)
    output_path = Path(output_dir)
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Read the file and process
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find header and footer
    header_lines = []
    footer_lines = []
    main_content_start = 0
    main_content_end = len(lines)
    
    # Find BEGIN statement
    for i, line in enumerate(lines):
        if line.strip() == 'BEGIN;':
            header_lines = lines[:i+1]
            main_content_start = i + 1
            break
    
    # Find COMMIT statement from the end
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == 'COMMIT;':
            footer_lines = [lines[i]]
            main_content_end = i
            break
    
    # Process main content
    server_blocks = []
    current_block = []
    server_count = 0
    i = main_content_start
    
    while i < main_content_end:
        line = lines[i]
        
        # Check if this is a new UPDATE statement
        if line.strip().startswith('UPDATE mcp_servers'):
            # If we've reached the chunk limit, save current block
            if server_count >= servers_per_chunk and current_block:
                server_blocks.append(current_block)
                current_block = []
                server_count = 0
            
            server_count += 1
        
        current_block.append(line)
        i += 1
    
    # Add any remaining content
    if current_block:
        server_blocks.append(current_block)
    
    # Write chunks
    total_chunks = len(server_blocks)
    print(f"Splitting into {total_chunks} chunks...")
    
    for idx, block in enumerate(server_blocks, 1):
        chunk_filename = output_path / f"update_repo_details_chunk_{idx:03d}.sql"
        
        with open(chunk_filename, 'w', encoding='utf-8') as f:
            # Write header
            f.writelines(header_lines)
            f.write('\n')
            
            # Write content
            f.writelines(block)
            
            # Write footer
            f.write('\n')
            f.writelines(footer_lines)
        
        # Count servers in this chunk
        server_count = sum(1 for line in block if line.strip().startswith('UPDATE mcp_servers'))
        print(f"Created {chunk_filename.name} with {server_count} server updates")
    
    print(f"\nSuccessfully split {input_path.name} into {total_chunks} chunks")
    print(f"Output directory: {output_path}")
    
    # Create execution script
    execute_script = output_path / "execute_all_chunks.sh"
    with open(execute_script, 'w') as f:
        f.write("#!/bin/bash\n\n")
        f.write("# Execute all SQL chunks in order\n")
        f.write("# Usage: ./execute_all_chunks.sh <connection_string>\n\n")
        f.write('if [ -z "$1" ]; then\n')
        f.write('    echo "Usage: $0 <connection_string>"\n')
        f.write('    echo "Example: $0 \"postgresql://user:password@localhost/dbname\""\n')
        f.write('    exit 1\n')
        f.write('fi\n\n')
        f.write('CONNECTION="$1"\n')
        f.write('FAILED=0\n\n')
        
        for idx in range(1, total_chunks + 1):
            chunk_name = f"update_repo_details_chunk_{idx:03d}.sql"
            f.write(f'echo "Executing {chunk_name}..."\n')
            f.write(f'psql "$CONNECTION" -f {chunk_name}\n')
            f.write('if [ $? -ne 0 ]; then\n')
            f.write(f'    echo "Failed to execute {chunk_name}"\n')
            f.write('    FAILED=1\n')
            f.write('else\n')
            f.write(f'    echo "Successfully executed {chunk_name}"\n')
            f.write('fi\n')
            f.write('echo\n\n')
        
        f.write('if [ $FAILED -eq 1 ]; then\n')
        f.write('    echo "Some chunks failed to execute"\n')
        f.write('    exit 1\n')
        f.write('else\n')
        f.write('    echo "All chunks executed successfully"\n')
        f.write('fi\n')
    
    os.chmod(execute_script, 0o755)
    print(f"\nCreated execution script: {execute_script.name}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python split_sql_file.py <input_sql_file> [output_dir] [servers_per_chunk]")
        print("Example: python split_sql_file.py update_repo_details.sql ./sql_chunks 100")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "./sql_chunks"
    servers_per_chunk = int(sys.argv[3]) if len(sys.argv) > 3 else 100
    
    split_sql_file(input_file, output_dir, servers_per_chunk)