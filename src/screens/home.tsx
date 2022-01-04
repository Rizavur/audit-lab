import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
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
  Button,
  DatePicker,
  InputNumber,
  Col,
} from 'antd'
import { AntAutoComplete } from '../Components/AntAutoComplete'
import ReactDOM from 'react-dom'

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
  const transactionFormRef: any = useRef()
  const dateRef: any = useRef()

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

  useEffect(() => {
    //@ts-ignore
    const input = ReactDOM.findDOMNode(dateRef.current).children[0].children[0]
    input.addEventListener('keyup', reformatDate)
    input.maxLength = 10

    return () => {
      input.removeEventListener('keyup', reformatDate)
    }
  }, [])

  const refreshFcClosing = async () => {
    const fcClosing = await getFcClosing()
    setFcClosingStocks(fcClosing)
  }

  const refreshCustClosing = async () => {
    const custClosing = await getReceivablePayableDetails()
    setReceivablePayableDetails(custClosing)
  }

  const reformatDate = (event: any) => {
    const strippedInput = event.target.value.replaceAll('-', '')
    let newInput = ''
    for (let i = 0; i < strippedInput.length; i += 1) {
      if (i === 2 || i === 4) newInput += '-'
      newInput += strippedInput.charAt(i)
    }
    event.target.value = newInput
  }

  const validateMessages = {
    required: '${label} is required!',
  }

  const onFinish = async (values: TransactionValues) => {
    const formattedDate = moment(values.date).format('YYYY-MM-DD')
    await addTransaction({ ...values, date: formattedDate })
    setTransactionDone(transactionsDone + 1)
    setCurrentCurrCode('')
    setCurrentCustCode('')
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
                  if (tradeCurrCode === config.baseCurrency) {
                    transactionForm.setFieldsValue({
                      rate: 1,
                      reverseRate: 1,
                    })
                  }
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
            ref={transactionFormRef}
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
                    autoFocus
                    ref={dateRef}
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
                  hasFeedback
                  rules={[{ required: true }]}
                >
                  {AntAutoComplete({
                    formRef: transactionFormRef,
                    options: custDetails.map((customer) => customer.cust_code),
                    identifier: 'custCode',
                    onSelectChangeState: setCurrentCustCode,
                  })}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Transaction"
                  name="buyOrSell"
                  hasFeedback
                  rules={[{ required: true }]}
                >
                  {AntAutoComplete({
                    formRef: transactionFormRef,
                    options: ['BUY', 'SELL'],
                    identifier: 'buyOrSell',
                  })}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Currency"
                  name="tradeCurrCode"
                  hasFeedback
                  rules={[{ required: true }]}
                >
                  {AntAutoComplete({
                    formRef: transactionFormRef,
                    options: currDetails.map(
                      (currency) => currency.currency_code
                    ),
                    identifier: 'tradeCurrCode',
                    onSelectChangeState: setCurrentCurrCode,
                  })}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Trade Amount"
                  name="tradeCurrAmount"
                  hasFeedback
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
                  hasFeedback
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
                  hasFeedback
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
                  <Input
                    style={{ width: '100%', textTransform: 'uppercase' }}
                  />
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
        <Row>
          <Col span={12}>
            <Row>
              <Text style={{ fontSize: 16 }}>{`${
                custDetails.find(
                  (customer) => customer.cust_code === currentCustCode
                )?.customer_description ?? ''
              }`}</Text>
            </Row>
            <Row>
              {(() => {
                const value = receivablePayableDetails
                  .find((item) => item.cust_code === currentCustCode)
                  ?.difference.toFixed(2)

                if (!value) {
                  return <></>
                }
                return (
                  <>
                    <Text>
                      {Number(value) < 0 ? 'Receivable:' : 'Payable:'}
                    </Text>
                    <span>&nbsp;</span>
                    <Text>{value ? addCommas(value) : 0}</Text>
                  </>
                )
              })()}
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Text style={{ fontSize: 16 }}>{`${
                currDetails.find(
                  (currency) => currency.currency_code === currentCurrCode
                )?.currency_description ?? ''
              }`}</Text>
            </Row>
            <Row>
              <Text>
                {(() => {
                  const value = fcClosingStocks
                    .find((fc) => fc.code === currentCurrCode)
                    ?.closingStock.toFixed(2)

                  if (!value) {
                    return <></>
                  }
                  return (
                    <>
                      <Text>Closing Stock:&nbsp;</Text>
                      <Text>{value ? addCommas(value) : 0}</Text>
                    </>
                  )
                })()}
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
