import Database = require('better-sqlite3');
import { app } from 'electron';
import path = require('path');
import * as isDev from 'electron-is-dev';
let dbFile

if (isDev) {
     dbFile = './accountingDB.sqlite'
} else {
    dbFile = path.join(app.getPath('userData'), 'accountingDB.sqlite')
}

export const db = new Database(dbFile);
