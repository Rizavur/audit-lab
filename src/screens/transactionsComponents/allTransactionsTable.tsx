import { useEffect, useState } from 'react'
import {
  deleteTransaction,
  editBuyOrSell,
  editCustCode,
  editDate,
  editRate,
  editRemarks,
  editReverseRate,
  editTradeCurrAmount,
  editTradeCurrCode,
  getAllTransactions,
  getCurrencyDetails,
  getCustomerDetails,
} from '../../dbService'
import _ from 'lodash'
import { addCommas } from '../reports/overallReport'
import config from '../../config.json'
import {
  AllTransactionTableProps,
  Transaction,
  CurrencyDetail,
  CustomerDetail,
} from '../../types'
import { Table, Tag } from 'antd'
import { EditableCell, EditableRow } from '../../Components/AntTable'

const AllTransactionsTable = ({
  refresh,
  refreshFcClosing,
}: AllTransactionTableProps) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [currDetails, setCurrDetails] = useState<string[]>([])
  const [custDetails, setCustDetails] = useState<string[]>([])

  const initializeTransactionsTable = async () => {
    const [transactions, currencyDetails, customerDetails] = await Promise.all([
      getAllTransactions(),
      getCurrencyDetails() as Promise<CurrencyDetail[]>,
      getCustomerDetails() as Promise<CustomerDetail[]>,
    ])
    const currCodes = _.map(currencyDetails, 'currency_code')
    const custCodes = _.map(customerDetails, 'cust_code')
    setAllTransactions(transactions)
    setCurrDetails(currCodes)
    setCustDetails(custCodes)
  }

  useEffect(() => {
    initializeTransactionsTable()
  }, [refresh])

  const fetchTransactions = async () => {
    const transactions = await getAllTransactions()
    setAllTransactions(transactions)
    refreshFcClosing()
  }

  const columns = [
    {
      dataIndex: 'record_no',
      key: 'record_no',
      title: 'Record',
    },
    {
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      title: 'Date',
      editable: true,
      onCell: (record: Transaction) => ({
        record,
        date: true,
        required: true,
        key: 'transaction_date',
        editable: true,
        dataIndex: 'transaction_date',
        title: 'Date',
        handleSave: (record: Transaction) => {
          editDate({
            recordNo: record.record_no,
            date: record.transaction_date,
          })
          fetchTransactions()
        },
      }),
    },
    {
      dataIndex: 'cust_code',
      key: 'cust_code',
      title: 'Customer',
      editable: true,
      onCell: (record: Transaction) => ({
        record,
        required: true,
        key: 'cust_code',
        editable: true,
        dataIndex: 'cust_code',
        title: 'Customer',
        selectionData: custDetails,
        handleSave: (record: Transaction) => {
          editCustCode({
            recordNo: record.record_no,
            custCode: record.cust_code,
          })
          fetchTransactions()
        },
      }),
    },
    {
      dataIndex: 'buy_or_sell',
      key: 'buy_or_sell',
      title: 'Buy or Sell',
      editable: true,
      render: (tag: string) => {
        const color = tag === 'BUY' ? 'green' : 'purple'
        return <Tag color={color}>{tag}</Tag>
      },
      onCell: (record: Transaction) => ({
        record,
        required: true,
        key: 'buy_or_sell',
        editable: true,
        dataIndex: 'buy_or_sell',
        title: 'Buy or Sell',
        selectionData: ['BUY', 'SELL'],
        handleSave: (record: Transaction) => {
          editBuyOrSell({
            recordNo: record.record_no,
            buyOrSell: record.buy_or_sell,
          })
          fetchTransactions()
        },
      }),
    },
    {
      dataIndex: 'trade_curr_code',
      key: 'trade_curr_code',
      title: 'Currency',
      editable: true,
      onCell: (record: Transaction) => ({
        record,
        required: true,
        key: 'trade_curr_code',
        editable: true,
        dataIndex: 'trade_curr_code',
        title: 'Currency',
        selectionData: currDetails,
        handleSave: (record: Transaction) => {
          editTradeCurrCode({
            recordNo: record.record_no,
            tradeCurrCode: record.trade_curr_code,
          })
          fetchTransactions()
        },
      }),
    },
    {
      dataIndex: 'trade_curr_amount',
      key: 'trade_curr_amount',
      title: 'Amount',
      editable: true,
      onCell: (record: Transaction) => ({
        record,
        required: true,
        key: 'trade_curr_amount',
        editable: true,
        dataIndex: 'trade_curr_amount',
        title: 'Amount',
        handleSave: (record: Transaction) => {
          const newSettlement = (
            record.rate * record.trade_curr_amount
          ).toFixed(2)
          editTradeCurrAmount({
            recordNo: record.record_no,
            tradeCurrAmount: record.trade_curr_amount,
            newSettlement,
          })
          fetchTransactions()
        },
      }),
      render: (amount: string) => <>{addCommas(amount)}</>,
    },
    {
      dataIndex: 'rate',
      key: 'rate',
      title: 'Rate',
      editable: true,
      onCell: (record: Transaction) => ({
        record,
        required: true,
        key: 'rate',
        editable: true,
        dataIndex: 'rate',
        title: 'Rate',
        handleSave: (record: Transaction) => {
          const newReverseRate = parseFloat(
            (1 / Number(record.rate)).toFixed(11)
          )
          const newRateSettlement = (
            record.rate * record.trade_curr_amount
          ).toFixed(2)
          editRate({
            recordNo: record.record_no,
            rate: record.rate,
            reverseRate: newReverseRate,
            newRateSettlement,
          })
          fetchTransactions()
        },
      }),
    },
    {
      dataIndex: 'reverse_rate',
      key: 'reverse_rate',
      title: 'Reverse Rate',
      editable: true,
      onCell: (record: Transaction) => ({
        record,
        required: true,
        key: 'reverse_rate',
        editable: true,
        dataIndex: 'reverse_rate',
        title: 'Reverse Rate',
        handleSave: (record: Transaction) => {
          const newRate = parseFloat(
            (1 / Number(record.reverse_rate)).toFixed(11)
          )
          const newRevRateSettlement = (
            record.trade_curr_amount / record.reverse_rate
          ).toFixed(2)
          editReverseRate({
            recordNo: record.record_no,
            rate: newRate,
            reverseRate: record.reverse_rate,
            newRevRateSettlement,
          })
          fetchTransactions()
        },
      }),
    },
    {
      dataIndex: 'settlement_curr_amount',
      key: 'settlement_curr_amount',
      title: config.baseCurrency,
      render: (amt: string) => <>{addCommas(amt)}</>,
    },
    {
      dataIndex: 'remarks',
      key: 'remarks',
      title: 'Remarks',
      editable: true,
      onCell: (record: Transaction) => ({
        record,
        required: false,
        key: 'remarks',
        editable: true,
        dataIndex: 'remarks',
        title: 'Remarks',
        handleSave: (record: Transaction) => {
          editRemarks({
            recordNo: record.record_no,
            remarks: record.remarks,
          })
          fetchTransactions()
        },
      }),
    },
  ]

  return (
    <div>
      <Table
        bordered
        scroll={{ x: 1600 }}
        columns={columns}
        dataSource={allTransactions}
        sticky={{ offsetHeader: 56 }}
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        pagination={{
          position: ['topLeft', 'bottomCenter'],
          pageSize: 50,
        }}
      />
    </div>
  )
}

export default AllTransactionsTable
