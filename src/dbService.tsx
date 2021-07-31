import { FormikValues } from './screens/home'

export const getLatestTransactionNo = async () => {
  return (
    (
      await window.api.selectDB(
        `SELECT record_no FROM daily_transactions ORDER BY record_no DESC LIMIT 1`
      )
    )[0].record_no + 1 ?? 1
  )
}

export const getCurrencyDetails = async () => {
  return await window.api.selectDB(`SELECT * FROM currencies`)
}

export const getCustomerDetails = async () => {
  return await window.api.selectDB(`SELECT * FROM customers`)
}

export const addTransaction = async (values: FormikValues) => {
  try {
    await window.api.insertTransaction(
      `INSERT INTO 
    daily_transactions(transaction_date, cust_code, buy_or_sell, trade_curr_code, trade_curr_amount, rate, reverse_rate, settlement_curr_amount) 
    VALUES(@date, @custCode, @buyOrSell, @tradeCurrCode, @tradeCurrAmount, @rate, @reverseRate, @settlementAmount)`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}
