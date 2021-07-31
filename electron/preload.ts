import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Invoke Methods
  selectDB: (args: any) => ipcRenderer.invoke('select-db', args),
  insertTransaction: (stmt: string, val: any) => ipcRenderer.invoke('insert-transaction-db', {statement: stmt, data: val})
  // Send Methods
//   testSend: (args: any) => ipcRenderer.send('test-send', args),
  // Receive Methods
//   testReceive: (callback: any) => ipcRenderer.on('test-receive', (event, data) => { callback(data) }
});