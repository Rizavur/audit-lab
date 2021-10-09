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
import { addCommas } from './overallReport'
import config from '../../config.json'

interface CustomerReportFormikValues {
  custCode: string
  startDate: string
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
  const [customerReportData, setCustomerReportData] = useState<
    CustomerTransaction[]
  >([])
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
    startDate: string,
    endDate: string
  ) => {
    const [data, openingBal] = await Promise.all([
      getCustomerReportData({ customerCode, startDate, endDate }),
      getOpeningBal({ customerCode, startDate }),
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
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
          }}
          onSubmit={async (values: CustomerReportFormikValues) => {
            handleSubmit(values.custCode, values.startDate, values.endDate)
          }}
        >
          {({ values, handleSubmit, handleChange, handleBlur }) => {
            return (
              <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                <Row>
                  <Col>
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
                    <div>
                      {
                        custDetails.find(
                          (item) => item.cust_code === values.custCode
                        )?.customer_description
                      }
                    </div>
                  </Col>
                  <Col>
                    <Form.Group className="col-md-auto">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        name="startDate"
                        type="date"
                        value={values.startDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
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
                  </Col>
                  <Col
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      variant="primary"
                      type="submit"
                      style={{ marginTop: 32, width: '100%' }}
                    >
                      Search
                    </Button>
                  </Col>
                </Row>
              </Form>
            )
          }}
        </Formik>
        {!!customerReportData.length ? (
          <Row style={{ marginLeft: 20, marginRight: 20 }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Buy/Sell</th>
                  <th>Currency</th>
                  <th>Amount</th>
                  <th>Rate</th>
                  <th>Reverse Rate</th>
                  <th>{config.baseCurrency + ' Value'}</th>
                  <th>Remarks</th>
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
                    {addCommas(openingBalance.toFixed(2))}
                  </td>
                  <td></td>
                </tr>
                {!!customerReportData &&
                  customerReportData.map((detail) => {
                    return (
                      <tr>
                        <td>
                          {moment(detail.transaction_date)
                            .startOf('day')
                            .format('DD MMMM YYYY')}
                        </td>
                        <td>{detail.buy_or_sell}</td>
                        <td>{detail.trade_curr_code}</td>
                        <td>{addCommas(detail.trade_curr_amount)}</td>
                        <td>{detail.rate}</td>
                        <td>{detail.reverse_rate}</td>
                        <td>
                          {addCommas(detail.settlement_curr_amount.toFixed(2))}
                        </td>
                        <td>{detail.remarks}</td>
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
                    {addCommas(
                      (
                        openingBalance +
                        _.sumBy(customerReportData, 'settlement_curr_amount')
                      ).toFixed(2)
                    )}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </Row>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            No transactions
          </div>
        )}
      </Card>
    </>
  )
}

export default CustomerReport
