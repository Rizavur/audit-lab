import { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import { getAllTransactions } from '../../dbService'

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
  keyed_rate?: string
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

  const initializeTransactionsTable = async () => {
    const transactions = await getAllTransactions()
    setAllTransactions(transactions)
  }

  useEffect(() => {
    initializeTransactionsTable()
  }, [refresh])

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Buy or Sell</th>
          <th>Trade Currency Code</th>
          <th>Trade Amount</th>
          <th>Rate</th>
          <th>Reverse Rate</th>
          <th>Keyed Rate</th>
          <th>Settlement Amount</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        {allTransactions.map((item, index) => {
          return (
            <tr key={index}>
              <td>{item.record_no}</td>
              <td>{item.transaction_date}</td>
              <td>{item.cust_code}</td>
              <td>{item.buy_or_sell}</td>
              <td>{item.trade_curr_code}</td>
              <td>{item.trade_curr_amount}</td>
              <td>{item.rate}</td>
              <td>{item.reverse_rate}</td>
              <td>{item.keyed_rate}</td>
              <td>{item.settlement_curr_amount}</td>
              <td>{item.remarks}</td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default AllTransactionsTable
