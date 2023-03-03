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
import AllTransactionsTable from './transactionsComponents/allTransactionsTable'
import config from '../config.json'
import {
  CurrencyDetail,
  CustomerDetail,
  FcClosingStock,
  ReceivablePayable,
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
  InputNumber,
  Col,
  notification,
  Switch,
} from 'antd'
import { AntAutoComplete } from '../Components/AntAutoComplete'
import { addCommas } from '../Service/CommonService'
import DatePicker from '../Components/AntDatePicker'

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
    if (currentCurrCode === config.baseCurrency) {
      transactionFormRef.current.setFieldsValue({
        rate: 1,
        reverseRate: 1,
      })
    }
  }, [currentCurrCode])

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
    const currencyClosingStock = fcClosingStocks
      .find((fc) => fc.code === values.tradeCurrCode)
      ?.closingStock.toFixed(2)

    const formattedDate = moment(values.date).format('YYYY-MM-DD')
    if (
      values.buyOrSell === 'SELL' &&
      (!currencyClosingStock || currencyClosingStock < values.tradeCurrAmount)
    ) {
      notification['error']({
        placement: 'bottomRight',
        message: `Insufficient stock`,
        duration: null,
        description: `Transaction was unsuccessful: ${formattedDate} ${values.tradeCurrAmount} ${values.tradeCurrCode} → ${values.custCode}`,
      })
    } else {
      await addTransaction({
        ...values,
        date: formattedDate,
        pending: values.pending | 0,
      })
      setTransactionDone(transactionsDone + 1)
    }
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
              pending: '',
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
                    placeholder: 'Customer',
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
                    placeholder: 'Transaction',
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
                    placeholder: 'Currency',
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
                    formatter={(value: any) => addCommas(value, true)}
                    style={{ width: '100%' }}
                    placeholder="Trade Amount"
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
                    placeholder="Rate"
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
                    placeholder="Reverse Rate"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Settlement Amount" name="settlementAmount">
                  <InputNumber
                    readOnly
                    min={0}
                    precision={2}
                    formatter={(value: any) => addCommas(value, true)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Remarks" name="remarks">
                  <Input
                    style={{ width: '100%', textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Status" name="pending">
                  <Switch checkedChildren="Pending" unCheckedChildren="Done" />
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
