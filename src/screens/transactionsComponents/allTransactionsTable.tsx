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
  updatePendingStatus,
} from '../../dbService'
import _ from 'lodash'
import config from '../../config.json'
import {
  AllTransactionTableProps,
  Transaction,
  CurrencyDetail,
  CustomerDetail,
} from '../../types'
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tag,
} from 'antd'
import { EditableCell, EditableRow } from '../../Components/AntTable'
import ExclamationCircleOutlined from '@ant-design/icons/lib/icons/ExclamationCircleOutlined'
import moment from 'moment'
import SearchOutlined from '@ant-design/icons/lib/icons/SearchOutlined'
import Highlighter from 'react-highlight-words'
import { addCommas } from '../../Service/CommonService'

const AllTransactionsTable = ({
  refresh,
  refreshFcClosing,
  refreshCustClosing,
}: AllTransactionTableProps) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [currDetails, setCurrDetails] = useState<string[]>([])
  const [custDetails, setCustDetails] = useState<string[]>([])
  const [dateFilters, setDateFilters] = useState<{
    start?: string
    end?: string
  }>({ start: undefined, end: undefined })
  const [searchText, setSearchText] = useState<{
    searchText?: string
    searchedColumn?: string
  }>({ searchText: undefined, searchedColumn: undefined })

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
    refreshCustClosing()
  }

  const handleDeleteRow = (recordNo: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this row?',
      icon: <ExclamationCircleOutlined />,
      content: 'Click yes to delete',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        Modal.confirm({
          title: 'Are you really sure?',
          icon: <ExclamationCircleOutlined />,
          content: 'Click yes to confirm delete',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            deleteTransaction(recordNo)
            fetchTransactions()
          },
          onCancel() {
            ;(() => {})()
          },
        })
      },
      onCancel() {
        ;(() => {})()
      },
    })
  }

  const handleTogglePending = (recordNo: any, value: any) => {
    updatePendingStatus({
      pending: value.target.checked | 0,
      recordNo,
    })
    fetchTransactions()
  }

  const handleDateFilter = (confirm: Function, selectedKeys: any) => {
    setDateFilters({ start: selectedKeys[0], end: selectedKeys[1] })
    confirm()
  }

  const handleClearDateFilters = (
    confirm: Function,
    clearFilters: Function
  ) => {
    setDateFilters({ start: undefined, end: undefined })
    clearFilters()
    confirm()
  }

  const handleSearch = (
    selectedKeys: string[],
    confirm: Function,
    dataIndex: string
  ) => {
    confirm()
    setSearchText({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    })
  }

  const handleReset = (
    clearFilters: Function,
    dataIndex: string,
    confirm: Function
  ) => {
    clearFilters()
    setSearchText({ searchText: '', searchedColumn: dataIndex })
    confirm()
  }

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Row justify="space-between">
          <Button
            type="link"
            onClick={() => handleReset(clearFilters, dataIndex, confirm)}
            size="small"
            disabled={searchText.searchText ? false : true}
          >
            Reset
          </Button>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
          >
            Search
          </Button>
        </Row>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: Transaction) =>
      record.remarks
        ? record.remarks.toString().toLowerCase().includes(value.toLowerCase())
        : false,
    render: (text: string) =>
      searchText.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText.searchText ?? '']}
          autoEscape
          textToHighlight={text ? text.toString().toUpperCase() : ''}
        />
      ) : (
        text.toUpperCase()
      ),
  })

  const columns = [
    {
      dataIndex: 'record_no',
      key: 'record_no',
      title: 'Record No.',
      width: 130,
      sorter: (a: Transaction, b: Transaction) => a.record_no - b.record_no,
    },
    {
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      title: 'Date',
      width: 160,
      editable: true,
      sorter: (a: Transaction, b: Transaction) =>
        moment(a.transaction_date).unix() - moment(b.transaction_date).unix(),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div className="space-align-container">
          <DatePicker.RangePicker
            autoFocus={true}
            onChange={(dates: any, dateStrings: [string, string]) => {
              setSelectedKeys(dateStrings)
              setDateFilters({ start: dateStrings[0], end: dateStrings[1] })
            }}
          />
          <Row justify={'space-between'} style={{ padding: 8 }}>
            <Space size={10} />
            <Button
              role="reset"
              type="link"
              onClick={() => handleClearDateFilters(confirm, clearFilters)}
              disabled={!dateFilters.start && !dateFilters.end}
              size="small"
            >
              Reset
            </Button>
            <Button
              type="primary"
              role="search"
              onClick={() => handleDateFilter(confirm, selectedKeys)}
              size="small"
            >
              OK
            </Button>
          </Row>
        </div>
      ),
      onFilter: (value: any, record: Transaction) => {
        if (dateFilters.start && dateFilters.end) {
          return (
            moment(record.transaction_date).isSameOrAfter(dateFilters.start) &&
            moment(record.transaction_date).isSameOrBefore(dateFilters.end)
          )
        }
        return true
      },
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
            date: moment(record.transaction_date, 'DD-MM-YYYY').format(
              'YYYY-MM-DD'
            ),
          })
          fetchTransactions()
        },
      }),
      render: (date: string) => {
        return <>{moment(date).format('DD-MM-YYYY')}</>
      },
    },
    {
      dataIndex: 'cust_code',
      key: 'cust_code',
      title: 'Customer',
      width: 120,
      align: 'center' as 'center',
      editable: true,
      filterSearch: true,
      filters: custDetails.map((custDetail: string) => {
        return { text: custDetail, value: custDetail }
      }),
      onFilter: (value: any, record: Transaction) =>
        record.cust_code.indexOf(value) === 0,
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
      title: 'Transaction',
      width: 120,
      align: 'center' as 'center',
      editable: true,
      filters: [
        { text: 'BUY', value: 'BUY' },
        { text: 'SELL', value: 'SELL' },
      ],
      onFilter: (value: any, record: Transaction) =>
        record.buy_or_sell.indexOf(value) === 0,
      render: (tag: string) => {
        const color = tag === 'BUY' ? 'geekblue' : 'volcano'
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
      width: 120,
      align: 'center' as 'center',
      editable: true,
      filters: currDetails.map((currDetail: string) => {
        return { text: currDetail, value: currDetail }
      }),
      filterSearch: true,
      onFilter: (value: any, record: Transaction) =>
        record.trade_curr_code.indexOf(value) === 0,
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
        isNumber: true,
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
      render: (amount: number) => <>{addCommas(amount.toFixed(2))}</>,
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
        isNumber: true,
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
        isNumber: true,
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
      render: (amt: number) => <>{addCommas(amt.toFixed(2))}</>,
    },
    {
      dataIndex: 'remarks',
      key: 'remarks',
      title: 'Remarks',
      width: 150,
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
      ...getColumnSearchProps('remarks'),
    },
    {
      dataIndex: 'pending',
      key: 'pending',
      title: 'Pending',
      width: 105,
      align: 'center' as 'center',
      render: (pendingStatus: number, record: Transaction) => (
        <Checkbox
          defaultChecked={!!pendingStatus}
          onChange={(value) => handleTogglePending(record.record_no, value)}
        />
      ),
    },
    {
      dataIndex: 'delete',
      key: 'delete',
      title: 'Action',
      width: 105,
      align: 'center' as 'center',
      render: (text: string, record: Transaction) => (
        <Button danger onClick={() => handleDeleteRow(record.record_no)}>
          Delete
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Table
        bordered
        scroll={{ x: 1680 }}
        columns={columns}
        dataSource={allTransactions}
        sticky={{ offsetHeader: 64 }}
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        pagination={{
          position: ['topLeft', 'bottomCenter'],
          pageSize: 50,
          showSizeChanger: false,
          showQuickJumper: true,
        }}
        size="small"
        rowClassName={(record, index) =>
          record.pending == 1 ? 'pending-background' : 'normal-background'
        }
      />
    </div>
  )
}

export default AllTransactionsTable
