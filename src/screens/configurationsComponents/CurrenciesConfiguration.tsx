import {
  addCurrency,
  editCurrencyCode,
  editCurrencyDescription,
} from '../../dbService'
import config from '../../config.json'
import { CurrencyDetail, CurrencyFormValues } from '../../types'
import { Button, Col, Form, Input, Row, Table } from 'antd'
import { EditableCell, EditableRow } from '../../Components/AntTable'
import { openSuccessNotification } from '../../Components/SuccessNotification'

interface InputParams {
  currenciesList: CurrencyDetail[]
  refresh: Function
}

const CurrenciesView = ({ currenciesList, refresh }: InputParams) => {
  const onFinish = (values: CurrencyFormValues) => {
    addCurrency({
      currencyCode: values.currencyCode.toString().toUpperCase(),
      currencyDescription: values.currencyDescription.toString().toUpperCase(),
    })
    refresh()
  }

  const validateMessages = {
    required: '${label} is required!',
  }

  const columns = [
    {
      dataIndex: 'currency_code',
      title: 'Currency Code',
      editable: true,
      onCell: (record: CurrencyDetail) => ({
        record,
        required: true,
        key: 'currency_code',
        editable: record.currency_code !== config.baseCurrency,
        dataIndex: 'currency_code',
        title: 'Currency Code',
        isUpperCase: true,
        handleSave: (record: CurrencyDetail) => {
          editCurrencyCode({
            newCurrencyCode: record.currency_code.toString().toUpperCase(),
            currencyId: record.currency_id.toString(),
          })
          refresh()
        },
      }),
    },
    {
      dataIndex: 'currency_description',
      title: 'Currency Description',
      editable: true,
      onCell: (record: CurrencyDetail) => ({
        record,
        required: true,
        key: 'currency_description',
        editable: true,
        dataIndex: 'currency_description',
        title: 'Currency Description',
        isUpperCase: true,
        handleSave: (record: CurrencyDetail) => {
          editCurrencyDescription({
            newDescription: record.currency_description
              .toString()
              .toUpperCase(),
            currencyId: record.currency_id.toString(),
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
          const { currencyForm } = forms
          currencyForm.resetFields()
          openSuccessNotification({ message: 'Currency has been added' })
        }}
      >
        <Form
          name="currencyForm"
          onFinish={onFinish}
          initialValues={{ currencyCode: '', currencyDescription: '' }}
          layout="vertical"
          validateMessages={validateMessages}
        >
          <Row align="middle" justify="space-between">
            <Col span={8}>
              <Form.Item
                name="currencyCode"
                label="New Currency Code"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Currency Code"
                  style={{ width: '100%', textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currencyDescription"
                label="New Currency Description"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Currency Description"
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
                Add Currency
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
          dataSource={currenciesList}
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

export default CurrenciesView
