import { Formik } from 'formik'
import { Row, Card, Button, Table, Form, Col } from 'react-bootstrap'
import { AiOutlineEdit, AiFillDelete } from 'react-icons/ai'
import { addCustomer, deleteCustomer } from '../../dbService'
import { CustomerDetail } from '../home'

interface CustomerInputParams {
  customersList: CustomerDetail[]
  refresh: Function
}

const CustomersView = ({ customersList, refresh }: CustomerInputParams) => {
  const handleCustomerDelete = (event: any, customerID: number) => {
    deleteCustomer(customerID)
    refresh()
  }

  return (
    <Card style={{ padding: 30, margin: 30 }}>
      <h2 style={{ fontWeight: 400 }}>Customers</h2>
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
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Description</th>
              {/* <th style={{ width: 50 }}>Edit</th>
              <th style={{ width: 70 }}>Delete</th> */}
            </tr>
          </thead>
          <tbody>
            {!!customersList &&
              customersList.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.cust_code}</td>
                    <td>{item.customer_description}</td>
                    {/* <td>
                      <Row
                        style={{
                          paddingLeft: 20,
                          paddingRight: 20,
                        }}
                      >
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: 'black',
                          }}
                        >
                          <AiOutlineEdit />
                        </Button>
                      </Row>
                    </td>
                    <td key={index}>
                      <Row
                        style={{
                          paddingLeft: 20,
                          paddingRight: 20,
                        }}
                      >
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: 'black',
                          }}
                          onClick={(event) =>
                            handleCustomerDelete(event, item.cust_id)
                          }
                        >
                          <AiFillDelete />
                        </Button>
                      </Row>
                    </td>*/}
                  </tr>
                )
              })}
          </tbody>
        </Table>
      </Row>
    </Card>
  )
}

export default CustomersView
