import { Formik } from 'formik'
import { Row, Card, Button, Table, Form, Col } from 'react-bootstrap'
import { AiOutlineEdit, AiFillDelete } from 'react-icons/ai'
import { addCurrency, deleteCurrency } from '../../dbService'
import { CurrencyDetail } from '../home'

interface InputParams {
  currenciesList: CurrencyDetail[]
  refresh: Function
}

const CurrenciesView = ({ currenciesList, refresh }: InputParams) => {
  const handleDeleteCurrency = (event: any, currencyID: number) => {
    deleteCurrency(currencyID)
    refresh()
  }

  return (
    <Card style={{ padding: 30, margin: 30 }}>
      <h2 style={{ fontWeight: 400 }}>Currencies</h2>
      <Formik
        initialValues={{
          currencyCode: '',
          currencyDescription: '',
        }}
        onSubmit={(values, { resetForm }) => {
          if (values.currencyCode !== '' && values.currencyDescription !== '') {
            addCurrency(values)
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
      <Row
        style={{
          marginTop: 20,
          marginLeft: 5,
          marginRight: 5,
        }}
      >
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
            {currenciesList.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.currency_code}</td>
                  <td>{item.currency_description}</td>
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
                  <td>
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
                          handleDeleteCurrency(event, item.currency_id)
                        }
                        // onClick={handleDeleteCurrency(item.currency_id)}
                      >
                        <AiFillDelete />
                      </Button>
                    </Row>
                  </td> */}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Row>
    </Card>
  )
}

export default CurrenciesView
