import _ from 'lodash'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { getDailyProfitLoss } from '../../dbService'
import config from '../../config.json'
import { EnterPassword } from '../EnterPassword'
import Title from 'antd/lib/typography/Title'
import { LockFilled, UnlockFilled } from '@ant-design/icons'
import { addCommas } from '../../Service/CommonService'
import { DatePicker, Form, Row, Table } from 'antd'

interface ProfitAndLosses {
  date: string
  value: number
}

const ProfitAndLoss = () => {
  const [profitAndLoss, setProfitAndLoss] = useState<ProfitAndLosses[]>([])
  const [canAccess, setCanAccess] = useState(false)
  const dateRangeRef: any = useRef()

  const getProfitAndLoss = async (startDate: string, endDate: string) => {
    const profitAndLosses = []
    const startingMoment = moment(startDate).startOf('day')
    const endingMoment = moment(endDate).startOf('day')
    while (startingMoment <= endingMoment) {
      const prevDateValue = await getDailyProfitLoss(
        moment(startingMoment).add(-1, 'days').format('YYYY-MM-DD')
      )
      const thisDateValue = await getDailyProfitLoss(
        startingMoment.format('YYYY-MM-DD')
      )
      const value = thisDateValue[0].result - prevDateValue[0].result
      profitAndLosses.push({ date: startingMoment.format('YYYY-MM-DD'), value })
      startingMoment.add(1, 'days')
    }

    setProfitAndLoss(profitAndLosses)
  }

  useEffect(() => {
    const today = moment().startOf('day').format('YYYY-MM-DD')
    getProfitAndLoss(today, today)
  }, [])

  const profitAndLossColumns = [
    {
      dataIndex: 'date',
      key: 'date',
      title: 'Date',
      render: (date: string) => <>{moment(date).format('DD MMMM YYYY')}</>,
    },
    {
      dataIndex: 'value',
      key: 'value',
      title: `Profit/Loss (${config.baseCurrency})`,
      render: (value: number) =>
        value !== 0 ? <>{`$ ${addCommas(value.toFixed(2))}`}</> : null,
    },
  ]

  if (!canAccess) {
    return <EnterPassword setAccess={setCanAccess} screen="Profit & Loss" />
  }

  return (
    <>
      <Row justify="space-between" style={{ marginLeft: 20 }}>
        <Title style={{ display: 'flex', alignItems: 'center' }}>
          Profit & Loss{' '}
          {canAccess ? (
            <UnlockFilled
              style={{ marginLeft: 20 }}
              onClick={() => setCanAccess(false)}
            />
          ) : (
            <LockFilled style={{ marginLeft: 20 }} />
          )}
        </Title>
        <Form
          style={{ marginRight: 20, marginTop: 10 }}
          ref={dateRangeRef}
          initialValues={{
            dateRange: [moment(), moment()],
          }}
          onFinish={(values) => {
            getProfitAndLoss(values.dateRange[0], values.dateRange[1])
          }}
        >
          <Form.Item name="dateRange" label="Date Range">
            <DatePicker.RangePicker
              format={'DD-MM-YYYY'}
              onChange={() => {
                if (dateRangeRef.current) {
                  dateRangeRef.current.submit()
                }
              }}
            />
          </Form.Item>
        </Form>
      </Row>
      <Table
        bordered
        columns={profitAndLossColumns}
        dataSource={profitAndLoss}
        sticky={{ offsetHeader: 64 }}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 50,
          showSizeChanger: false,
        }}
        size="small"
        style={{ margin: 20 }}
        summary={(pageData) => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={1}>
              <span style={{ fontWeight: 'bold' }}>Total</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <span style={{ color: 'blue', fontWeight: 'bold' }}>
                {'$ ' + addCommas(_.sumBy(pageData, 'value').toFixed(2))}
              </span>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </>
  )
}

export default ProfitAndLoss
