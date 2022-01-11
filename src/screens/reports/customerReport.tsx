import _ from 'lodash'
import moment, { Moment } from 'moment'
import { useEffect, useRef, useState } from 'react'
import {
  getCustomerDetails,
  getCustomerReportData,
  getOpeningBal,
} from '../../dbService'
import config from '../../config.json'
import { CustomerDetail } from '../../types'
import Title from 'antd/lib/typography/Title'
import { addCommas, reformatDate } from '../../Service/CommonService'
import { Col, DatePicker, Form, Row, Space, Table, Tag } from 'antd'
import { AntAutoComplete } from '../../Components/AntAutoComplete'
import ReactDOM from 'react-dom'

interface CustomerReportFormikValues {
  custCode: string
  dateRange: Moment[]
}

interface CustomerTransaction {
  transaction_date: string
  buy_or_sell: string
  trade_curr_code: string
  trade_curr_amount: string
  rate: number
  reverse_rate: number
  remarks: string
  settlement_curr_amount: number
}

const CustomerReport = () => {
  const [openingBalance, setOpeningBalance] = useState(0)
  const [customerReportData, setCustomerReportData] = useState<
    CustomerTransaction[]
  >([])
  const [custDetails, setCustDetails] = useState<CustomerDetail[]>([])
  const customerReportFormRef: any = useRef()
  const dateRef: any = useRef()

  const init = async () => {
    const customers = await getCustomerDetails()
    setCustDetails(customers)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    //@ts-ignore
    const input1 = ReactDOM.findDOMNode(dateRef.current).children[0].children[0]
    input1.addEventListener('keyup', reformatDate)
    input1.maxLength = 10
    //@ts-ignore
    const input2 = ReactDOM.findDOMNode(dateRef.current).children[2].children[0]
    input2.addEventListener('keyup', reformatDate)
    input2.maxLength = 10

    return () => {
      input1.removeEventListener('keyup', reformatDate)
      input2.removeEventListener('keyup', reformatDate)
    }
  }, [])

  const onFinish = async ({
    custCode,
    dateRange,
  }: CustomerReportFormikValues) => {
    if (custCode && dateRange && dateRange.length) {
      const startDate = moment(dateRange[0]).format('YYYY-MM-DD')
      const endDate = moment(dateRange[1]).format('YYYY-MM-DD')
      const [data, openingBal] = await Promise.all([
        getCustomerReportData({ custCode, startDate, endDate }),
        getOpeningBal({ custCode, startDate }),
      ])
      _.forEach(data, (item) => {
        if (item.buy_or_sell === 'SELL') {
          item.settlement_curr_amount = -Number(item.settlement_curr_amount)
        } else {
          item.settlement_curr_amount = Number(item.settlement_curr_amount)
        }
      })
      setCustomerReportData(data)
      !!openingBal
        ? setOpeningBalance(openingBal[0].openingBalance)
        : setOpeningBalance(0)
    }
  }

  const customerReportColumns = [
    {
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      title: 'Date',
      children: [
        {
          title: '',
          dataIndex: 'transaction_date',
          key: 'transaction_date',
          render: (date: string) => <>{moment(date).format('DD MMM YYYY')}</>,
        },
      ],
    },
    {
      dataIndex: 'buy_or_sell',
      key: 'buy_or_sell',
      title: 'Transaction',
      align: 'center' as 'center',
      children: [
        {
          title: '',
          dataIndex: 'buy_or_sell',
          key: 'buy_or_sell',
          align: 'center' as 'center',
          render: (tag: string) => {
            const color = tag === 'BUY' ? 'geekblue' : 'volcano'
            return <Tag color={color}>{tag}</Tag>
          },
        },
      ],
    },
    {
      dataIndex: 'trade_curr_code',
      key: 'trade_curr_code',
      title: 'Currency',
      children: [
        {
          title: '',
          dataIndex: 'trade_curr_code',
          key: 'trade_curr_code',
        },
      ],
    },
    {
      dataIndex: 'trade_curr_amount',
      key: 'trade_curr_amount',
      title: 'Amount',
      children: [
        {
          title: '',
          dataIndex: 'trade_curr_amount',
          key: 'trade_curr_amount',
          render: (amt: string) => <>{addCommas(amt)}</>,
        },
      ],
    },
    {
      dataIndex: 'rate',
      key: 'rate',
      title: 'Rate',
      children: [
        {
          title: '',
          dataIndex: 'rate',
          key: 'rate',
        },
      ],
    },
    {
      dataIndex: 'reverse_rate',
      key: 'reverse_rate',
      title: 'Reverse Rate',
      children: [
        {
          title: 'Opening Balance',
          dataIndex: 'reverse_rate',
          key: 'reverse_rate',
        },
      ],
    },
    {
      dataIndex: 'settlement_curr_amount',
      key: 'settlement_curr_amount',
      title: config.baseCurrency,
      children: [
        {
          title: '$ ' + addCommas(openingBalance.toFixed(2)),
          dataIndex: 'settlement_curr_amount',
          key: 'settlement_curr_amount',
          render: (amt: number) => <>{'$ ' + addCommas(amt.toFixed(2))}</>,
        },
      ],
    },
    {
      dataIndex: 'remarks',
      key: 'remarks',
      title: 'Remarks',
      children: [
        {
          title: '',
          dataIndex: 'remarks',
          key: 'remarks',
          render: (remark: string) => <>{remark.toUpperCase()}</>,
        },
      ],
    },
  ]

  return (
    <>
      <Row
        justify="space-between"
        style={{ marginLeft: 20, marginRight: 20, marginBottom: 20 }}
      >
        <Col span={10}>
          <Title>Customer Report</Title>
        </Col>
        <Col
          span={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Form
            name="customerReportForm"
            initialValues={{
              custCode: '',
              dateRange: [moment(), moment()],
            }}
            onFinish={onFinish}
            ref={customerReportFormRef}
            layout="vertical"
          >
            <Space direction="horizontal">
              <Form.Item
                name="custCode"
                label="Customer"
                style={{ width: 130 }}
              >
                {AntAutoComplete({
                  formRef: customerReportFormRef,
                  options: custDetails.map(
                    (custDetail) => custDetail.cust_code
                  ),
                  identifier: 'custCode',
                  placeholder: 'Customer Code',
                  onChange: () => {
                    const dateRange =
                      customerReportFormRef.current.getFieldValue('dateRange')
                    if (
                      customerReportFormRef.current &&
                      dateRange &&
                      dateRange.length
                    ) {
                      customerReportFormRef.current.submit()
                    }
                  },
                })}
              </Form.Item>
              <Form.Item name="dateRange" label="Date Range">
                <DatePicker.RangePicker
                  ref={dateRef}
                  onChange={() => {
                    const custCode =
                      customerReportFormRef.current.getFieldValue('custCode')
                    if (customerReportFormRef.current && custCode) {
                      customerReportFormRef.current.submit()
                    }
                  }}
                  format={'DD-MM-YYYY'}
                />
              </Form.Item>
            </Space>
          </Form>
        </Col>
      </Row>
      <Table
        bordered
        columns={customerReportColumns}
        dataSource={customerReportData}
        sticky={{ offsetHeader: 64 }}
        pagination={false}
        size="small"
        style={{ margin: 20, paddingBottom: 20 }}
        summary={(pageData) => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={1}></Table.Summary.Cell>
            <Table.Summary.Cell index={2}></Table.Summary.Cell>
            <Table.Summary.Cell index={3}></Table.Summary.Cell>
            <Table.Summary.Cell index={4}></Table.Summary.Cell>
            <Table.Summary.Cell index={5}></Table.Summary.Cell>
            <Table.Summary.Cell index={6}>
              <span style={{ fontWeight: 'bold' }}>Closing Balance</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7}>
              <span style={{ color: 'blue', fontWeight: 'bold' }}>
                {'$ ' +
                  addCommas(
                    (
                      openingBalance +
                      _.sumBy(pageData, 'settlement_curr_amount')
                    ).toFixed(2)
                  )}
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={8}></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </>
  )
}

export default CustomerReport
