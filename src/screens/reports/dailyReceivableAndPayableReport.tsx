import { DatePicker, Form, Row, Table } from 'antd'
import Title from 'antd/lib/typography/Title'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { getReceivablePayableDetails } from '../../dbService'
import { addCommas } from '../../Service/CommonService'
import { ReceivablePayable } from '../../types'

const DailyReceivableAndPayable = () => {
  const [receivableAndPayable, setReceivableAndPayable] = useState<
    ReceivablePayable[]
  >([])
  const dailyReceivableAndPayableFormRef: any = useRef()
  const dateRef: any = useRef()

  useEffect(() => {
    getReceivablePayableForDay(moment().format('YYYY-MM-DD'))
  }, [])

  const getReceivablePayableForDay = async (date: string) => {
    setReceivableAndPayable(
      await getReceivablePayableDetails(moment(date).format('YYYY-MM-DD'), true)
    )
  }

  const receivableAndPayableColumns = [
    {
      dataIndex: 'cust_code',
      key: 'cust_code',
      title: 'Customer Code',
      render: (custCode: string) => <>{custCode}</>,
    },
    {
      dataIndex: 'customer_description',
      key: 'customer_description',
      title: 'Customer Description',
      render: (custDesc: string) => <>{custDesc}</>,
    },
    {
      dataIndex: 'difference',
      key: 'difference',
      title: 'Amount',
      render: (value: number) => {
        if (value == 0 || value == undefined) {
          return null
        }

        if (value > 0) {
          return (
            <span style={{ color: 'red' }}>{`$ ${addCommas(
              (-value).toFixed(2)
            )}`}</span>
          )
        } else {
          return <span>{`$ ${addCommas((-value).toFixed(2))}`}</span>
        }
      },
    },
  ]

  return (
    <>
      <Row justify="space-between" style={{ marginLeft: 20 }}>
        <Title style={{ display: 'flex', alignItems: 'center' }}>
          Daily Receivable and Payable
        </Title>
        <Form
          style={{ marginRight: 20, marginTop: 10 }}
          ref={dailyReceivableAndPayableFormRef}
          initialValues={{
            date: moment(),
          }}
          onFinish={(values) => {
            getReceivablePayableForDay(values.date)
          }}
          layout="vertical"
        >
          <Form.Item name="date" label="Date">
            <DatePicker
              ref={dateRef}
              onChange={() => {
                dailyReceivableAndPayableFormRef.current.submit()
              }}
              format={'DD-MM-YYYY'}
            />
          </Form.Item>
        </Form>
      </Row>
      <Table
        bordered
        columns={receivableAndPayableColumns}
        dataSource={receivableAndPayable}
        sticky={{ offsetHeader: 64 }}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 50,
          showSizeChanger: false,
        }}
        size="small"
        style={{ margin: 20 }}
        summary={(pageData) => {
          const totalSum = -_.sumBy(pageData, 'difference')
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <span style={{ fontWeight: 'bold' }}>Total</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <span
                  style={{
                    color: totalSum < 0 ? 'red' : 'blue',
                    fontWeight: 'bold',
                  }}
                >
                  {'$ ' + addCommas(totalSum.toFixed(2))}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )
        }}
      />
    </>
  )
}

export default DailyReceivableAndPayable
