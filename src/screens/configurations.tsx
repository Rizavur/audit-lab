import { useEffect, useState } from 'react'
import { getCurrencyDetails, getCustomerDetails } from '../dbService'
import { CurrencyDetail, CustomerDetail } from '../types'
import CurrenciesView from './configurationsComponents/currenciesView'
import CustomersView from './configurationsComponents/customersView'
import { PasswordConfiguration } from './configurationsComponents/PasswordConfiguration'

const Configurations = () => {
  const [currDetails, setCurrencyDetails] = useState<CurrencyDetail[]>([])
  const [custDetails, setCustomerDetails] = useState<CustomerDetail[]>([])

  const initializeConfigurationsPage = async () => {
    const [currencyDetails, customerDetails] = await Promise.all([
      getCurrencyDetails() as Promise<CurrencyDetail[]>,
      getCustomerDetails() as Promise<CustomerDetail[]>,
    ])
    setCurrencyDetails(currencyDetails)
    setCustomerDetails(customerDetails)
  }

  useEffect(() => {
    initializeConfigurationsPage()
  }, [])

  return (
    <>
      <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
        Configurations
      </h1>
      <CurrenciesView
        currenciesList={currDetails}
        refresh={initializeConfigurationsPage}
      />
      <CustomersView
        customersList={custDetails}
        refresh={initializeConfigurationsPage}
      />
      <PasswordConfiguration />
    </>
  )
}

export default Configurations
