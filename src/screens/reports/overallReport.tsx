import _, { round } from 'lodash'
import config from '../../config.json'
import { useEffect, useRef, useState } from 'react'
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
import { EnterPassword } from '../EnterPassword'
import Title from 'antd/lib/typography/Title'
import { LockFilled, UnlockFilled } from '@ant-design/icons'
import { addCommas } from '../../Service/CommonService'
import { Col, Form, Row, Table, Tabs } from 'antd'
import { FcClosingDetail, ReceivablePayable } from '../../types'
import DatePicker from '../../Components/AntDatePicker'

const OverallReport = () => {
  const dateFormRef: any = useRef()
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
  const [combinedData, setCombinedData] = useState<any>()
  const [reportDate, setReportDate] = useState(moment().format('YYYY-MM-DD'))
  const [canAccess, setCanAccess] = useState(false)

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
        getReceivablePayableDetails(reportDate, false) as Promise<
          ReceivablePayable[]
        >,
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
      setFcClosingDetails(fcClosingDetail)
      setCombinedData(
        combineCurrencyAndRPDetails(
          receivableAndPayableDetails,
          fcClosingDetail
        )
      )
    } catch (error) {
      console.log(error)
    }
  }

  const onFinish = (values: { reportDate: string }) => {
    setReportDate(moment(values.reportDate).format('YYYY-MM-DD'))
  }

  useEffect(() => {
    init(reportDate)
  }, [reportDate])

  const replaceKeys = (data: any, mapping: any) =>
    Object.fromEntries(
      Object.entries(data).map(([k, v]) => [mapping[k] || k, v])
    )

  const combineCurrencyAndRPDetails = (
    receivableAndPayableDetails: any,
    fcClosingDetails: any
  ) => {
    const mapping = {
      cust_code: 'code',
      customer_description: 'description',
      difference: 'amount',
      currency_description: 'description',
      baseValue: 'amount',
    }

    const filteredRP = receivableAndPayableDetails.filter(
      (item: any) => Math.abs(round(item.difference, 2)) !== 0
    )
    const filteredFC = fcClosingDetails.filter(
      (item: any) => Math.abs(round(item.fcClosing, 2)) !== 0
    )

    const combined = filteredRP
      .map((item: any) => {
        return { ...item, difference: -item.difference }
      })
      .concat([{ code: '', description: '', amount: 0 }])
      .concat(filteredFC)
    const newCombined = combined.map((item: any) => replaceKeys(item, mapping))
    return newCombined
  }

  const receivablePayableColumns = [
    {
      dataIndex: 'cust_code',
      key: 'cust_code',
      title: 'Customer Code',
    },
    {
      dataIndex: 'customer_description',
      key: 'customer_description',
      title: 'Customer Description',
    },
    {
      dataIndex: 'difference',
      key: 'difference',
      title: 'Payable',
      render: (amount: number) =>
        amount > 0 &&
        Math.abs(round(amount, 2)) !== 0 && (
          <>{'$ ' + addCommas(amount.toFixed(2))}</>
        ),
    },
    {
      dataIndex: 'difference',
      key: 'difference',
      title: 'Receivable',
      render: (amount: number) =>
        amount < 0 &&
        Math.abs(round(amount, 2)) !== 0 && (
          <>{'$ ' + addCommas(amount.toFixed(2))}</>
        ),
    },
  ]

  const combinedColumns = [
    {
      dataIndex: 'code',
      key: 'code',
      title: 'Code',
    },
    {
      dataIndex: 'description',
      key: 'description',
      title: 'Description',
    },
    {
      dataIndex: 'amount',
      key: 'amount',
      title: 'Amount',
      render: (amount: number) =>
        Math.abs(round(amount, 2)) !== 0 &&
        (amount > 0 ? (
          <span style={{ color: 'black' }}>
            {'$ ' + addCommas(amount.toFixed(2))}
          </span>
        ) : (
          <span style={{ color: 'red' }}>
            {'$ ' + addCommas(amount.toFixed(2))}
          </span>
        )),
    },
  ]

  const currencyClosingStockColumns = [
    {
      dataIndex: 'code',
      key: 'code',
      title: 'Currency Code',
    },
    {
      dataIndex: 'currency_description',
      key: 'currency_description',
      title: 'Currency Description',
    },
    {
      dataIndex: 'fcClosing',
      key: 'fcClosing',
      title: 'Currency Stock',
      render: (rate: number) => <>{addCommas(rate.toFixed(2))}</>,
    },
    {
      dataIndex: 'avg_rate',
      key: 'avg_rate',
      title: 'Average Rate',
    },
    {
      dataIndex: 'avg_rate',
      key: 'avg_rate',
      title: 'Average Reverse Rate',
      render: (rate: number) => <>{1 / rate}</>,
    },
    {
      dataIndex: 'baseValue',
      key: 'baseValue',
      title: config.baseCurrency + ' Amount',
      render: (amount: number) => amount && addCommas('$ ' + amount.toFixed(2)),
    },
  ]

  const balanceSheetData = [
    {
      description: 'Gross Profit',
      value:
        '$ ' +
        addCommas(
          (
            totalSales -
            (purchaseAmount -
              _.sumBy(
                _.filter(
                  fcClosingDetails,
                  (item: FcClosingDetail) =>
                    item.code !== config.baseCurrency && !!item.baseValue
                ),
                'baseValue'
              ))
          ).toFixed(2)
        ),
    },
    {
      description: 'Total Expenses',
      value: '$ ' + addCommas(totalExpenses.toFixed(2)),
    },
    {
      description: 'Total Net Profit',
      value:
        '$ ' +
        addCommas(
          (
            Number(
              (
                totalSales -
                (purchaseAmount -
                  _.sumBy(
                    _.filter(
                      fcClosingDetails,
                      (item: FcClosingDetail) =>
                        item.code !== config.baseCurrency && !!item.baseValue
                    ),
                    'baseValue'
                  ))
              ).toFixed(2)
            ) - totalExpenses
          ).toFixed(2)
        ),
    },
    {
      description: 'Opening Capital',
      value: '$ ' + addCommas(capital.toFixed(2)),
    },
    {
      description: '',
      value: '',
    },
    {
      description: 'Closing Capital',
      value:
        '$ ' +
        addCommas(
          (
            Number(capital.toFixed(2)) +
            Number(
              (
                totalSales -
                (purchaseAmount -
                  _.sumBy(
                    _.filter(
                      fcClosingDetails,
                      (item: FcClosingDetail) =>
                        item.code !== config.baseCurrency && !!item.baseValue
                    ),
                    'baseValue'
                  ))
              ).toFixed(2)
            ) -
            totalExpenses
          ).toFixed(2)
        ),
    },
    {
      description: 'Payable',
      value: '$ ' + addCommas(!!payable ? payable.toFixed(2) : '0.00'),
    },
    {
      description: 'Total Liability',
      // Net Profit = grossProfit - totalExpenses
      value:
        '$ ' +
        addCommas(
          (
            Number(
              (
                totalSales -
                (purchaseAmount -
                  _.sumBy(
                    _.filter(
                      fcClosingDetails,
                      (item: FcClosingDetail) =>
                        item.code !== config.baseCurrency && !!item.baseValue
                    ),
                    'baseValue'
                  ))
              ).toFixed(2)
            ) -
            totalExpenses +
            capital +
            payable
          ).toFixed(2)
        ),
    },
    {
      description: 'Foreign Currency Closing Stock Value',
      value:
        '$ ' +
        addCommas(
          _.sumBy(
            _.filter(
              fcClosingDetails,
              (item: FcClosingDetail) =>
                item.code !== config.baseCurrency && !!item.baseValue
            ),
            'baseValue'
          ).toFixed(2)
        ),
    },
    {
      description: `Cash In Hand (${config.baseCurrency})`,
      value: '$ ' + addCommas(cashInHand.toFixed(2)),
    },
    {
      description: 'Receivable',
      value: '$ ' + addCommas(!!receivable ? receivable.toFixed(2) : '0.00'),
    },
    {
      description: 'Total Assets',
      value:
        '$ ' +
        addCommas(
          (
            cashInHand +
            receivable +
            Number.parseFloat(
              _.sumBy(
                _.filter(
                  fcClosingDetails,
                  (item: FcClosingDetail) =>
                    item.code !== config.baseCurrency && !!item.baseValue
                ),
                'baseValue'
              ).toString()
            )
          ).toFixed(2)
        ),
    },
  ]

  const balanceSheetColumns = [
    {
      dataIndex: 'description',
      key: 'description',
      title: 'Description',
      render: (description: string) => {
        const blackBackgroundDescriptions = [
          '',
          'Total Liability',
          'Total Assets',
        ]
        return {
          props: {
            style: {
              background: blackBackgroundDescriptions.includes(description)
                ? 'black'
                : 'white',
              color: blackBackgroundDescriptions.includes(description)
                ? 'white'
                : 'black',
              fontWeight: blackBackgroundDescriptions.includes(description)
                ? 'bold'
                : 'default',
              height: 37,
            },
          },
          children: <div>{description}</div>,
        }
      },
    },
    {
      dataIndex: 'value',
      key: 'value',
      title: `Value (${config.baseCurrency})`,
      align: 'right' as 'right',
      render: (value: string, record: any) => {
        const description = record.description
        const blackBackgroundDescriptions = [
          '',
          'Total Liability',
          'Total Assets',
        ]
        return {
          props: {
            style: {
              background: blackBackgroundDescriptions.includes(description)
                ? 'black'
                : 'white',
              color: blackBackgroundDescriptions.includes(description)
                ? 'white'
                : 'black',
              fontWeight: blackBackgroundDescriptions.includes(description)
                ? 'bold'
                : 'default',
              height: 37,
            },
          },
          children: <div>{value}</div>,
        }
      },
    },
  ]

  return (
    <>
      <Row justify="space-between">
        <Col
          style={{
            marginLeft: 20,
          }}
        >
          <Title style={{ display: 'flex', alignItems: 'center' }}>
            Overall Report{' '}
            {canAccess ? (
              <UnlockFilled
                style={{ marginLeft: 20 }}
                onClick={() => setCanAccess(false)}
              />
            ) : (
              <LockFilled style={{ marginLeft: 20 }} />
            )}
          </Title>
        </Col>
        <Col>
          <Form
            style={{ marginRight: 20, marginTop: 10 }}
            onFinish={onFinish}
            ref={dateFormRef}
            initialValues={{ reportDate: moment() }}
          >
            <Form.Item name="reportDate">
              <DatePicker
                onChange={() => {
                  if (dateFormRef.current) {
                    dateFormRef.current.submit()
                  }
                }}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Tabs style={{ marginLeft: 20, marginRight: 20, marginBottom: 20 }}>
        <Tabs.TabPane tab="Receivable And Payable" key="0">
          <Table
            bordered
            columns={receivablePayableColumns}
            dataSource={receivablePayableDetails}
            sticky={{ offsetHeader: 64 }}
            pagination={false}
            size="small"
            summary={(pageData) => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <span style={{ fontWeight: 'bold' }}>Total</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {!!payable && '$ ' + addCommas(payable.toFixed(2))}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <span style={{ color: 'blue', fontWeight: 'bold' }}>
                    {!!receivable && '$ ' + addCommas((-receivable).toFixed(2))}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Currency Stock" key="1">
          <Table
            bordered
            columns={currencyClosingStockColumns}
            dataSource={_.filter(
              fcClosingDetails,
              (item: FcClosingDetail) => !!item.baseValue
            )}
            sticky={{ offsetHeader: 64 }}
            pagination={false}
            size="small"
            summary={(pageData) => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={4}></Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <span style={{ fontWeight: 'bold' }}>Total</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <span style={{ color: 'blue', fontWeight: 'bold' }}>
                    {'$ ' +
                      addCommas(_.sumBy(pageData, 'baseValue').toFixed(2))}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Balance Sheet" key="2">
          {canAccess ? (
            <Table
              bordered
              columns={balanceSheetColumns}
              dataSource={balanceSheetData}
              sticky={{ offsetHeader: 64 }}
              pagination={false}
              size="small"
            />
          ) : (
            <EnterPassword
              setAccess={setCanAccess}
              screen="Balance Sheet"
              isInsideAccordion
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="XL" key="3">
          <Table
            bordered
            columns={combinedColumns}
            dataSource={combinedData}
            sticky={{ offsetHeader: 64 }}
            pagination={false}
            size="small"
            rowClassName={(record, index) =>
              record.code == '' ? 'black-background' : 'normal-background'
            }
            summary={(pageData) => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <span style={{ fontWeight: 'bold' }}>Total</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <span style={{ color: 'black', fontWeight: 'bold' }}>
                    $ {addCommas(_.sumBy(pageData, 'amount').toFixed(2))}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}

export default OverallReport
