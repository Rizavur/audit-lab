import _ from 'lodash'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { getCurrencyDetails, getCurrencyReportData } from '../../dbService'
import config from '../../config.json'
import { CurrencyDetail } from '../../types'
import Title from 'antd/lib/typography/Title'
import Text from 'antd/lib/typography/Text'
import { addCommas, reformatDate } from '../../Service/CommonService'
import { Card, Col, DatePicker, Form, Row, Space, Table, Tooltip } from 'antd'
import { AntAutoComplete } from '../../Components/AntAutoComplete'
import ReactDOM from 'react-dom'

interface CurrencyReportFormikValues {
  currCode: string
  date: string
}

interface CurrencyTransaction {
  transaction_date: string
  cust_code: string
  buy_or_sell: string
  trade_curr_code: string
  trade_curr_amount: string
  rate: number
  reverse_rate: number
  remarks: string
  settlement_curr_amount: number
}

const CurrencyReport = () => {
  const [currencyReportData, setCurrencyReportData] = useState<
    CurrencyTransaction[]
  >([])
  const [currDetails, setCurrDetails] = useState<CurrencyDetail[]>([])
  const currencyReportFormRef: any = useRef()
  const dateRef: any = useRef()

  const init = async () => {
    const currencies = await getCurrencyDetails()
    setCurrDetails(currencies)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    //@ts-ignore
    const input = ReactDOM.findDOMNode(dateRef.current).children[0].children[0]
    input.addEventListener('keyup', reformatDate)
    input.maxLength = 10

    return () => {
      input.removeEventListener('keyup', reformatDate)
    }
  }, [])

  const onFinish = async ({ currCode, date }: CurrencyReportFormikValues) => {
    const data = await getCurrencyReportData({
      currencyCode: currCode,
      date: moment(date).format('YYYY-MM-DD'),
    })

    setCurrencyReportData(data)
  }

  const columns = [
    {
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      title: 'Date',
    },
    {
      dataIndex: 'cust_code',
      key: 'cust_code',
      title: 'Customer',
    },
    {
      dataIndex: 'trade_curr_amount',
      key: 'trade_curr_amount',
      title: 'Amount',
      render: (amt: string) => <>{addCommas(amt)}</>,
    },
    {
      dataIndex: 'rate',
      key: 'rate',
      title: 'Rate',
    },
    {
      dataIndex: 'reverse_rate',
      key: 'reverse_rate',
      title: 'Reverse Rate',
    },
    {
      dataIndex: 'settlement_curr_amount',
      key: 'settlement_curr_amount',
      title: config.baseCurrency + ' Value',
      render: (amt: number) => <>{'$ ' + addCommas(amt.toFixed(2))}</>,
    },
    {
      dataIndex: 'remarks',
      key: 'remarks',
      title: 'Remarks',
      render: (remark: string) => <>{remark.toString().toUpperCase()}</>,
    },
  ]

  return (
    <div style={{ paddingBottom: 20 }}>
      <Row
        justify="space-between"
        style={{ marginLeft: 20, marginRight: 20, marginBottom: 20 }}
      >
        <Col span={10}>
          <Title>Currency Report</Title>
        </Col>
        <Col
          span={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Form
            name="currencyReportForm"
            ref={currencyReportFormRef}
            initialValues={{
              currCode: '',
              date: moment(),
            }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Space direction="horizontal">
              <Form.Item
                name="currCode"
                label="Currency Code"
                style={{ width: 130 }}
              >
                {AntAutoComplete({
                  formRef: currencyReportFormRef,
                  options: currDetails.map(
                    (currency) => currency.currency_code
                  ),
                  identifier: 'currCode',
                  placeholder: 'Currency Code',
                  onChange: () => {
                    const date =
                      currencyReportFormRef.current.getFieldValue('date')
                    if (currencyReportFormRef.current && date) {
                      currencyReportFormRef.current.submit()
                    }
                  },
                })}
              </Form.Item>
              <Form.Item name="date" label="Date">
                <DatePicker
                  ref={dateRef}
                  onChange={() => {
                    const currCode =
                      currencyReportFormRef.current.getFieldValue('currCode')
                    if (currencyReportFormRef.current && currCode) {
                      currencyReportFormRef.current.submit()
                    }
                  }}
                  format={'DD-MM-YYYY'}
                />
              </Form.Item>
            </Space>
          </Form>
        </Col>
      </Row>
      <Tooltip title="Sold - Bought = Difference">
        <Text
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {`${addCommas(
            _.sumBy(
              currencyReportData.filter((item) => item.buy_or_sell === 'SELL'),
              'trade_curr_amount'
            ).toFixed(2)
          )}`}{' '}
          -{' '}
          {`${addCommas(
            _.sumBy(
              currencyReportData.filter((item) => item.buy_or_sell === 'BUY'),
              'trade_curr_amount'
            ).toFixed(2)
          )}`}{' '}
          =
          <Text strong>
            <span>&nbsp;</span>
            {`${addCommas(
              (
                _.sumBy(
                  currencyReportData.filter(
                    (item) => item.buy_or_sell === 'SELL'
                  ),
                  'trade_curr_amount'
                ) -
                _.sumBy(
                  currencyReportData.filter(
                    (item) => item.buy_or_sell === 'BUY'
                  ),
                  'trade_curr_amount'
                )
              ).toFixed(2)
            )}`}
          </Text>
        </Text>
      </Tooltip>
      <Card
        title="Bought"
        style={{ margin: 20 }}
        extra={
          <Text style={{ color: 'blue', fontWeight: 'bold' }}>
            {addCommas(
              _.sumBy(
                currencyReportData.filter((item) => item.buy_or_sell === 'BUY'),
                'trade_curr_amount'
              ).toFixed(2)
            )}
          </Text>
        }
      >
        <Table
          bordered
          columns={columns}
          dataSource={currencyReportData.filter(
            (item) => item.buy_or_sell === 'BUY'
          )}
          sticky={{ offsetHeader: 64 }}
          pagination={false}
          size="small"
        />
      </Card>
      <Card
        title="Sold"
        style={{ margin: 20 }}
        extra={
          <Text style={{ color: 'blue', fontWeight: 'bold' }}>
            {addCommas(
              _.sumBy(
                currencyReportData.filter(
                  (item) => item.buy_or_sell === 'SELL'
                ),
                'trade_curr_amount'
              ).toFixed(2)
            )}
          </Text>
        }
      >
        <Table
          bordered
          columns={columns}
          dataSource={currencyReportData.filter(
            (item) => item.buy_or_sell === 'SELL'
          )}
          sticky={{ offsetHeader: 64 }}
          pagination={false}
          size="small"
        />
      </Card>
      <Tooltip title="[SGD] Sold - Bought = Difference">
        <Text
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {`$${addCommas(
            _.sumBy(
              currencyReportData.filter((item) => item.buy_or_sell === 'SELL'),
              'settlement_curr_amount'
            ).toFixed(2)
          )}`}{' '}
          -{' '}
          {`$${addCommas(
            _.sumBy(
              currencyReportData.filter((item) => item.buy_or_sell === 'BUY'),
              'settlement_curr_amount'
            ).toFixed(2)
          )}`}{' '}
          =
          <Text strong>
            <span>&nbsp;</span>
            {`$${addCommas(
              (
                _.sumBy(
                  currencyReportData.filter(
                    (item) => item.buy_or_sell === 'SELL'
                  ),
                  'settlement_curr_amount'
                ) -
                _.sumBy(
                  currencyReportData.filter(
                    (item) => item.buy_or_sell === 'BUY'
                  ),
                  'settlement_curr_amount'
                )
              ).toFixed(2)
            )}`}
          </Text>
        </Text>
      </Tooltip>
    </div>
  )
}

export default CurrencyReport
