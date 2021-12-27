import React, { useEffect, useState } from 'react'
import { getProtectedPassword } from '../Service/StorageService'

type GlobalContextValue = {
  password: string
  setPassword: React.Dispatch<React.SetStateAction<string>>
}

const defaultContext = {
  password: '',
  setPassword: () => {},
}

const GlobalContext = React.createContext<GlobalContextValue>(defaultContext)

export const useGlobalContext = () => {
  return React.useContext(GlobalContext)
}

export const GlobalProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [password, setPassword] = useState('')

  const getPreviouslySetPassword = async () => {
    const protectedPassword = await getProtectedPassword()
    if (protectedPassword) {
      setPassword(protectedPassword)
    }
  }

  useEffect(() => {
    getPreviouslySetPassword()
  }, [])

  return (
    <GlobalContext.Provider value={{ password, setPassword }}>
      {children}
    </GlobalContext.Provider>
  )
}
