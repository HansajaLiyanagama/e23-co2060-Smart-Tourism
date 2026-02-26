// backend/src/database/runMigrations.js
const fs = require('fs');
const path = require('path');
const db = require('../config/db'); // Imports your pg Pool

/**By writing a script that executes our SQL files in alphabetical order, 
 * we guarantee that every developer on the team, and our production server, has the exact same 
 * database schema. This eliminates the 'it works on my machine' excuse and prepares us for CI/CD pipelines."
 */
async function runMigrations() {
    console.log('Starting Database Migrations...');
    
    // 1. Get the path to the migrations folder
    const migrationsPath = path.join(__dirname, 'migrations');
    
    try {
        // 2. Read all files in the directory and sort them alphabetically (001, 002, 003...)
        const files = fs.readdirSync(migrationsPath).sort();

        // 3. Loop through each file and execute it
        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Running migration: ${file}...`);
                
                // Read the raw SQL text from the file
                const filePath = path.join(migrationsPath, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                
                // Execute the SQL transaction against PostgreSQL
                await db.query(sql);
                
                console.log(`Successfully executed: ${file}`);
            }
        }
        
        console.log(' All migrations completed successfully! Database is ready.');
        process.exit(0); // Exit the script cleanly
        
    } catch (error) {
        console.error(' Migration failed! Error details:', error.message);
        process.exit(1); // Exit with a failure code
    }
}

// Execute the function
runMigrations();