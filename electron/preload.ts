import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectDB: (args: any) => ipcRenderer.invoke('select-db', args),
  insertTransaction: (stmt: string, val: any) => ipcRenderer.invoke('insert-transaction-db', {statement: stmt, data: val}),
  insertCurrency: (stmt: string, val: any) => ipcRenderer.invoke('insert-currency-db', {statement: stmt, data: val}),
  insertCustomer: (stmt: string, val: any) => ipcRenderer.invoke('insert-customer-db', {statement: stmt, data: val}),
  deleteCurrency: (stmt: string, val: any) => ipcRenderer.invoke('delete-currency-db', {statement: stmt, data: val}),  
  editCurrencyCode: (stmt: string, val: any) => ipcRenderer.invoke('edit-currency-code', {statement: stmt, data: val}),
  editCurrencyDescription: (stmt: string, val: any) => ipcRenderer.invoke('edit-currency-description', {statement: stmt, data: val}),
  deleteCustomer: (stmt: string, val: any) => ipcRenderer.invoke('delete-customer-db', {statement: stmt, data: val}),
  editCustomerCode: (stmt: string, val: any) => ipcRenderer.invoke('edit-customer-code', {statement: stmt, data: val}),
  editCustomerDescription: (stmt: string, val: any) => ipcRenderer.invoke('edit-customer-description', {statement: stmt, data: val}),
  editDate: (stmt: string, val: any) => ipcRenderer.invoke('edit-date', {statement: stmt, data: val}),
  editCustCode: (stmt: string, val: any) => ipcRenderer.invoke('edit-cust-code', {statement: stmt, data: val}),
  editBuyOrSell: (stmt: string, val: any) => ipcRenderer.invoke('edit-buy-or-sell', {statement: stmt, data: val}),
  editTradeCurrCode: (stmt: string, val: any) => ipcRenderer.invoke('edit-trade-curr-code', {statement: stmt, data: val}),
  editTradeCurrAmount: (stmt: string, val: any) => ipcRenderer.invoke('edit-trade-curr-amount', {statement: stmt, data: val}),
  editRate: (stmt: string, val: any) => ipcRenderer.invoke('edit-rate', {statement: stmt, data: val}),
  editReverseRate: (stmt: string, val: any) => ipcRenderer.invoke('edit-reverse-rate', {statement: stmt, data: val}),
  editRemarks: (stmt: string, val: any) => ipcRenderer.invoke('edit-remarks', {statement: stmt, data: val}),
  deleteTransaction: (stmt: string, val: any) => ipcRenderer.invoke('delete-transaction', {statement: stmt, data: val}),
  dbBackup: (stmt: string, val: any) => ipcRenderer.invoke('db-backup'),
});