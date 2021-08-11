import { Formik } from 'formik'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { getDailyProfitLoss } from '../../dbService'

const ProfitAndLoss = () => {
  const [profitAndLoss, setProfitAndLoss] = useState<number>(0)

  const getProfitAndLoss = async (date: string) => {
    const prevDateValue = await getDailyProfitLoss(
      moment(date).add(-1, 'days').format('YYYY-MM-DD')
    )
    const thisDateValue = await getDailyProfitLoss(date)
    const difference = thisDateValue[0].result - prevDateValue[0].result
    setProfitAndLoss(difference)
  }

  useEffect(() => {
    getProfitAndLoss(moment().format('YYYY-MM-DD'))
  }, [])

  return (
    <>
      <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
        Profit & Loss For One Date
      </h1>
      <Card style={{ margin: 20, padding: 20 }}>
        <Formik
          enableReinitialize
          initialValues={{
            date: moment().format('YYYY-MM-DD'),
          }}
          onSubmit={async (values) => {
            getProfitAndLoss(values.date)
          }}
        >
          {({ values, handleSubmit, handleChange, handleBlur }) => {
            return (
              <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                <Row>
                  <Form.Group className="col-md-auto">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      name="date"
                      type="date"
                      value={values.date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Group>
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
                      Submit
                    </Button>
                  </Col>
                  <Col>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: 40,
                      }}
                    >
                      {'$' + profitAndLoss.toFixed(2)}
                    </div>
                  </Col>
                </Row>
              </Form>
            )
          }}
        </Formik>
      </Card>
    </>
  )
}

export default ProfitAndLoss
