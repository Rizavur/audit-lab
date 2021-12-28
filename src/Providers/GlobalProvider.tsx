import React, { useEffect, useState } from 'react'
import {
  getProtectedPassword,
  saveProtectedPassword,
} from '../Service/StorageService'

type GlobalContextValue = {
  password: string
  setPassword: React.Dispatch<React.SetStateAction<string>>
  updatePassword: Function
}

const defaultContext = {
  password: '',
  setPassword: () => {},
  updatePassword: () => {},
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

  const updatePassword = (password: string) => {
    saveProtectedPassword(password)
    setPassword(password)
  }

  useEffect(() => {
    getPreviouslySetPassword()
  }, [])

  return (
    <GlobalContext.Provider value={{ password, setPassword, updatePassword }}>
      {children}
    </GlobalContext.Provider>
  )
}
