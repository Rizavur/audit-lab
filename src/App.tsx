import './App.css'
import 'antd/dist/antd.css'
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
