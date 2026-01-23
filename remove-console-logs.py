#!/usr/bin/env python3
"""
Script to remove all console.log statements from frontend and backend
Safely removes console.log without breaking the code
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple

# Directories to process
FRONTEND_DIR = "frontend/src"
BACKEND_DIR = "backend"

# File extensions to process
FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs']

# Directories to skip
SKIP_DIRS = [
    'node_modules',
    'dist',
    'build',
    '.next',
    'coverage',
    'uploads',
    'assets',
    'public',
    'prisma/migrations',
    'certs'
]

def should_skip_directory(dir_path: str) -> bool:
    """Check if directory should be skipped"""
    parts = Path(dir_path).parts
    return any(skip_dir in parts for skip_dir in SKIP_DIRS)

def find_files_to_process(base_dir: str) -> List[str]:
    """Find all JavaScript/TypeScript files to process"""
    files_to_process = []
    
    if not os.path.exists(base_dir):
        print(f"Warning: Directory {base_dir} does not exist, skipping...")
        return files_to_process
    
    for root, dirs, files in os.walk(base_dir):
        # Skip directories in SKIP_DIRS
        if should_skip_directory(root):
            continue
        
        for file in files:
            if any(file.endswith(ext) for ext in FILE_EXTENSIONS):
                file_path = os.path.join(root, file)
                files_to_process.append(file_path)
    
    return files_to_process

def remove_console_logs(content: str) -> Tuple[str, int]:
    """
    Remove console.log statements from content safely
    Returns: (modified_content, number_of_removals)
    """
    removals = 0
    lines = content.split('\n')
    new_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check if line starts with console.log
        if stripped.startswith('console.log('):
            # Count parentheses to find where statement ends
            paren_count = 0
            start_idx = i
            full_statement = []
            
            for j in range(i, len(lines)):
                current_line = lines[j]
                full_statement.append(current_line)
                
                for char in current_line:
                    if char == '(':
                        paren_count += 1
                    elif char == ')':
                        paren_count -= 1
                
                # Check if statement is complete
                if paren_count == 0:
                    # Skip all these lines
                    i = j + 1
                    removals += 1
                    break
            else:
                # If we couldn't close parentheses, keep the line
                new_lines.append(line)
                i += 1
        else:
            # Keep non-console.log lines
            new_lines.append(line)
            i += 1
    
    content = '\n'.join(new_lines)
    return content, removals

def process_file(file_path: str) -> Tuple[bool, int]:
    """
    Process a single file to remove console.logs
    Returns: (success, number_of_removals)
    """
    try:
        # Read file with UTF-8 encoding
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Remove console.logs
        modified_content, removals = remove_console_logs(original_content)
        
        # Only write if changes were made
        if removals > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            return True, removals
        
        return True, 0
        
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False, 0

def main():
    """Main function to remove console.logs from frontend and backend"""
    print("=" * 60)
    print("Console.log Removal Script")
    print("=" * 60)
    print()
    
    # Get all files to process
    print("Scanning for files...")
    frontend_files = find_files_to_process(FRONTEND_DIR)
    backend_files = find_files_to_process(BACKEND_DIR)
    
    all_files = frontend_files + backend_files
    
    if not all_files:
        print("No files found to process!")
        return
    
    print(f"Found {len(frontend_files)} files in frontend")
    print(f"Found {len(backend_files)} files in backend")
    print(f"Total: {len(all_files)} files to process")
    print()
    
    # Process files
    total_removals = 0
    successful_files = 0
    failed_files = 0
    modified_files = []
    
    print("Processing files...")
    for file_path in all_files:
        success, removals = process_file(file_path)
        
        if success:
            successful_files += 1
            if removals > 0:
                total_removals += removals
                modified_files.append((file_path, removals))
                print(f"✓ {file_path}: Removed {removals} console.log(s)")
        else:
            failed_files += 1
    
    # Summary
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total files processed: {len(all_files)}")
    print(f"Successfully processed: {successful_files}")
    print(f"Failed: {failed_files}")
    print(f"Files modified: {len(modified_files)}")
    print(f"Total console.log statements removed: {total_removals}")
    print()
    
    if modified_files:
        print("Modified files:")
        for file_path, count in modified_files:
            rel_path = os.path.relpath(file_path)
            print(f"  - {rel_path} ({count} removal(s))")
    
    print()
    print("✓ Console.log removal completed!")
    
    return 0 if failed_files == 0 else 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nFatal error: {str(e)}")
        sys.exit(1)
