import { Formik } from 'formik'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import { getCurrencyDetails, getCurrencyReportData } from '../../dbService'
import config from '../../config.json'
import { CurrencyDetail } from '../../types'
import Title from 'antd/lib/typography/Title'
import { addCommas } from '../../Service/CommonService'

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

  const init = async () => {
    const currencies = await getCurrencyDetails()
    setCurrDetails(currencies)
  }

  useEffect(() => {
    init()
  }, [])

  const handleSubmit = async (currencyCode: string, date: string) => {
    const data = await getCurrencyReportData({
      currencyCode,
      date,
    })

    _.forEach(data, (item) => {
      if (item.buy_or_sell === 'SELL') {
        item.settlement_curr_amount = -Number(item.settlement_curr_amount)
      } else {
        item.settlement_curr_amount = Number(item.settlement_curr_amount)
      }
    })
    setCurrencyReportData(data)
  }

  return (
    <>
      <Title style={{ margin: 20 }}>Currency Report</Title>
      <Card style={{ margin: 20 }}>
        <Formik
          enableReinitialize
          initialValues={{
            currCode: '',
            date: moment().format('YYYY-MM-DD'),
          }}
          onSubmit={async (values: CurrencyReportFormikValues) => {
            handleSubmit(values.currCode, values.date)
          }}
        >
          {({ values, handleSubmit, handleChange, handleBlur }) => {
            return (
              <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                <Row>
                  <Col>
                    <Form.Group className="col-md-auto">
                      <Form.Group className="mb-3">
                        <Form.Label>Currency</Form.Label>
                        <Form.Select
                          name="currCode"
                          value={values.currCode}
                          onChange={handleChange}
                        >
                          <option value="">---</option>
                          {currDetails.map((currency, index) => {
                            return (
                              <option key={index}>
                                {currency.currency_code}
                              </option>
                            )
                          })}
                        </Form.Select>
                      </Form.Group>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="col-md-auto">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        name="date"
                        type="date"
                        value={values.date}
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
        {!!currencyReportData.length ? (
          <>
            <Row>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -20,
                }}
              >
                <p>
                  {'Amount bought - Amount sold = '}
                  <strong>Difference</strong>
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p>
                  {`${addCommas(
                    _.sumBy(
                      currencyReportData.filter(
                        (item) => item.buy_or_sell === 'BUY'
                      ),
                      'trade_curr_amount'
                    ).toFixed(2)
                  )}`}{' '}
                  -{' '}
                  {`${addCommas(
                    _.sumBy(
                      currencyReportData.filter(
                        (item) => item.buy_or_sell === 'SELL'
                      ),
                      'trade_curr_amount'
                    ).toFixed(2)
                  )}`}{' '}
                  ={' '}
                  <strong>
                    {`${addCommas(
                      (
                        _.sumBy(
                          currencyReportData.filter(
                            (item) => item.buy_or_sell === 'BUY'
                          ),
                          'trade_curr_amount'
                        ) -
                        _.sumBy(
                          currencyReportData.filter(
                            (item) => item.buy_or_sell === 'SELL'
                          ),
                          'trade_curr_amount'
                        )
                      ).toFixed(2)
                    )}`}
                  </strong>
                </p>
              </div>
            </Row>
            <Col style={{ marginLeft: 20, marginRight: 20 }}>
              <Row>
                <h5>Bought</h5>
              </Row>
              {currencyReportData.filter((item) => item.buy_or_sell === 'BUY')
                .length ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Rate</th>
                      <th>Reverse Rate</th>
                      <th>{config.baseCurrency + ' Value'}</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!!currencyReportData &&
                      currencyReportData
                        .filter((item) => item.buy_or_sell === 'BUY')
                        .map((detail) => {
                          return (
                            <tr>
                              <td>
                                {moment(detail.transaction_date)
                                  .startOf('day')
                                  .format('DD MMM YYYY')}
                              </td>
                              <td>{detail.cust_code}</td>
                              <td>
                                {addCommas(
                                  Number(detail.trade_curr_amount).toFixed(2)
                                )}
                              </td>
                              <td>{detail.rate}</td>
                              <td>{detail.reverse_rate}</td>
                              <td>
                                {addCommas(
                                  detail.settlement_curr_amount.toFixed(2)
                                )}
                              </td>
                              <td>{detail.remarks}</td>
                            </tr>
                          )
                        })}
                    <tr>
                      <td></td>
                      <td style={{ fontWeight: 'bold' }}>Amount bought</td>
                      <td>
                        {addCommas(
                          _.sumBy(
                            currencyReportData.filter(
                              (item) => item.buy_or_sell === 'BUY'
                            ),
                            'trade_curr_amount'
                          ).toFixed(2)
                        )}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  No bought transactions
                </div>
              )}
            </Col>
            <Col style={{ marginLeft: 20, marginRight: 20 }}>
              <Row>
                <h5>Sold</h5>
              </Row>
              {currencyReportData.filter((item) => item.buy_or_sell === 'SELL')
                .length ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Rate</th>
                      <th>Reverse Rate</th>
                      <th>{config.baseCurrency + ' Value'}</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!!currencyReportData &&
                      currencyReportData
                        .filter((item) => item.buy_or_sell === 'SELL')
                        .map((detail) => {
                          return (
                            <tr>
                              <td>
                                {moment(detail.transaction_date)
                                  .startOf('day')
                                  .format('DD MMM YYYY')}
                              </td>
                              <td>{detail.cust_code}</td>
                              <td>
                                {addCommas(
                                  Number(detail.trade_curr_amount).toFixed(2)
                                )}
                              </td>
                              <td>{detail.rate}</td>
                              <td>{detail.reverse_rate}</td>
                              <td>
                                {addCommas(
                                  detail.settlement_curr_amount.toFixed(2)
                                )}
                              </td>
                              <td>{detail.remarks}</td>
                            </tr>
                          )
                        })}
                    <tr>
                      <td></td>
                      <td style={{ fontWeight: 'bold' }}>Amount sold</td>
                      <td>
                        {addCommas(
                          _.sumBy(
                            currencyReportData.filter(
                              (item) => item.buy_or_sell === 'SELL'
                            ),
                            'trade_curr_amount'
                          ).toFixed(2)
                        )}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  No sold transactions
                </div>
              )}
            </Col>
          </>
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

export default CurrencyReport
