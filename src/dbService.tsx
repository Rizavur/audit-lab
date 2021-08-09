import {
  CurrencyFormikValues,
  CustomerFormikValues,
} from './screens/configurationsComponents/types'
import { TransactionFormikValues } from './screens/home'

export const getLatestTransactionNo = async () => {
  const response = await window.api.selectDB(
    `SELECT record_no FROM daily_transactions ORDER BY record_no DESC LIMIT 1`
  )
  return !!response[0] ? response[0].record_no + 1 : 1
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

export const deleteCurrency = async (currencyCode: string) => {
  try {
    await window.api.deleteCurrency(
      `DELETE FROM currencies WHERE currencies.currency_code = ?`,
      currencyCode
    )
  } catch (error) {
    console.log(error)
  }
}

export const editCurrencyCode = async (values: {
  newCurrencyCode: string
  oldCurrencyCode: string
}) => {
  try {
    await window.api.editCurrencyCode(
      `UPDATE currencies SET currency_code = @new_currency_code WHERE currency_code = @old_currency_code`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editCurrencyDescription = async (values: {
  newDescription: string
  currencyCode: string
}) => {
  try {
    await window.api.editCurrencyDescription(
      `UPDATE currencies SET currency_description = @new_currency_description WHERE currency_code = @currency_code`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}
export const deleteCustomer = async (customerCode: string) => {
  try {
    await window.api.deleteCustomer(
      `DELETE FROM customers WHERE customers.cust_code = ?`,
      customerCode
    )
  } catch (error) {
    console.log(error)
  }
}

export const editCustomerCode = async (values: {
  newCustomerCode: string
  oldCustomerCode: string
}) => {
  try {
    await window.api.editCustomerCode(
      `UPDATE customers SET cust_code = @new_cust_code WHERE cust_code = @old_cust_code`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editCustomerDescription = async (values: {
  newDescription: string
  customerCode: string
}) => {
  try {
    await window.api.editCustomerDescription(
      `UPDATE customers SET customer_description = @new_customer_description WHERE cust_code = @cust_code`,
      values
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

export const getPurchaseAmount = async () => {
  try {
    return await window.api.selectDB(
      `SELECT SUM(settlement_curr_amount) AS purchase_amount FROM daily_transactions WHERE trade_curr_code != 'SGD' AND buy_or_sell = 'BUY'`
    )
  } catch (error) {
    console.log(error)
  }
}

export const getClosingStockValue = async () => {
  try {
    return await window.api.selectDB(
      `
      WITH SB AS(
        SELECT trade_curr_code AS code, SUM(trade_curr_amount) AS stockBought, (SUM(settlement_curr_amount)/SUM(trade_curr_amount)) AS avg_rate
        FROM daily_transactions
        WHERE buy_or_sell = 'BUY'
        GROUP BY trade_curr_code
      ),
      SS AS(
        SELECT trade_curr_code AS code, SUM(trade_curr_amount) AS stockSold
        FROM daily_transactions
        WHERE buy_or_sell = 'SELL'
        GROUP BY trade_curr_code
      )
      SELECT SUM((stockBought - stockSold) * avg_rate) AS stock_balance
      FROM SB NATURAL JOIN SS AS RES
      WHERE code != 'SGD'
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getTotalSales = async () => {
  try {
    return await window.api.selectDB(
      `
      SELECT SUM(settlement_curr_amount) AS total_sales
      FROM daily_transactions
      WHERE trade_curr_code != 'SGD' AND buy_or_sell = 'SELL'
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getTotalExpenses = async () => {
  try {
    return await window.api.selectDB(
      `
      SELECT (      
        (SELECT COALESCE(SUM(settlement_curr_amount), 0) as sell
        FROM daily_transactions
        WHERE cust_code = 'EXP' AND buy_or_sell = 'SELL')
        -
        (SELECT COALESCE(SUM(settlement_curr_amount), 0) as buy
        FROM daily_transactions
        WHERE cust_code = 'EXP' AND buy_or_sell = 'BUY')
      ) AS expenses
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getCashInHand = async () => {
  try {
    return await window.api.selectDB(
      `
      SELECT (      
        (SELECT COALESCE(SUM(settlement_curr_amount), 0) as buy
        FROM daily_transactions
        WHERE trade_curr_code = 'SGD' AND buy_or_sell = 'BUY')
        -
        (SELECT COALESCE(SUM(settlement_curr_amount), 0) as sell
        FROM daily_transactions
        WHERE trade_curr_code = 'SGD' AND buy_or_sell = 'SELL')
      ) AS cashInHand
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getCapital = async () => {
  try {
    return await window.api.selectDB(
      `
      SELECT (      
        (SELECT COALESCE(SUM(settlement_curr_amount), 0) as buy
        FROM daily_transactions
        WHERE cust_code = 'CAP' AND buy_or_sell = 'BUY')
        -
        (SELECT COALESCE(SUM(settlement_curr_amount), 0) as sell
        FROM daily_transactions
        WHERE cust_code = 'CAP' AND buy_or_sell = 'SELL')
      ) AS capital
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getReceivablePayableAmount = async () => {
  try {
    return await window.api.selectDB(
      `
      WITH Buy as (
        SELECT cust_code, SUM(settlement_curr_amount) as boughtAmount
        FROM daily_transactions
        WHERE buy_or_sell = 'BUY' 
        GROUP BY cust_code
      ), Sell as (
        SELECT cust_code, SUM(settlement_curr_amount) as soldAmount
        FROM daily_transactions
        WHERE buy_or_sell = 'SELL' 
        GROUP BY cust_code
      ), byCust as (
        SELECT cust_code, (boughtAmount - soldAmount) as difference
        FROM Sell NATURAL JOIN Buy
      )
      SELECT 
        sum(case when difference < 0 then difference else 0 end) as receivable, 
        sum(case when difference > 0 then difference else 0 end) as payable
      FROM byCust
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getReceivablePayableDetails = async () => {
  try {
    return await window.api.selectDB(
      `
      WITH Buy as (
        SELECT cust_code, SUM(settlement_curr_amount) as boughtAmount
        FROM daily_transactions
        WHERE buy_or_sell = 'BUY' 
        GROUP BY cust_code
      ), Sell as (
        SELECT cust_code, SUM(settlement_curr_amount) as soldAmount
        FROM daily_transactions
        WHERE buy_or_sell = 'SELL' 
        GROUP BY cust_code
      ), byCust as (
        SELECT cust_code, customer_description, (boughtAmount - soldAmount) as difference
        FROM (Sell NATURAL JOIN Buy) NATURAL JOIN customers
      )
      SELECT *
      FROM byCust
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getFcClosingDetails = async () => {
  try {
    return await window.api.selectDB(
      `
      WITH SB AS(
        SELECT trade_curr_code AS code, SUM(trade_curr_amount) AS stockBought, (SUM(settlement_curr_amount)/SUM(trade_curr_amount)) AS avg_rate
        FROM daily_transactions
        WHERE buy_or_sell = 'BUY'
        GROUP BY trade_curr_code
      ),
      SS AS(
        SELECT trade_curr_code AS code, SUM(trade_curr_amount) AS stockSold, AVG(rate) as avg_rate
        FROM daily_transactions
        WHERE buy_or_sell = 'SELL'
        GROUP BY trade_curr_code
      ),
      BUY AS (
      SELECT SB.code, stockBought, SB.avg_rate, currency_description, stockSold, (stockBought - COALESCE(stockSold,0)) as fcClosing, (SB.avg_rate * (stockBought - COALESCE(stockSold,0))) as sgdValue
      FROM (SB LEFT JOIN SS ON SB.code = SS.code) JOIN currencies ON SB.code = currency_code
      WHERE SB.code != 'SGD')
      SELECT *
      FROM BUY
      UNION
       SELECT SS.code, stockBought, SS.avg_rate, currency_description, stockSold, (COALESCE(stockBought,0) - COALESCE(stockSold,0)) as fcClosing, (SS.avg_rate * (COALESCE(stockBought,0) - COALESCE(stockSold,0))) as sgdValue
      FROM (SS LEFT JOIN SB ON SB.code = SS.code) JOIN currencies ON SS.code = currency_code
      WHERE SS.code != 'SGD' AND SS.code NOT IN (SELECT code FROM BUY)
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const editDate = async (values: any) => {
  try {
    return await window.api.editDate(
      `
      UPDATE daily_transactions
      SET 
      transaction_date = @transaction_date
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editCustCode = async (values: any) => {
  try {
    return await window.api.editCustCode(
      `
      UPDATE daily_transactions
      SET 
      cust_code = @cust_code
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editBuyOrSell = async (values: any) => {
  try {
    return await window.api.editBuyOrSell(
      `
      UPDATE daily_transactions
      SET
      buy_or_sell = @buy_or_sell
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editTradeCurrCode = async (values: any) => {
  try {
    return await window.api.editTradeCurrCode(
      `
      UPDATE daily_transactions
      SET
      trade_curr_code = @trade_curr_code
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editTradeCurrAmount = async (values: any) => {
  try {
    return await window.api.editTradeCurrAmount(
      `
      UPDATE daily_transactions
      SET
      trade_curr_amount = @trade_curr_amount,
      settlement_curr_amount = @settlement_curr_amount
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editRate = async (values: any) => {
  try {
    return await window.api.editRate(
      `
      UPDATE daily_transactions
      SET
      rate = @rate,
      reverse_rate = @reverse_rate,
      settlement_curr_amount = @settlement_curr_amount
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editReverseRate = async (values: any) => {
  try {
    return await window.api.editReverseRate(
      `
      UPDATE daily_transactions
      SET
      rate = @rate,
      reverse_rate = @reverse_rate,
      settlement_curr_amount = @settlement_curr_amount
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const editRemarks = async (values: any) => {
  try {
    return await window.api.editRemarks(
      `
      UPDATE daily_transactions
      SET
      remarks = @remarks
      WHERE
      record_no = @record_no
      `,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const getFcClosing = async () => {
  try {
    return await window.api.selectDB(
      `
      WITH BUY AS (
        SELECT trade_curr_code, COALESCE(SUM(trade_curr_amount),0) AS buyAmount
        FROM daily_transactions
        WHERE buy_or_sell = 'BUY' 
        GROUP BY trade_curr_code
        ), SELL AS (
        SELECT trade_curr_code, COALESCE(SUM(trade_curr_amount),0) AS sellAmount
        FROM daily_transactions
        WHERE buy_or_sell = 'SELL' 
        GROUP BY trade_curr_code
        )
        SELECT BUY.trade_curr_code AS code, COALESCE(buyAmount,0) - COALESCE(sellAmount,0) AS closingStock
        FROM BUY LEFT JOIN SELL ON BUY.trade_curr_code = SELL.trade_curr_code
        UNION
        SELECT SELL.trade_curr_code AS code, COALESCE(buyAmount,0) - COALESCE(sellAmount,0) AS closingStock
        FROM SELL LEFT JOIN BUY ON BUY.trade_curr_code = SELL.trade_curr_code
      `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getCustomerReportData = async (values: any) => {
  try {
    return await window.api.selectDB(
      `
    SELECT *
    FROM daily_transactions
    WHERE cust_code = '${values.customerCode}' AND transaction_date >= '${values.fromDate}' AND transaction_date <= '${values.endDate}'
    `
    )
  } catch (error) {
    console.log(error)
  }
}

export const getOpeningBal = async (values: any) => {
  try {
    return await window.api.selectDB(
      `
      WITH BUY AS (
        SELECT COALESCE(SUM(settlement_curr_amount),0)AS buyAmount
        FROM daily_transactions
        WHERE cust_code = '${values.customerCode}' AND buy_or_sell = 'BUY' AND transaction_date < '${values.fromDate}'
        ), SELL AS (
        SELECT COALESCE(SUM(settlement_curr_amount),0) AS sellAmount
        FROM daily_transactions
        WHERE cust_code = '${values.customerCode}' AND buy_or_sell = 'SELL' AND transaction_date < '${values.fromDate}'
        )
        SELECT (buyAmount - sellAmount) AS openingBalance
        FROM BUY LEFT JOIN SELL
    `
    )
  } catch (error) {
    console.log(error)
  }
}

export const deleteTransaction = async (values: any) => {
  try {
    return await window.api.deleteTransaction(
      `DELETE FROM daily_transactions WHERE record_no = @id`,
      values
    )
  } catch (error) {
    console.log(error)
  }
}

export const dbBackup = async () => {
  try {
    return await window.api.dbBackup()
  } catch (error) {
    console.log(error)
  }
}
