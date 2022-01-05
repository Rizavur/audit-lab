import {
  addCustomer,
  editCustomerCode,
  editCustomerDescription,
} from '../../dbService'
import { CustomerDetail, CustomerFormValues } from '../../types'
import { Button, Card, Col, Form, Input, notification, Row, Table } from 'antd'
import { EditableCell, EditableRow } from '../../Components/AntTable'
import { openSuccessNotification } from '../../Components/SuccessNotification'
import { IdcardTwoTone } from '@ant-design/icons'

interface InputParams {
  customersList: CustomerDetail[]
  refresh: Function
}

const CustomersView = ({ customersList, refresh }: InputParams) => {
  const onFinish = (values: CustomerFormValues) => {
    addCustomer({
      customerCode: values.customerCode.toUpperCase(),
      customerDescription: values.customerDescription.toUpperCase(),
    })
    refresh()
  }

  const validateMessages = {
    required: '${label} is required!',
  }

  const columns = [
    {
      dataIndex: 'cust_code',
      title: 'Customer Code',
      editable: true,
      onCell: (record: CustomerDetail) => ({
        record,
        required: true,
        key: 'cust_code',
        editable: record.cust_code !== 'CAP' && record.cust_code !== 'EXP',
        dataIndex: 'cust_code',
        title: 'Customer Code',
        isUpperCase: true,
        handleSave: (record: CustomerDetail) => {
          editCustomerCode({
            newCustomerCode: record.cust_code.toUpperCase(),
            customerId: record.cust_id.toString(),
          })
          refresh()
        },
      }),
    },
    {
      dataIndex: 'customer_description',
      title: 'Customer Description',
      editable: true,
      onCell: (record: CustomerDetail) => ({
        record,
        required: true,
        key: 'customer_description',
        editable: true,
        dataIndex: 'customer_description',
        title: 'Customer Description',
        isUpperCase: true,
        handleSave: (record: CustomerDetail) => {
          editCustomerDescription({
            newDescription: record.customer_description.toUpperCase(),
            customerId: record.cust_id.toString(),
          })
          refresh()
        },
      }),
    },
  ]

  return (
    <>
      <Card
        title="Customers"
        extra={<IdcardTwoTone style={{ fontSize: 30 }} />}
        style={{ margin: 20 }}
      >
        <Form.Provider
          onFormFinish={(name, { values, forms }) => {
            const { customerForm } = forms
            customerForm.resetFields()
            openSuccessNotification({ message: 'Customer has been added' })
          }}
        >
          <Form
            name="customerForm"
            onFinish={onFinish}
            initialValues={{ customerCode: '', customerDescription: '' }}
            layout="vertical"
            validateMessages={validateMessages}
          >
            <Row align="middle" justify="space-between">
              <Col span={8}>
                <Form.Item
                  name="customerCode"
                  label="Customer Code"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="Customer Code"
                    style={{ width: '100%', textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="customerDescription"
                  label="Customer Description"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="Customer Description"
                    style={{ width: '100%', textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: '100%', marginTop: 6 }}
                >
                  Add Customer
                </Button>
              </Col>
            </Row>
          </Form>
        </Form.Provider>
        <Row>
          <Table
            bordered
            pagination={false}
            columns={columns}
            dataSource={customersList}
            sticky={{ offsetHeader: 64 }}
            components={{
              body: {
                row: EditableRow,
                cell: EditableCell,
              },
            }}
            size="small"
          />
        </Row>
      </Card>
    </>
  )
}

export default CustomersView
