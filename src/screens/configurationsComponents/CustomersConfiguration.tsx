import {
  addCustomer,
  editCustomerCode,
  editCustomerDescription,
} from '../../dbService'
import { CustomerDetail, CustomerFormValues } from '../../types'
import { Button, Col, Form, Input, Row, Table } from 'antd'
import { EditableCell, EditableRow } from '../../Components/AntTable'
import { openSuccessNotification } from '../../Components/SuccessNotification'

interface InputParams {
  customersList: CustomerDetail[]
  refresh: Function
}

const CustomersView = ({ customersList, refresh }: InputParams) => {
  const onFinish = (values: CustomerFormValues) => {
    addCustomer({
      customerCode: values.customerCode.toString().toUpperCase(),
      customerDescription: values.customerDescription.toString().toUpperCase(),
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
            newCustomerCode: record.cust_code.toString().toUpperCase(),
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
            newDescription: record.customer_description
              .toString()
              .toUpperCase(),
            customerId: record.cust_id.toString(),
          })
          refresh()
        },
      }),
    },
  ]

  return (
    <>
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
                label="New Customer Code"
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
                label="New Customer Description"
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
    </>
  )
}

export default CustomersView
