import { useEffect, useState } from 'react'
import {
  addCurrency,
  addCustomer,
  getCurrencyDetails,
  getCustomerDetails,
} from '../dbService'
import { CurrencyDetail, CustomerDetail } from './home'
import CurrenciesView from './configurationsComponents/currenciesView'
import CustomersView from './configurationsComponents/customersView'
import { Formik } from 'formik'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'

const Configurations = () => {
  const [currDetails, setCurrencyDetails] = useState<CurrencyDetail[]>([])
  const [custDetails, setCustomerDetails] = useState<CustomerDetail[]>([])

  const initializeConfigurationsPage = async () => {
    const [currencyDetails, customerDetails] = await Promise.all([
      getCurrencyDetails() as Promise<CurrencyDetail[]>,
      getCustomerDetails() as Promise<CustomerDetail[]>,
    ])
    setCurrencyDetails(currencyDetails)
    setCustomerDetails(customerDetails)
  }

  useEffect(() => {
    initializeConfigurationsPage()
  }, [])

  return (
    <>
      <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
        Configurations
      </h1>
      <Card style={{ padding: 5, margin: 30 }}>
        <Formik
          initialValues={{
            currencyCode: '',
            currencyDescription: '',
          }}
          onSubmit={(values, { resetForm }) => {
            if (
              values.currencyCode !== '' &&
              values.currencyDescription !== ''
            ) {
              addCurrency(values)
              initializeConfigurationsPage()
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
                      <Form.Label>Currency Code</Form.Label>
                      <Form.Control
                        name="currencyCode"
                        type="text"
                        value={values.currencyCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Currency Description</Form.Label>
                      <Form.Control
                        name="currencyDescription"
                        type="text"
                        value={values.currencyDescription}
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
                      Add currency
                    </Button>
                  </Col>
                </Row>
              </Form>
            )
          }}
        </Formik>
      </Card>

      <CurrenciesView
        currenciesList={currDetails}
        refresh={initializeConfigurationsPage}
      />
      <Card style={{ padding: 5, margin: 30 }}>
        <Formik
          initialValues={{
            customerCode: '',
            customerDescription: '',
          }}
          onSubmit={(values, { resetForm }) => {
            if (
              values.customerCode !== '' &&
              values.customerDescription !== ''
            ) {
              addCustomer(values)
              initializeConfigurationsPage()
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
      </Card>
      <CustomersView
        customersList={custDetails}
        refresh={initializeConfigurationsPage}
      />
    </>
  )
}

export default Configurations
