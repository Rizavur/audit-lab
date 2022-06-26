import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { db } from './database';

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: false,
    minWidth: 950,
    minHeight: 600,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: true,
    },
    // icon: path.join(__dirname, 'assets', 'icon.png')
  })

  win.maximize()
  win.show()

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
  const info = statement.run({
    date: val.date,
    custCode: val.custCode,
    buyOrSell: val.buyOrSell,
    tradeCurrCode: val.tradeCurrCode,
    tradeCurrAmount: val.tradeCurrAmount,
    rate: val.rate,
    reverseRate: val.reverseRate,
    settlementAmount: val.settlementAmount,
    remarks: val.remarks
  })
  return info
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

ipcMain.handle('edit-currency-code', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    new_currency_code: val.newCurrencyCode,
    currencyId: val.currencyId, 
  })
})

ipcMain.handle('edit-currency-description', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    new_currency_description: val.newDescription,
    currencyId: val.currencyId, 
  })
})

ipcMain.handle('delete-customer-db', async (event, args) => {
  const stmt = args.statement
  const customerID = args.data
  const statement = db.prepare(stmt)
  statement.run(customerID)
})

ipcMain.handle('edit-customer-code', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    new_cust_code: val.newCustomerCode,
    customerId: val.customerId, 
  })
})

ipcMain.handle('edit-customer-description', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    new_customer_description: val.newDescription,
    customerId: val.customerId, 
  })
})

ipcMain.handle('edit-date', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    transaction_date: val.date, 
  })
})

ipcMain.handle('edit-cust-code', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    cust_code: val.custCode, 
  })
})

ipcMain.handle('edit-buy-or-sell', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    buy_or_sell: val.buyOrSell, 
  })
})

ipcMain.handle('edit-trade-curr-code', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    trade_curr_code: val.tradeCurrCode, 
  })
})

ipcMain.handle('edit-trade-curr-amount', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    trade_curr_amount: val.tradeCurrAmount, 
    settlement_curr_amount: val.newSettlement, 
  })
})

ipcMain.handle('edit-rate', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    rate: val.rate, 
    reverse_rate: val.reverseRate,
    settlement_curr_amount: val.newRateSettlement, 
  })
})

ipcMain.handle('edit-reverse-rate', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    rate: val.rate, 
    reverse_rate: val.reverseRate,
    settlement_curr_amount: val.newRevRateSettlement, 
  })
})

ipcMain.handle('edit-remarks', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  const statement = db.prepare(stmt)
  statement.run({
    record_no: val.recordNo,
    remarks: val.remarks, 
  })
})

ipcMain.handle('delete-transaction', async (event, args) => {
  const stmt = args.statement
  const transactionID = args.data
  const statement = db.prepare(stmt)
  statement.run({ id: transactionID })
})

ipcMain.handle('db-backup', async (event, args) => {
  const date = new Date();
  const dateString = date.getUTCFullYear() + "-" +
  ("0" + (date.getUTCMonth()+1)).slice(-2) + "-" +
  ("0" + date.getUTCDate()).slice(-2) + "-" +
  ("0" + (date.getUTCHours()+8)).slice(-2) + ":" +
  ("0" + date.getUTCMinutes()).slice(-2) + ":" +
  ("0" + date.getUTCSeconds()).slice(-2);
  db.backup(`backup-${dateString}.db`)
  .then(() => {
    console.log('backup complete!');
  })
  .catch((err) => {
    console.log('backup failed:', err);
  });
})

ipcMain.handle('update-pending-status', async (event, args) => {
  const stmt = args.statement
  const val = args.data
  console.log(val)
  const statement = db.prepare(stmt)
  statement.run({ record_no: val.record_no, pending: val.pending as string})
})
