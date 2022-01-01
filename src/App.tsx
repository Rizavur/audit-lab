import './App.css'
import 'antd/dist/antd.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css'
import { AppNavigator } from './AppNavigator'
import { GlobalProvider } from './Providers/GlobalProvider'

declare global {
  interface Window {
    api?: any
  }
}

const App = () => {
  return (
    <GlobalProvider>
      <AppNavigator />
    </GlobalProvider>
  )
}

export default App
