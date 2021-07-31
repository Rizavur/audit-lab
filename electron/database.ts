import Database = require('better-sqlite3');

// Initializing a new database
export const db = new Database('./accountingDB.sqlite');