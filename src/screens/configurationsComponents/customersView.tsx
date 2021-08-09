import { Formik } from 'formik'
import { Row, Card, Button, Table, Form, Col } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import { IconContext } from 'react-icons'
import { AiOutlineEdit, AiFillDelete } from 'react-icons/ai'
import { TiDelete } from 'react-icons/ti'
import {
  addCustomer,
  deleteCustomer,
  editCustomerCode,
  editCustomerDescription,
} from '../../dbService'
import { CustomerDetail } from '../home'
// @ts-ignore
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor'
import { MdContacts } from 'react-icons/md'

interface CustomerInputParams {
  customersList: CustomerDetail[]
  refresh: Function
}

const CustomersView = ({ customersList, refresh }: CustomerInputParams) => {
  const beforeSaveCell = (
    oldValue: any,
    newValue: any,
    row: any,
    column: any,
    done: any
  ) => {
    setTimeout(() => {
      if (oldValue.toString() === newValue.toString()) {
        done(false)
        return null
      }
      if (window.confirm('Do you want to accept this change?')) {
        switch (column.dataField) {
          case 'cust_code':
            editCustomerCode({
              newCustomerCode: newValue,
              oldCustomerCode: oldValue,
            })
            refresh()
            break
          case 'customer_description':
            editCustomerDescription({
              newDescription: newValue,
              customerCode: row.cust_code,
            })
            refresh()
            break
        }
        done(true)
      } else {
        done(false)
      }
    }, 0)
    return { async: true }
  }

  const handleRowDelete = (event: any, code: string) => {
    setTimeout(() => {
      if (window.confirm('Do you want to delete this customer?')) {
        if (
          window.confirm(
            'Are you really sure? All transactions with this customer code will be deleted!'
          )
        ) {
          deleteCustomer(code)
          refresh()
        }
      }
    }, 0)
    return { async: true }
  }

  const renderDelete = (cell: any, row: any) => {
    return (
      <Button
        size="sm"
        variant="link"
        onClick={(event) => handleRowDelete(event, row.cust_code)}
        disabled={row.cust_code === 'EXP' || row.cust_code === 'CAP'}
      >
        <IconContext.Provider value={{ color: 'red', size: '25px' }}>
          <div>
            <TiDelete />
          </div>
        </IconContext.Provider>
      </Button>
    )
  }

  const columns = [
    {
      dataField: 'cust_code',
      text: 'Customer Code',
      editable: (cell: any) => cell !== 'EXP' && cell !== 'CAP',
    },
    {
      dataField: 'customer_description',
      text: 'Customer Description',
    },
    {
      dataField: 'delete',
      text: 'Delete',
      editable: false,
      style: (cell: any, row: any) => {
        return { width: 30 }
      },
      headerStyle: () => {
        return { width: 70 }
      },
      formatter: renderDelete,
    },
  ]

  return (
    <Card style={{ padding: 30, margin: 30 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 20,
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <h1 style={{ fontWeight: 550 }}>Customers</h1>
        <MdContacts style={{ height: 60, width: 60 }} />
      </div>
      <Formik
        initialValues={{
          customerCode: '',
          customerDescription: '',
        }}
        onSubmit={(values, { resetForm }) => {
          if (values.customerCode !== '' && values.customerDescription !== '') {
            addCustomer(values)
            refresh()
            resetForm({})
          }
        }}
      >
        {({ values, handleSubmit, handleChange, handleBlur }) => {
          return (
            <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Customer Code</Form.Label>
                    <Form.Control
                      name="customerCode"
                      type="text"
                      value={values.customerCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Customer Description</Form.Label>
                    <Form.Control
                      name="customerDescription"
                      type="text"
                      value={values.customerDescription}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Group>
                </Col>
                <Col
                  md={3}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="primary"
                    type="submit"
                    style={{
                      width: '80%',
                      height: '50%',
                      marginBottom: 4,
                    }}
                  >
                    Add customer
                  </Button>
                </Col>
              </Row>
            </Form>
          )
        }}
      </Formik>
      <Row style={{ marginTop: 20, marginLeft: 5, marginRight: 5 }}>
        <BootstrapTable
          classes="react-bootstrap-table"
          keyField={'record_no'}
          data={customersList}
          columns={columns}
          hover
          bootstrap4
          filterPosition="top"
          cellEdit={cellEditFactory({
            mode: 'click',
            blurToSave: true,
            autoSelectText: true,
            beforeSaveCell,
          })}
        />
      </Row>
    </Card>
  )
}

export default CustomersView
