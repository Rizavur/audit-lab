import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectDB: (args: any) => ipcRenderer.invoke('select-db', args),
  insertTransaction: (stmt: string, val: any) => ipcRenderer.invoke('insert-transaction-db', {statement: stmt, data: val}),
  insertCurrency: (stmt: string, val: any) => ipcRenderer.invoke('insert-currency-db', {statement: stmt, data: val}),
  insertCustomer: (stmt: string, val: any) => ipcRenderer.invoke('insert-customer-db', {statement: stmt, data: val}),
  deleteCurrency: (stmt: string, val: any) => ipcRenderer.invoke('delete-currency-db', {statement: stmt, data: val}),
  deleteCustomer: (stmt: string, val: any) => ipcRenderer.invoke('delete-customer-db', {statement: stmt, data: val}),
});