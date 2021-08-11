import { Formik } from 'formik'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Accordion, Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
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

interface ReceivablePayable {
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
  sgdValue: number
}

export const addCommas = (nStr: string) => {
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

  const init = async () => {
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
      getPurchaseAmount(),
      getTotalSales(),
      getTotalExpenses(),
      getCashInHand(),
      getCapital(),
      getReceivablePayableAmount(),
      getReceivablePayableDetails() as Promise<ReceivablePayable[]>,
      getFcClosingDetails() as Promise<FcClosingDetail[]>,
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
      item.sgdValue = !!item.sgdValue
        ? Number(item.sgdValue.toFixed(2))
        : item.sgdValue
    })
    setFcClosingDetails(fcClosingDetail)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <>
      <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
        Overall Report
      </h1>
      <Accordion defaultActiveKey="2" style={{ margin: 20 }}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Receivable & Payable</Accordion.Header>
          <Accordion.Body style={{ margin: 20 }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Customer Code</th>
                  <th>Customer Description</th>
                  <th>Payable</th>
                  <th>Receivable</th>
                </tr>
              </thead>
              <tbody>
                {!!receivablePayableDetails.length &&
                  receivablePayableDetails.map((detail) => {
                    if (detail.difference === 0) {
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
                <tr>
                  <td></td>
                  <td></td>
                  <td align="right" style={{ fontWeight: 'bold' }}>
                    {!!payable && addCommas(payable.toFixed(2))}
                  </td>
                  <td align="right" style={{ fontWeight: 'bold' }}>
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
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Currency Code</th>
                  <th>Currency Description</th>
                  <th>FC Stock</th>
                  <th>Average Rate</th>
                  <th>Average Reverse Rate</th>
                  <th>SGD Amount</th>
                </tr>
              </thead>
              <tbody>
                {!!fcClosingDetails &&
                  fcClosingDetails.map((detail) => {
                    return detail.sgdValue !== 0 ? (
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
                          {!!detail.sgdValue &&
                            addCommas(detail.sgdValue.toFixed(2))}
                        </td>
                      </tr>
                    ) : null
                  })}
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td align="right" style={{ fontWeight: 'bold' }}>
                    {addCommas(
                      _.sumBy(fcClosingDetails, 'sgdValue').toFixed(2)
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
                  <th>Amount (SGD)</th>
                </tr>
              </thead>
              <tbody>
                {/* <tr>
              <td>Purchase amount</td>
              <td>{purchaseAmount}</td>
            </tr>
            <tr>
              <td>Cost of sales</td>
              <td>
                {(
                  purchaseAmount - _.sumBy(fcClosingDetails, 'sgdValue')
                ).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td>Total sales</td>
              <td>{totalSales.toFixed(2)}</td>
            </tr> */}
                <tr>
                  <td>Gross profit</td>
                  <td align="right">
                    {addCommas(
                      (
                        totalSales -
                        (purchaseAmount - _.sumBy(fcClosingDetails, 'sgdValue'))
                      ).toFixed(2)
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Total expenses</td>
                  <td align="right">{addCommas(totalExpenses.toFixed(2))}</td>
                </tr>
                <tr style={{ backgroundColor: 'black' }}>
                  <td style={{ height: 40 }}></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Net profit</td>
                  <td align="right">
                    {addCommas(
                      (
                        Number(
                          (
                            totalSales -
                            (purchaseAmount -
                              _.sumBy(fcClosingDetails, 'sgdValue'))
                          ).toFixed(2)
                        ) - totalExpenses
                      ).toFixed(2)
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Capital</td>
                  <td align="right">{addCommas(capital.toFixed(2))}</td>
                </tr>
                <tr>
                  <td>Payable</td>
                  <td align="right">
                    {!!payable && addCommas(payable.toFixed(2))}
                  </td>
                </tr>
                <tr style={{ backgroundColor: 'black' }}>
                  <td style={{ color: 'white', fontWeight: 'bold' }}>
                    Total liability
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
                                _.sumBy(fcClosingDetails, 'sgdValue'))
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
                <tr>
                  <td>FC closing stock value</td>
                  <td align="right">
                    {addCommas(
                      _.sumBy(fcClosingDetails, 'sgdValue').toFixed(2)
                    )}
                  </td>
                </tr>
                <tr>
                  <td>SGD cash in hand</td>
                  <td align="right">{addCommas(cashInHand.toFixed(2))}</td>
                </tr>
                <tr>
                  <td>Receivable</td>
                  <td align="right">{addCommas(receivable.toFixed(2))}</td>
                </tr>
                <tr style={{ backgroundColor: 'black' }}>
                  <td style={{ color: 'white', fontWeight: 'bold' }}>
                    Total assets
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
                          _.sumBy(fcClosingDetails, 'sgdValue').toString()
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
    </>
  )
}

export default OverallReport
