import { Formik } from 'formik'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Card, Form, Button, Row, InputGroup } from 'react-bootstrap'
import * as Yup from 'yup'
import {
  getCustomerDetails,
  getCurrencyDetails,
  getLatestTransactionNo,
  addTransaction,
} from '../dbService'
import AllTransactionsTable from './transactionsComponents/allTransactionsTable'
declare global {
  interface Window {
    api?: any
  }
}

export interface CurrencyDetail {
  currency_id: number
  currency_code: string
  currency_description: string
}

export interface CustomerDetail {
  cust_id: number
  cust_code: string
  customer_description: string
}

export interface TransactionFormikValues {
  date: string
  buyOrSell?: string
  custCode?: string
  rate: number | string
  reverseRate: number | string
  tradeCurrCode?: string
  tradeCurrAmount: number | string
  settlementAmount: number
}

const Transactions = () => {
  const [transactionNo, setTransactionNo] = useState<number>()
  const [currDetails, setCurrDetails] = useState<CurrencyDetail[]>([])
  const [custDetails, setCustDetails] = useState<CustomerDetail[]>([])
  const [transactionsDone, setTransactionDone] = useState<number>(0)

  const intializeTransactionForm = async () => {
    const [transactionNo, currencyDetails, customerDetails] = await Promise.all(
      [
        getLatestTransactionNo() as Promise<number>,
        getCurrencyDetails() as Promise<CurrencyDetail[]>,
        getCustomerDetails() as Promise<CustomerDetail[]>,
      ]
    )
    setTransactionNo(transactionNo)
    setCurrDetails(currencyDetails)
    setCustDetails(customerDetails)
  }

  useEffect(() => {
    intializeTransactionForm()
  }, [transactionsDone])

  const TransactionSchema = Yup.object().shape({
    date: Yup.date().required('Required'),
    buyOrSell: Yup.string()
      .matches(/(buy|sell)/, { excludeEmptyString: true })
      .required('Required'),
    custCode: Yup.string().required('Required'),
    tradeCurrCode: Yup.string().required('Required'),
    tradeCurrAmount: Yup.number().min(0.01).required('Required'),
  })

  return (
    <>
      <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
        Add a new transaction
      </h1>
      <Card style={{ margin: 20 }}>
        <Formik
          enableReinitialize={true}
          initialValues={{
            date: moment().format('YYYY-MM-DD'),
            buyOrSell: undefined,
            custCode: undefined,
            rate: '',
            reverseRate: '',
            tradeCurrCode: undefined,
            tradeCurrAmount: '',
            settlementAmount: 0,
          }}
          onSubmit={(values: TransactionFormikValues, { resetForm }) => {
            values.settlementAmount =
              Number(values.tradeCurrAmount) * Number(values.rate)
            if (values.rate !== '' && values.reverseRate !== '') {
              addTransaction(values)
              setTransactionDone(transactionsDone + 1)
              resetForm({})
            }
          }}
          validationSchema={TransactionSchema}
        >
          {({
            values,
            handleSubmit,
            handleChange,
            handleBlur,
            errors,
            touched,
            setFieldValue,
          }) => {
            return (
              <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                <Card.Title>{`Record No. ${transactionNo ?? ''}`}</Card.Title>
                <Row>
                  <Form.Group className="col-md-auto">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      name="date"
                      type="date"
                      defaultValue={values.date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.date && touched.date ? (
                      <div>{errors.date}</div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Group className="mb-3">
                      <Form.Label>Buy / Sell</Form.Label>
                      <Form.Select
                        id="buyOrSell"
                        onChange={handleChange}
                        value={values.buyOrSell}
                      >
                        <option value={undefined}></option>
                        <option value="buy">BUY</option>
                        <option value="sell">SELL</option>
                      </Form.Select>
                      {errors.buyOrSell && touched.buyOrSell ? (
                        <div style={{ color: 'red' }}>{errors.buyOrSell}</div>
                      ) : null}
                    </Form.Group>
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Code</Form.Label>
                      <Form.Select
                        name="custCode"
                        value={values.custCode}
                        onChange={handleChange}
                      >
                        <option></option>
                        {custDetails.map((customer, index) => {
                          return (
                            <option key={index}>{customer.cust_code}</option>
                          )
                        })}
                      </Form.Select>
                      {errors.custCode && touched.custCode ? (
                        <div style={{ color: 'red' }}>{errors.custCode}</div>
                      ) : null}
                    </Form.Group>
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Label>Customer Description</Form.Label>
                    <Form.Control
                      readOnly
                      value={
                        custDetails.find(
                          (customer) => customer.cust_code === values.custCode
                        )?.customer_description ?? ''
                      }
                    />
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Group className="mb-3">
                      <Form.Label>Trade Currency</Form.Label>
                      <Form.Select
                        name="tradeCurrCode"
                        value={values.tradeCurrCode}
                        onChange={handleChange}
                      >
                        <option></option>
                        {currDetails.map((currency, index) => {
                          return (
                            <option key={index}>
                              {currency.currency_code}
                            </option>
                          )
                        })}
                      </Form.Select>
                      {errors.tradeCurrCode && touched.tradeCurrCode ? (
                        <div style={{ color: 'red' }}>
                          {errors.tradeCurrCode}
                        </div>
                      ) : null}
                    </Form.Group>
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Label>Trade Currency Description</Form.Label>
                    <Form.Control
                      readOnly
                      value={
                        currDetails.find(
                          (currency) =>
                            currency.currency_code === values.tradeCurrCode
                        )?.currency_description ?? ''
                      }
                    />
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Group className="mb-3">
                      <Form.Label>Trade Amount</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          {values.tradeCurrCode}
                        </InputGroup.Text>
                        <Form.Control
                          name="tradeCurrAmount"
                          type="number"
                          min="0.01"
                          max="100000000.00"
                          step="0.01"
                          value={values.tradeCurrAmount}
                          onChange={handleChange}
                        />
                      </InputGroup>
                      {errors.tradeCurrAmount && touched.tradeCurrAmount ? (
                        <div style={{ color: 'red' }}>
                          {errors.tradeCurrAmount}
                        </div>
                      ) : null}
                    </Form.Group>
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Group className="mb-3">
                      <Form.Label>Rate</Form.Label>
                      <Form.Control
                        name="rate"
                        type="number"
                        min="0.0000000001"
                        max="100000000.00"
                        step="0.00000000001"
                        value={values.rate}
                        onChange={(e) => {
                          handleChange(e)
                          setFieldValue(
                            'reverseRate',
                            parseFloat((1 / Number(e.target.value)).toFixed(11))
                          )
                        }}
                        onClick={() => {
                          setFieldValue('rate', '')
                          setFieldValue('reverseRate', '')
                        }}
                      />
                    </Form.Group>
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Group className="mb-3">
                      <Form.Label>Reverse Rate</Form.Label>
                      <Form.Control
                        name="reverseRate"
                        type="number"
                        min="0.0000000001"
                        max="100000000.00"
                        step="0.00000000001"
                        value={values.reverseRate}
                        onChange={(e) => {
                          handleChange(e)
                          setFieldValue(
                            'rate',
                            parseFloat((1 / Number(e.target.value)).toFixed(11))
                          )
                        }}
                        onClick={() => {
                          setFieldValue('rate', '')
                          setFieldValue('reverseRate', '')
                        }}
                      />
                    </Form.Group>
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Label>Settlement Amount</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>SGD$</InputGroup.Text>
                      <Form.Control
                        readOnly
                        name="settlementAmount"
                        type="number"
                        min="0.01"
                        max="100000000.00"
                        step="0.01"
                        value={
                          values.rate !== ''
                            ? (
                                Number(values.tradeCurrAmount) *
                                Number(values.rate)
                              ).toFixed(2)
                            : values.reverseRate !== ''
                            ? (
                                Number(values.tradeCurrAmount) /
                                Number(values.reverseRate)
                              ).toFixed(2)
                            : 0
                        }
                      />
                    </InputGroup>
                  </Form.Group>
                </Row>
                <Button
                  variant="primary"
                  type="submit"
                  style={{ marginTop: 20, width: '100%' }}
                >
                  Submit
                </Button>
              </Form>
            )
          }}
        </Formik>
      </Card>
      <Card style={{ margin: 20 }}>
        <AllTransactionsTable refresh={transactionsDone} />
      </Card>
    </>
  )
}

export default Transactions
