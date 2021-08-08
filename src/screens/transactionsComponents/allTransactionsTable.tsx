import { useEffect, useState } from 'react'
import {
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
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import { addCommas } from '../reports/overallReport'

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
}

const AllTransactionsTable = ({ refresh }: Props) => {
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

  const columns = [
    {
      dataField: 'record_no',
      text: 'Record',
      sort: true,
    },
    {
      dataField: 'transaction_date',
      text: 'Date',
      sort: true,
      filter: dateFilter({}),
      editor: {
        type: Type.DATE,
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
    },
    {
      dataField: 'trade_curr_code',
      text: 'Currency',
      filter: selectFilter({ options: currDetails }),
      editor: {
        type: Type.SELECT,
        options: currEditOptions,
      },
    },
    {
      dataField: 'trade_curr_amount',
      text: 'Amount',
      formatter: (cell: any, row: any) => addCommas(cell),
      // @ts-ignore
      footer: (columnData) => {
        console.log(columnData)
        // @ts-ignore
        return columnData.reduce((acc, item) => acc + item, 0)
      },
    },
    {
      dataField: 'rate',
      text: 'Rate',
    },
    {
      dataField: 'reverse_rate',
      text: 'Reverse rate',
    },
    {
      dataField: 'settlement_curr_amount',
      text: 'SGD',
      formatter: (cell: any, row: any) => '$ ' + addCommas(cell.toFixed(2)),
      editable: false,
    },
    {
      dataField: 'remarks',
      text: 'Remarks',
      filter: textFilter(),
    },
  ]

  return (
    <>
      <BootstrapTable
        classes="react-bootstrap-table"
        keyField={'record_no'}
        data={allTransactions}
        columns={columns}
        filter={filterFactory()}
        condensed
        bootstrap4
        filterPosition="top"
        cellEdit={cellEditFactory({
          mode: 'click',
          blurToSave: true,
          beforeSaveCell,
          autoSelectText: true,
        })}
      />
      <Button
        onClick={(event) => {
          console.log(currDetails)
        }}
      >
        Test
      </Button>
    </>
    // <Table striped bordered hover responsive="xl">
    //   <thead>
    //     <tr>
    //       <th>#</th>
    //       <th>Date</th>
    //       <th>Customer</th>
    //       <th>Buy or Sell</th>
    //       <th>Trade Currency Code</th>
    //       <th>Trade Amount</th>
    //       <th>Rate</th>
    //       <th>Reverse Rate</th>
    //       <th>Keyed Rate</th>
    //       <th>Settlement Amount</th>
    //       <th>Remarks</th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     {allTransactions.map((item, index) => {
    //       return (
    //         <tr key={index}>
    //           <td>{item.record_no}</td>
    //           <td>{item.transaction_date}</td>
    //           <td>{item.cust_code}</td>
    //           <td>{item.buy_or_sell.toUpperCase()}</td>
    //           <td>{item.trade_curr_code}</td>
    //           <td>{item.trade_curr_amount}</td>
    //           <td>{item.rate}</td>
    //           <td>{item.reverse_rate}</td>
    //           <td>{item.keyed_rate}</td>
    //           <td>{item.settlement_curr_amount}</td>
    //           <td>{item.remarks}</td>
    //         </tr>
    //       )
    //     })}
    //   </tbody>
    // </Table>
  )
}

export default AllTransactionsTable
