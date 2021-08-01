import {
  CurrencyFormikValues,
  CustomerFormikValues,
} from './screens/configurationsComponents/types'
import { TransactionFormikValues } from './screens/home'

export const getLatestTransactionNo = async () => {
  const response = await window.api.selectDB(
    `SELECT record_no FROM daily_transactions ORDER BY record_no DESC LIMIT 1`
  )
  return !!response[0].record_no ? response[0].record_no + 1 : 1
}

export const getCurrencyDetails = async () => {
  return await window.api.selectDB(`SELECT * FROM currencies`)
}

export const getCustomerDetails = async () => {
  return await window.api.selectDB(`SELECT * FROM customers`)
}

export const addTransaction = async (values: TransactionFormikValues) => {
  try {
    return await window.api.insertTransaction(
      `INSERT INTO 
    daily_transactions(transaction_date, cust_code, buy_or_sell, trade_curr_code, trade_curr_amount, rate, reverse_rate, settlement_curr_amount, remarks) 
    VALUES(@date, @custCode, @buyOrSell, @tradeCurrCode, @tradeCurrAmount, @rate, @reverseRate, @settlementAmount, @remarks)`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const addCurrency = async (values: CurrencyFormikValues) => {
  try {
    await window.api.insertCurrency(
      `INSERT INTO currencies(currency_code, currency_description) VALUES(@currencyCode, @currencyDescription)`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const addCustomer = async (values: CustomerFormikValues) => {
  try {
    await window.api.insertCustomer(
      `INSERT INTO customers(cust_code, customer_description) VALUES(@customerCode, @customerDescription)`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const deleteCurrency = async (currencyID: number) => {
  try {
    await window.api.deleteCurrency(
      `DELETE FROM currencies WHERE currencies.currency_id = ?`,
      currencyID
    )
  } catch (error) {
    console.log(error)
  }
}

export const deleteCustomer = async (customerID: number) => {
  try {
    await window.api.deleteCustomer(
      `DELETE FROM customers WHERE customers.cust_id = ?`,
      customerID
    )
  } catch (error) {
    console.log(error)
  }
}

export const getAllTransactions = async () => {
  try {
    return await window.api.selectDB(
      `SELECT * FROM daily_transactions ORDER BY record_no DESC`
    )
  } catch (error) {
    console.log(error)
  }
}
