import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { db } from './database';

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: true
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:3000/index.html');
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on('closed', () => win = null);

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      forceHardReset: true,
      hardResetMethod: 'exit'
    });
  }

  // DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle('select-db', async (event, stmt) => {
  const data = db.prepare(stmt).all()
  return data
})

ipcMain.handle('insert-transaction-db', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    date: val.date,
    custCode: val.custCode,
    buyOrSell: val.buyOrSell,
    tradeCurrCode: val.tradeCurrCode,
    tradeCurrAmount: val.tradeCurrAmount,
    rate: val.rate,
    reverseRate: val.reverseRate,
    settlementAmount: val.settlementAmount
  })
})

ipcMain.handle('insert-currency-db', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    currencyCode: val.currencyCode,
    currencyDescription: val.currencyDescription,
  })
})

ipcMain.handle('insert-customer-db', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    customerCode: val.customerCode,
    customerDescription: val.customerDescription,
  })
})

ipcMain.handle('delete-currency-db', async (event, args) => {
  const stmt = args.statement
  const currencyID = args.data
  const statement = db.prepare(stmt)
  statement.run(currencyID)
})

ipcMain.handle('delete-customer-db', async (event, args) => {
  const stmt = args.statement
  const customerID = args.data
  const statement = db.prepare(stmt)
  statement.run(customerID)
})