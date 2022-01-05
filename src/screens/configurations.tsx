import Title from 'antd/lib/typography/Title'
import { useEffect, useState } from 'react'
import { getCurrencyDetails, getCustomerDetails } from '../dbService'
import { CurrencyDetail, CustomerDetail } from '../types'
import CurrenciesView from './configurationsComponents/CurrenciesConfiguration'
import CustomersView from './configurationsComponents/CustomersConfiguration'
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
    <div style={{ paddingBottom: 20 }}>
      <Title style={{ margin: 20 }}>Configurations</Title>
      <CurrenciesView
        currenciesList={currDetails}
        refresh={initializeConfigurationsPage}
      />
      <CustomersView
        customersList={custDetails}
        refresh={initializeConfigurationsPage}
      />
      <PasswordConfiguration />
    </div>
  )
}

export default Configurations
