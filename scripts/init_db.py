#!/usr/bin/env python3
"""
Database initialization script.
Run this script to:
1. Create the database tables if they don't exist
2. Migrate data from JSON to SQLite (if JSON file exists)
"""

import os
import sys
from pathlib import Path

# Add parent directory to sys.path
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from backend.models.db_models import init_db
from backend.storage import migrate_json_to_db

def main():
    """Initialize the database and migrate data from JSON if needed."""
    print("Initializing database...")
    engine = init_db()
    
    # Migrate data from JSON if it exists
    print("Checking for JSON data to migrate...")
    json_file_path = os.path.join(parent_dir, "backend", "database", "storing_configs.json")
    
    if os.path.exists(json_file_path):
        print(f"Found JSON file: {json_file_path}")
        print("Migrating data from JSON to SQLite database...")
        success = migrate_json_to_db()
        
        if success:
            print("Data migration successful!")
            # Optionally backup and rename the JSON file to prevent duplicate imports
            backup_path = json_file_path + ".bak"
            try:
                os.rename(json_file_path, backup_path)
                print(f"Original JSON file renamed to: {backup_path}")
            except Exception as e:
                print(f"Warning: Could not rename original JSON file: {e}")
        else:
            print("Data migration failed.")
    else:
        print("No JSON file found. Starting with empty database.")
    
    print("Database initialization complete.")

if __name__ == "__main__":
    main()