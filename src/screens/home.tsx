import moment from 'moment'
import { useEffect, useState } from 'react'
import {
  getCustomerDetails,
  getCurrencyDetails,
  getLatestTransactionNo,
  addTransaction,
  getFcClosing,
  getReceivablePayableDetails,
} from '../dbService'
import { addCommas, ReceivablePayable } from './reports/overallReport'
import AllTransactionsTable from './transactionsComponents/allTransactionsTable'
import config from '../config.json'
import {
  CurrencyDetail,
  CustomerDetail,
  FcClosingStock,
  TransactionValues,
} from '../types'
import Title from 'antd/lib/typography/Title'
import Text from 'antd/lib/typography/Text'
import {
  Card,
  Form,
  Input,
  Row,
  Select,
  Button,
  DatePicker,
  InputNumber,
  Col,
  Divider,
} from 'antd'

const Transactions = () => {
  const [transactionNo, setTransactionNo] = useState<number>()
  const [currDetails, setCurrDetails] = useState<CurrencyDetail[]>([])
  const [custDetails, setCustDetails] = useState<CustomerDetail[]>([])
  const [transactionsDone, setTransactionDone] = useState<number>(0)
  const [fcClosingStocks, setFcClosingStocks] = useState<FcClosingStock[]>([])
  const [receivablePayableDetails, setReceivablePayableDetails] = useState<
    ReceivablePayable[]
  >([])
  const [currentCurrCode, setCurrentCurrCode] = useState('')
  const [currentCustCode, setCurrentCustCode] = useState('')

  const intializeTransactionForm = async () => {
    const [
      transactionNo,
      currencyDetails,
      customerDetails,
      fcClosing,
      receivableAndPayable,
    ] = await Promise.all([
      getLatestTransactionNo() as Promise<number>,
      getCurrencyDetails() as Promise<CurrencyDetail[]>,
      getCustomerDetails() as Promise<CustomerDetail[]>,
      getFcClosing() as Promise<FcClosingStock[]>,
      getReceivablePayableDetails() as Promise<ReceivablePayable[]>,
    ])
    setTransactionNo(transactionNo)
    setCurrDetails(currencyDetails)
    setCustDetails(customerDetails)
    setFcClosingStocks(fcClosing)
    setReceivablePayableDetails(receivableAndPayable)
  }

  useEffect(() => {
    intializeTransactionForm()
  }, [transactionsDone])

  const refreshFcClosing = async () => {
    const fcClosing = await getFcClosing()
    setFcClosingStocks(fcClosing)
  }

  const refreshCustClosing = async () => {
    const custClosing = await getReceivablePayableDetails()
    setReceivablePayableDetails(custClosing)
  }

  const validateMessages = {
    required: '${label} is required!',
  }

  const onFinish = async (values: TransactionValues) => {
    const formattedDate = moment(values.date).format('YYYY-MM-DD')
    await addTransaction({ ...values, date: formattedDate })
    setTransactionDone(transactionsDone + 1)
  }

  return (
    <div style={{ margin: 20 }}>
      <Title>Transactions</Title>
      <Card title={`Record No. ${transactionNo ?? ''}`}>
        <Form.Provider
          onFormChange={(name, { changedFields, forms }) => {
            const { transactionForm } = forms
            const rate = transactionForm.getFieldValue('rate')
            const reverseRate = transactionForm.getFieldValue('reverseRate')
            const tradeCurrCode = transactionForm.getFieldValue('tradeCurrCode')
            const custCode = transactionForm.getFieldValue('custCode')
            const tradeAmount = transactionForm.getFieldValue('tradeCurrAmount')

            if (changedFields.length) {
              const changedField = changedFields[0].name.toString()
              switch (changedField) {
                case 'rate':
                  if (rate) {
                    transactionForm.setFieldsValue({
                      reverseRate: Number((1 / rate).toFixed(11)),
                      settlementAmount: (rate * tradeAmount).toFixed(2),
                    })
                  } else {
                    transactionForm.setFieldsValue({
                      reverseRate: '',
                      settlementAmount: '',
                    })
                  }
                  break
                case 'reverseRate':
                  if (reverseRate) {
                    const newRate = Number((1 / reverseRate).toFixed(11))
                    transactionForm.setFieldsValue({
                      rate: newRate,
                      settlementAmount: (newRate * tradeAmount).toFixed(2),
                    })
                  } else {
                    transactionForm.setFieldsValue({
                      rate: '',
                      settlementAmount: '',
                    })
                  }

                  break
                case 'tradeCurrAmount':
                  transactionForm.setFieldsValue({
                    settlementAmount: (rate * tradeAmount).toFixed(2),
                  })
                  break
                case 'tradeCurrCode':
                  setCurrentCurrCode(tradeCurrCode)
                  if (tradeCurrCode === config.baseCurrency) {
                    transactionForm.setFieldsValue({
                      rate: 1,
                      reverseRate: 1,
                    })
                  }
                  break
                case 'custCode':
                  setCurrentCustCode(custCode)
                  break
              }
            }
          }}
          onFormFinish={(name, { values, forms }) => {
            const { transactionForm } = forms
            transactionForm.resetFields()
          }}
        >
          <Form
            name="transactionForm"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{
              date: moment(),
              buyOrSell: '',
              custCode: '',
              rate: '',
              reverseRate: '',
              tradeCurrCode: '',
              tradeCurrAmount: '',
              settlementAmount: '',
              remarks: '',
            }}
            validateMessages={validateMessages}
          >
            <Row justify="space-between">
              <Col span={4}>
                <Form.Item
                  label="Date"
                  name="date"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    format={'DD-MM-YYYY'}
                    allowClear={false}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Customer"
                  name="custCode"
                  rules={[{ required: true }]}
                >
                  <Select style={{ width: '100%' }} showSearch>
                    {custDetails.map((customer, index) => {
                      return (
                        <Select.Option key={index} value={customer.cust_code}>
                          {customer.cust_code}
                        </Select.Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Transaction"
                  name="buyOrSell"
                  rules={[{ required: true }]}
                >
                  <Select style={{ width: '100%' }} showSearch>
                    <Select.Option value="BUY">BUY</Select.Option>
                    <Select.Option value="SELL">SELL</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Currency"
                  name="tradeCurrCode"
                  rules={[{ required: true }]}
                >
                  <Select style={{ width: '100%' }} showSearch>
                    {currDetails.map((currency, index) => {
                      return (
                        <Select.Option
                          key={index}
                          value={currency.currency_code}
                        >
                          {currency.currency_code}
                        </Select.Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Trade Amount"
                  name="tradeCurrAmount"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    addonBefore={currentCurrCode}
                    min={0.01}
                    precision={2}
                    formatter={(value: any) => addCommas(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="space-between" align="bottom">
              <Col span={4}>
                <Form.Item
                  label="Rate"
                  name="rate"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0.0000000001}
                    style={{ width: '100%' }}
                    disabled={currentCurrCode === config.baseCurrency}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Reverse Rate"
                  name="reverseRate"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0.0000000001}
                    style={{ width: '100%' }}
                    disabled={currentCurrCode === config.baseCurrency}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Settlement Amount" name="settlementAmount">
                  <InputNumber
                    readOnly
                    min={0}
                    precision={2}
                    formatter={(value: any) => addCommas(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Remarks" name="remarks">
                  <Input style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Form.Provider>
        <Divider type="horizontal" style={{ width: '100%', marginTop: 5 }} />
        <Row>
          <Col span={12}>
            <Row>
              <Text strong italic>
                Customer Details
              </Text>
            </Row>
            <Row>
              <Text>{`Code: ${currentCustCode}`}</Text>
            </Row>
            <Row>
              <Text>{`Description: ${
                custDetails.find(
                  (customer) => customer.cust_code === currentCustCode
                )?.customer_description ?? ''
              }`}</Text>
            </Row>
            <Row>
              <Text>Receivable & Payable:&nbsp;</Text>
              <Text mark>
                {addCommas(
                  receivablePayableDetails
                    .find((item) => item.cust_code === currentCustCode)
                    ?.difference.toFixed(2) ?? ''
                )}
              </Text>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Text strong italic>
                Currency Details
              </Text>
            </Row>
            <Row>
              <Text>{`Code: ${currentCurrCode}`}</Text>
            </Row>
            <Row>
              <Text>{`Description: ${
                currDetails.find(
                  (currency) => currency.currency_code === currentCurrCode
                )?.currency_description ?? ''
              }`}</Text>
            </Row>
            <Row>
              <Text>Closing Stock:&nbsp;</Text>
              <Text mark>
                {addCommas(
                  (
                    fcClosingStocks.find((fc) => fc.code === currentCurrCode)
                      ?.closingStock ?? 0
                  ).toFixed(2)
                )}
              </Text>
            </Row>
          </Col>
        </Row>
      </Card>
      <AllTransactionsTable
        refresh={transactionsDone}
        refreshFcClosing={refreshFcClosing}
        refreshCustClosing={refreshCustClosing}
      />
    </div>
  )
}

export default Transactions
