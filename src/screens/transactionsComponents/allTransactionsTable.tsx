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
import BootstrapTable from 'react-bootstrap-table-next'
import filterFactory, {
  dateFilter,
  selectFilter,
  textFilter,
} from 'react-bootstrap-table2-filter'
// @ts-ignore
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor'
import { CurrencyDetail, CustomerDetail } from '../home'
import _ from 'lodash'
import { addCommas } from '../reports/overallReport'
import { Button } from 'react-bootstrap'
import { TiDelete } from 'react-icons/ti'
import { IconContext } from 'react-icons'
import moment from 'moment'

export interface Transaction {
  record_no: number
  transaction_date: string
  transaction_entered_date?: string
  cust_code: string
  buy_or_sell: string
  trade_curr_code: string
  trade_curr_amount: number
  rate: number
  reverse_rate: number
  settlement_curr_amount: number
  remarks?: string
  edit_count?: number
  transaction_edited_date?: string
}

interface Props {
  refresh: number
  refreshFcClosing: Function
}

const AllTransactionsTable = ({ refresh, refreshFcClosing }: Props) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [currDetails, setCurrDetails] = useState<any>({})
  const [custDetails, setCustDetails] = useState<any>({})
  const [custEditOptions, setCustEditOptions] = useState<any>([])
  const [currEditOptions, setCurrEditOptions] = useState<any>([])

  const initializeTransactionsTable = async () => {
    const [transactions, currencyDetails, customerDetails] = await Promise.all([
      getAllTransactions(),
      getCurrencyDetails() as Promise<CurrencyDetail[]>,
      getCustomerDetails() as Promise<CustomerDetail[]>,
    ])
    setAllTransactions(transactions)
    const currCodes = currencyDetails.map(({ currency_code }) => currency_code)
    const formattedCurrCodes = _.zipObject(currCodes, currCodes)
    setCurrDetails(formattedCurrCodes)
    const formattedCurrEditOptions = currencyDetails.reduce(
      (arr: any, item: any) => {
        arr.push({
          value: item.currency_code,
          label: item.currency_code,
        })
        return arr
      },
      []
    )
    setCurrEditOptions(formattedCurrEditOptions)
    const custCodes = customerDetails.map(({ cust_code }) => cust_code)
    const formattedCustCodes = _.zipObject(custCodes, custCodes)
    setCustDetails(formattedCustCodes)
    const formattedCustEditOptions = customerDetails.reduce(
      (arr: any, item: any) => {
        arr.push({
          value: item.cust_code,
          label: item.cust_code,
        })
        return arr
      },
      []
    )
    setCustEditOptions(formattedCustEditOptions)
  }

  useEffect(() => {
    initializeTransactionsTable()
  }, [refresh])

  const fetchTransactions = async () => {
    const transactions = await getAllTransactions()
    setAllTransactions(transactions)
  }

  const beforeSaveCell = (
    oldValue: any,
    newValue: any,
    row: any,
    column: any,
    done: any
  ) => {
    setTimeout(() => {
      if (oldValue.toString() === newValue.toString()) {
        done(false)
        return null
      }
      if (window.confirm('Do you want to accept this change?')) {
        switch (column.dataField) {
          case 'transaction_date':
            editDate({ recordNo: row.record_no, date: newValue })
            break
          case 'cust_code':
            editCustCode({ recordNo: row.record_no, custCode: newValue })
            break
          case 'buy_or_sell':
            editBuyOrSell({ recordNo: row.record_no, buyOrSell: newValue })
            break
          case 'trade_curr_code':
            editTradeCurrCode({
              recordNo: row.record_no,
              tradeCurrCode: newValue,
            })
            break
          case 'trade_curr_amount':
            const newSettlement = (row.rate * newValue).toFixed(2)
            editTradeCurrAmount({
              recordNo: row.record_no,
              tradeCurrAmount: newValue,
              newSettlement,
            })
            fetchTransactions()
            break
          case 'rate':
            const newReverseRate = parseFloat(
              (1 / Number(newValue)).toFixed(11)
            )
            const newRateSettlement = (
              newValue * row.trade_curr_amount
            ).toFixed(2)
            editRate({
              recordNo: row.record_no,
              rate: newValue,
              reverseRate: newReverseRate,
              newRateSettlement,
            })
            fetchTransactions()
            break
          case 'reverse_rate':
            const newRate = parseFloat((1 / Number(newValue)).toFixed(11))
            const newRevRateSettlement = (
              row.trade_curr_amount / newValue
            ).toFixed(2)
            editReverseRate({
              recordNo: row.record_no,
              rate: newRate,
              reverseRate: newValue,
              newRevRateSettlement,
            })
            fetchTransactions()
            break
          case 'remarks':
            editRemarks({
              recordNo: row.record_no,
              remarks: newValue,
            })
            break
        }
        done(true)
      } else {
        done(false)
      }
    }, 0)
    return { async: true }
  }

  const handleRowDelete = (event: any, id: number) => {
    setTimeout(() => {
      if (window.confirm('Do you want to delete this row?')) {
        if (window.confirm('Are you really sure')) {
          deleteTransaction(id)
          fetchTransactions()
          refreshFcClosing()
        }
      }
    }, 0)
    return { async: true }
  }

  const renderDelete = (cell: any, row: any) => {
    return (
      <Button
        size="sm"
        variant="link"
        onClick={(event) => handleRowDelete(event, row.record_no)}
      >
        <IconContext.Provider value={{ color: 'red', size: '25px' }}>
          <div>
            <TiDelete />
          </div>
        </IconContext.Provider>
      </Button>
    )
  }

  const columns = [
    {
      dataField: 'record_no',
      text: 'Record',
      sort: true,
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            color: '#d14134',
          }
        }
        return { color: 'black' }
      },
    },
    {
      dataField: 'transaction_date',
      text: 'Date',
      sort: true,
      filter: dateFilter({}),
      editor: {
        type: Type.DATE,
      },
      formatter: (cell: any, row: any) =>
        moment(cell).startOf('day').format('DD MMMM YYYY'),
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            color: '#d14134',
          }
        }
        return { color: 'black' }
      },
    },
    {
      dataField: 'cust_code',
      text: 'Customer',
      filter: selectFilter({ options: custDetails }),
      editor: {
        type: Type.SELECT,
        options: custEditOptions,
      },
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return { minWidth: 160, color: '#d14134' }
        }
        return { minWidth: 160, color: 'black' }
      },
    },
    {
      dataField: 'buy_or_sell',
      text: 'Buy/Sell',
      filter: selectFilter({
        options: {
          BUY: 'BUY',
          SELL: 'SELL',
        },
      }),
      editor: {
        type: Type.SELECT,
        options: [
          {
            value: 'BUY',
            label: 'BUY',
          },
          {
            value: 'SELL',
            label: 'SELL',
          },
        ],
      },
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            minWidth: 160,
            color: '#d14134',
          }
        }
        return { minWidth: 160, color: 'black' }
      },
    },
    {
      dataField: 'trade_curr_code',
      text: 'Currency',
      filter: selectFilter({ options: currDetails }),
      editor: {
        type: Type.SELECT,
        options: currEditOptions,
      },
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            minWidth: 160,
            color: '#d14134',
          }
        }
        return { minWidth: 160, color: 'black' }
      },
    },
    {
      dataField: 'trade_curr_amount',
      text: 'Amount',
      formatter: (cell: any, row: any) => addCommas(cell),
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            minWidth: 170,
            color: '#d14134',
          }
        }
        return { minWidth: 170, color: 'black' }
      },
    },
    {
      dataField: 'rate',
      text: 'Rate',
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            minWidth: 170,
            color: '#d14134',
          }
        }
        return { minWidth: 170, color: 'black' }
      },
    },
    {
      dataField: 'reverse_rate',
      text: 'Reverse rate',
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            minWidth: 170,
            color: '#d14134',
          }
        }
        return { minWidth: 170, color: 'black' }
      },
    },
    {
      dataField: 'settlement_curr_amount',
      text: 'SGD',
      formatter: (cell: any, row: any) => '$' + addCommas(cell.toFixed(2)),
      editable: false,
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            minWidth: 170,
            color: '#d14134',
          }
        }
        return { minWidth: 170, color: 'black' }
      },
    },
    {
      dataField: 'remarks',
      text: 'Remarks',
      filter: textFilter(),
      style: (cell: any, row: any) => {
        if (row.buy_or_sell === 'SELL') {
          return {
            minWidth: 200,
            color: '#d14134',
          }
        }
        return { minWidth: 200, color: 'black' }
      },
    },
    {
      dataField: 'delete',
      text: 'Delete',
      formatter: renderDelete,
      align: 'center',
      editable: false,
      style: (cell: any, row: any) => {
        return { width: 30 }
      },
      headerStyle: () => {
        return { width: 60 }
      },
    },
  ]

  return (
    <BootstrapTable
      classes="react-bootstrap-table"
      hover
      condensed
      bootstrap4
      filterPosition="top"
      keyField={'record_no'}
      data={allTransactions}
      columns={columns}
      filter={filterFactory()}
      cellEdit={cellEditFactory({
        mode: 'click',
        blurToSave: true,
        beforeSaveCell,
        autoSelectText: true,
      })}
    />
  )
}

export default AllTransactionsTable
