import _, { round } from 'lodash'
import config from '../../config.json'
import { useEffect, useState } from 'react'
import { Accordion, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import {
  getCapital,
  getCashInHand,
  getFcClosingDetails,
  getPurchaseAmount,
  getReceivablePayableAmount,
  getReceivablePayableDetails,
  getTotalExpenses,
  getTotalSales,
} from '../../dbService'
import moment from 'moment'
import { EnterPasswordModal } from '../EnterPasswordModal'

export interface ReceivablePayable {
  cust_code: string
  customer_description: string
  difference: number
}

interface FcClosingDetail {
  code: string
  stockBought: number
  avg_rate: number
  stockSold: number
  currency_description: string
  fcClosing: number
  baseValue: number
}

export const addCommas = (nStr: string) => {
  if (round(Number(nStr), 2) === 0) {
    return ''
  }
  nStr += ''
  var x = nStr.split('.')
  var x1 = x[0]
  var x2 = x.length > 1 ? '.' + x[1] : ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return x1 + x2
}

const OverallReport = () => {
  const [purchaseAmount, setPurchaseAmount] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [cashInHand, setCashInHand] = useState(0)
  const [capital, setCapital] = useState(0)
  const [receivable, setReceivable] = useState(0)
  const [payable, setPayable] = useState(0)
  const [receivablePayableDetails, setReceivablePayableDetails] = useState<
    ReceivablePayable[]
  >([])
  const [fcClosingDetails, setFcClosingDetails] = useState<FcClosingDetail[]>(
    []
  )
  const [reportDate, setReportDate] = useState(moment().format('YYYY-MM-DD'))
  const [isLoading, setIsLoading] = useState(true)
  const [canAccess, setCanAccess] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(true)

  const init = async (reportDate: string) => {
    try {
      const [
        purchaseAmt,
        totalSales,
        totalExp,
        cashHand,
        cap,
        receivableAndPayable,
        receivableAndPayableDetails,
        fcClosingDetail,
      ] = await Promise.all([
        getPurchaseAmount(reportDate),
        getTotalSales(reportDate),
        getTotalExpenses(reportDate),
        getCashInHand(reportDate),
        getCapital(reportDate),
        getReceivablePayableAmount(reportDate),
        getReceivablePayableDetails(reportDate) as Promise<ReceivablePayable[]>,
        getFcClosingDetails(reportDate) as Promise<FcClosingDetail[]>,
      ])
      setPurchaseAmount(purchaseAmt[0].purchase_amount)
      setTotalSales(totalSales[0].total_sales)
      setTotalExpenses(totalExp[0].expenses)
      setCashInHand(cashHand[0].cashInHand)
      setCapital(cap[0].capital)
      setReceivable(-receivableAndPayable[0].receivable)
      setPayable(receivableAndPayable[0].payable)
      setReceivablePayableDetails(receivableAndPayableDetails)
      _.forEach(fcClosingDetail, (item) => {
        item.baseValue = !!item.baseValue
          ? Number(item.baseValue.toFixed(2))
          : item.baseValue
      })
      setFcClosingDetails(fcClosingDetail)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    init(reportDate)
  }, [reportDate])

  if (!canAccess) {
    return (
      <EnterPasswordModal
        setAccess={setCanAccess}
        setShowModal={setShowPasswordModal}
        isPasswordModalShown={showPasswordModal}
        screen="Overall Report"
      />
    )
  }

  return (
    <>
      <Row>
        <Col xs={9} md={9} lg={9}>
          <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
            Overall Report
          </h1>
        </Col>
        <Col xs={3} md={3} lg={3}>
          <Form style={{ padding: 25 }}>
            <Form.Group className="col-md-auto">
              <Form.Control
                name="reportDate"
                type="date"
                value={reportDate}
                onChange={(e) => {
                  setReportDate(e.target.value)
                  setIsLoading(true)
                }}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row
        style={{ justifyContent: 'center', marginLeft: 15, marginRight: 15 }}
      >
        {isLoading ? (
          <Spinner
            animation="border"
            role="status"
            style={{ alignItems: 'center' }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : (
          <Accordion defaultActiveKey="2" style={{ margin: 20 }}>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Receivable & Payable</Accordion.Header>
              <Accordion.Body style={{ margin: 20 }}>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Customer Code</th>
                      <th>Customer Description</th>
                      <th>Payable</th>
                      <th>Receivable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!!receivablePayableDetails &&
                      receivablePayableDetails.length &&
                      receivablePayableDetails.map((detail) => {
                        if (Math.abs(round(detail.difference, 2)) === 0) {
                          return null
                        }
                        return detail.difference > 0 ? (
                          <tr>
                            <td>{detail.cust_code}</td>
                            <td>{detail.customer_description}</td>
                            <td align="right">
                              {addCommas(detail.difference.toFixed(2))}
                            </td>
                            <td></td>
                          </tr>
                        ) : (
                          <tr>
                            <td>{detail.cust_code}</td>
                            <td>{detail.customer_description}</td>
                            <td></td>
                            <td align="right">
                              {addCommas(detail.difference.toFixed(2))}
                            </td>
                          </tr>
                        )
                      })}
                    <tr style={{ fontWeight: 'bold' }}>
                      <td></td>
                      <td align="right">Total:</td>
                      <td align="right">
                        {!!payable && addCommas(payable.toFixed(2))}
                      </td>
                      <td align="right">
                        {addCommas((-receivable).toFixed(2))}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Currency Stock</Accordion.Header>
              <Accordion.Body style={{ margin: 20 }}>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Currency Code</th>
                      <th>Currency Description</th>
                      <th>FC Stock</th>
                      <th>Average Rate</th>
                      <th>Average Reverse Rate</th>
                      <th>{config.baseCurrency + ' Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!!fcClosingDetails &&
                      fcClosingDetails.map((detail) => {
                        return detail.baseValue !== 0 ? (
                          <tr>
                            <td>{detail.code}</td>
                            <td>{detail.currency_description}</td>
                            <td align="right">
                              {!!detail.fcClosing &&
                                addCommas(detail.fcClosing.toFixed(2))}
                            </td>
                            <td>{detail.avg_rate}</td>
                            <td>{1 / detail.avg_rate}</td>
                            <td align="right">
                              {!!detail.baseValue &&
                                addCommas(detail.baseValue.toFixed(2))}
                            </td>
                          </tr>
                        ) : null
                      })}
                    <tr style={{ fontWeight: 'bold' }}>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td align="right">Total:</td>
                      <td align="right">
                        {addCommas(
                          _.sumBy(fcClosingDetails, 'baseValue').toFixed(2)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Balance Sheet</Accordion.Header>
              <Accordion.Body style={{ margin: 20 }}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>{`Amount (${config.baseCurrency})`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Gross Profit</td>
                      <td align="right">
                        {addCommas(
                          (
                            totalSales -
                            (purchaseAmount -
                              _.sumBy(fcClosingDetails, 'baseValue'))
                          ).toFixed(2)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Total Expenses</td>
                      <td align="right">
                        {addCommas(totalExpenses.toFixed(2))}
                      </td>
                    </tr>
                    <tr>
                      <td>Total Net Profit</td>
                      <td align="right">
                        {addCommas(
                          (
                            Number(
                              (
                                totalSales -
                                (purchaseAmount -
                                  _.sumBy(fcClosingDetails, 'baseValue'))
                              ).toFixed(2)
                            ) - totalExpenses
                          ).toFixed(2)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Opening Capital</td>
                      <td align="right">{addCommas(capital.toFixed(2))}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'black' }}>
                      <td style={{ height: 40 }}></td>
                      <td></td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>Closing Capital</td>
                      <td align="right">
                        {addCommas(
                          (
                            Number(capital.toFixed(2)) +
                            Number(
                              (
                                totalSales -
                                (purchaseAmount -
                                  _.sumBy(fcClosingDetails, 'baseValue'))
                              ).toFixed(2)
                            ) -
                            totalExpenses
                          ).toFixed(2)
                        )}
                      </td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>Payable</td>
                      <td align="right">
                        {addCommas(!!payable ? payable.toFixed(2) : '0.00')}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: 'black' }}>
                      <td style={{ color: 'white', fontWeight: 'bold' }}>
                        Total Liability
                      </td>
                      <td
                        align="right"
                        style={{ color: 'white', fontWeight: 'bold' }}
                      >
                        {
                          // Net Profit = grossProfit - totalExpenses
                          addCommas(
                            (
                              Number(
                                (
                                  totalSales -
                                  (purchaseAmount -
                                    _.sumBy(fcClosingDetails, 'baseValue'))
                                ).toFixed(2)
                              ) -
                              totalExpenses +
                              capital +
                              payable
                            ).toFixed(2)
                          )
                        }
                      </td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>FC Closing Stock Value</td>
                      <td align="right">
                        {addCommas(
                          _.sumBy(fcClosingDetails, 'baseValue').toFixed(2)
                        )}
                      </td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>{`${config.baseCurrency} Cash In Hand`}</td>
                      <td align="right">{addCommas(cashInHand.toFixed(2))}</td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>Receivable</td>
                      <td align="right">
                        {addCommas(
                          !!receivable ? receivable.toFixed(2) : '0.00'
                        )}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: 'black' }}>
                      <td style={{ color: 'white', fontWeight: 'bold' }}>
                        Total Assets
                      </td>
                      <td
                        align="right"
                        style={{ color: 'white', fontWeight: 'bold' }}
                      >
                        {addCommas(
                          (
                            cashInHand +
                            receivable +
                            Number.parseFloat(
                              _.sumBy(fcClosingDetails, 'baseValue').toString()
                            )
                          ).toFixed(2)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}
      </Row>
    </>
  )
}

export default OverallReport
