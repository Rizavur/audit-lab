import { Collapse } from 'antd'
import Title from 'antd/lib/typography/Title'
import { useEffect, useState } from 'react'
import { getCurrencyDetails, getCustomerDetails } from '../dbService'
import { CurrencyDetail, CustomerDetail } from '../types'
import CurrenciesView from './configurationsComponents/CurrenciesConfiguration'
import CustomersView from './configurationsComponents/CustomersConfiguration'
import { PasswordConfiguration } from './configurationsComponents/PasswordConfiguration'
import {
  DollarCircleTwoTone,
  IdcardTwoTone,
  LockTwoTone,
} from '@ant-design/icons'

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
      <Collapse style={{ margin: 20 }} expandIconPosition="right" accordion>
        <Collapse.Panel
          header="Currencies"
          key="1"
          extra={<DollarCircleTwoTone style={{ fontSize: 20 }} />}
        >
          <CurrenciesView
            currenciesList={currDetails}
            refresh={initializeConfigurationsPage}
          />
        </Collapse.Panel>
        <Collapse.Panel
          header="Customers"
          key="2"
          extra={<IdcardTwoTone style={{ fontSize: 20 }} />}
        >
          <CustomersView
            customersList={custDetails}
            refresh={initializeConfigurationsPage}
          />
        </Collapse.Panel>
        <Collapse.Panel
          header="Change Password"
          key="3"
          extra={<LockTwoTone style={{ fontSize: 20 }} />}
        >
          <PasswordConfiguration />
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}

export default Configurations
