import { useEffect, useRef, useState } from 'react'
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
import { Button, Modal } from 'react-bootstrap'
import { TiDelete } from 'react-icons/ti'
import { IconContext } from 'react-icons'
import moment from 'moment'
import config from '../../config.json'

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
interface EditedData {
  newValue: any
  row: any
  column: any
  done: any
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
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [editedData, setEditedData] = useState<EditedData>()
  const [rowDeleteData, setRowDeleteData] = useState<number>()
  const deleteDefaultRef = useRef<HTMLButtonElement>(null)
  const editDefaultRef = useRef<HTMLButtonElement>(null)
  const onDeleteModalOpen = () => {
    // @ts-ignore
    deleteDefaultRef.current.focus()
  }
  const onEditModalOpen = () => {
    // @ts-ignore
    editDefaultRef.current.focus()
  }

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

  const handleClose = () => {
    fetchTransactions()
    setShowEditModal(false)
    setShowDeleteModal(false)
  }

  const handleSave = () => {
    if (!!editedData)
      switch (editedData.column.dataField) {
        case 'transaction_date':
          editDate({
            recordNo: editedData.row.record_no,
            date: editedData.newValue,
          })
          editedData.done(true)
          break
        case 'cust_code':
          editCustCode({
            recordNo: editedData.row.record_no,
            custCode: editedData.newValue,
          })
          editedData.done(true)
          break
        case 'buy_or_sell':
          editBuyOrSell({
            recordNo: editedData.row.record_no,
            buyOrSell: editedData.newValue,
          })
          editedData.done(true)
          break
        case 'trade_curr_code':
          editTradeCurrCode({
            recordNo: editedData.row.record_no,
            tradeCurrCode: editedData.newValue,
          })
          editedData.done(true)
          break
        case 'trade_curr_amount':
          const newSettlement = (
            editedData.row.rate * editedData.newValue
          ).toFixed(2)
          editTradeCurrAmount({
            recordNo: editedData.row.record_no,
            tradeCurrAmount: editedData.newValue,
            newSettlement,
          })
          fetchTransactions()
          editedData.done(true)
          break
        case 'rate':
          const newReverseRate = parseFloat(
            (1 / Number(editedData.newValue)).toFixed(11)
          )
          const newRateSettlement = (
            editedData.newValue * editedData.row.trade_curr_amount
          ).toFixed(2)
          editRate({
            recordNo: editedData.row.record_no,
            rate: editedData.newValue,
            reverseRate: newReverseRate,
            newRateSettlement,
          })
          fetchTransactions()
          editedData.done(true)
          break
        case 'reverse_rate':
          const newRate = parseFloat(
            (1 / Number(editedData.newValue)).toFixed(11)
          )
          const newRevRateSettlement = (
            editedData.row.trade_curr_amount / editedData.newValue
          ).toFixed(2)
          editReverseRate({
            recordNo: editedData.row.record_no,
            rate: newRate,
            reverseRate: editedData.newValue,
            newRevRateSettlement,
          })
          fetchTransactions()
          editedData.done(true)
          break
        case 'remarks':
          editRemarks({
            recordNo: editedData.row.record_no,
            remarks: editedData.newValue,
          })
          editedData.done(true)
          break
        default:
          editedData.done(false)
      }
    setShowEditModal(false)
  }

  const beforeSaveCell = (
    oldValue: any,
    newValue: any,
    row: any,
    column: any,
    done: any
  ) => {
    if (oldValue.toString() === newValue.toString()) {
      done(false)
      return null
    }
    setShowEditModal(true)
    setEditedData({ newValue, row, column, done })
  }

  const handleRowDelete = () => {
    deleteTransaction(rowDeleteData)
    setShowDeleteModal(false)
    fetchTransactions()
    refreshFcClosing()
  }

  const renderDelete = (cell: any, row: any) => {
    return (
      <Button
        size="sm"
        variant="link"
        onClick={(event) => {
          setShowDeleteModal(true)
          setRowDeleteData(row.record_no)
        }}
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
      text: config.baseCurrency,
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
    <div>
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
          mode: 'dbclick',
          blurToSave: true,
          beforeSaveCell,
          autoSelectText: true,
        })}
      />
      <Modal
        size="lg"
        show={showEditModal}
        onHide={handleClose}
        onEntered={onEditModalOpen}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Edit Cell</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Do you want to accept this change?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button variant="primary" onClick={handleSave} ref={editDefaultRef}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="lg"
        show={showDeleteModal}
        onHide={handleClose}
        onEntered={onDeleteModalOpen}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Row</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you really sure you want to delete this row?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleClose}
            ref={deleteDefaultRef}
          >
            No
          </Button>
          <Button variant="secondary" onClick={handleRowDelete}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AllTransactionsTable
