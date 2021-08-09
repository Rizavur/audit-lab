import { Formik } from 'formik'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import {
  getCustomerDetails,
  getCustomerReportData,
  getOpeningBal,
} from '../../dbService'
import { CustomerDetail } from '../home'

interface CustomerReportFormikValues {
  custCode: string
  fromDate: string
  endDate: string
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
  const [customerReportData, setCustomerReportData] =
    useState<CustomerTransaction[]>()
  const [custDetails, setCustDetails] = useState<CustomerDetail[]>([])

  const init = async () => {
    const customers = await getCustomerDetails()
    setCustDetails(customers)
  }

  useEffect(() => {
    init()
  }, [])

  const handleSubmit = async (
    customerCode: string,
    fromDate: string,
    endDate: string
  ) => {
    const [data, openingBal] = await Promise.all([
      getCustomerReportData({ customerCode, fromDate, endDate }),
      getOpeningBal({ customerCode, fromDate }),
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

  return (
    <>
      <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
        Customer Report
      </h1>
      <Card style={{ margin: 20 }}>
        <Formik
          enableReinitialize
          initialValues={{
            custCode: '',
            fromDate: '',
            endDate: '',
          }}
          onSubmit={async (values: CustomerReportFormikValues) => {
            handleSubmit(values.custCode, values.fromDate, values.endDate)
          }}
        >
          {({ values, handleSubmit, handleChange, handleBlur }) => {
            return (
              <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                <Row>
                  <Form.Group className="col-md-auto">
                    <Form.Group className="mb-3">
                      <Form.Label>Customer</Form.Label>
                      <Form.Select
                        name="custCode"
                        value={values.custCode}
                        onChange={handleChange}
                      >
                        <option value="">---</option>
                        {custDetails.map((customer, index) => {
                          return (
                            <option key={index}>{customer.cust_code}</option>
                          )
                        })}
                      </Form.Select>
                    </Form.Group>
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Label>From Date</Form.Label>
                    <Form.Control
                      name="fromDate"
                      type="date"
                      value={values.fromDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Group>
                  <Form.Group className="col-md-auto">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      name="endDate"
                      type="date"
                      value={values.endDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Group>
                  <Col
                    md={3}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      variant="primary"
                      type="submit"
                      style={{
                        width: '80%',
                        height: '50%',
                        marginBottom: 18,
                      }}
                    >
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form>
            )
          }}
        </Formik>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buy/Sell</th>
              <th>Currency</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Reverse Rate</th>
              <th>SGD Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td style={{ fontWeight: 'bold' }}>Opening Balance:</td>
              <td style={{ fontWeight: 'bold' }}>
                {openingBalance.toFixed(2)}
              </td>
            </tr>
            {!!customerReportData &&
              customerReportData.map((detail) => {
                return detail.buy_or_sell === 'SELL' ? (
                  <tr>
                    <td>{detail.transaction_date}</td>
                    <td>{detail.buy_or_sell}</td>
                    <td>{detail.trade_curr_code}</td>
                    <td>{detail.trade_curr_amount}</td>
                    <td>{detail.rate}</td>
                    <td>{detail.reverse_rate}</td>
                    <td>{detail.settlement_curr_amount}</td>
                  </tr>
                ) : (
                  <tr>
                    <td>{detail.transaction_date}</td>
                    <td>{detail.buy_or_sell}</td>
                    <td>{detail.trade_curr_code}</td>
                    <td>{detail.trade_curr_amount}</td>
                    <td>{detail.rate}</td>
                    <td>{detail.reverse_rate}</td>
                    <td>{detail.settlement_curr_amount}</td>
                  </tr>
                )
              })}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td style={{ fontWeight: 'bold' }}>Closing Balance</td>
              <td>
                {(
                  openingBalance +
                  _.sumBy(customerReportData, 'settlement_curr_amount')
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </>
  )
}

export default CustomerReport
