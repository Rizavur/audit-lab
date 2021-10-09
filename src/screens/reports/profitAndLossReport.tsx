import { Formik } from 'formik'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import { getDailyProfitLoss } from '../../dbService'
import { addCommas } from './overallReport'
import config from '../../config.json'

interface ProfitAndLosses {
  date: string
  value: number
}

const ProfitAndLoss = () => {
  const [profitAndLoss, setProfitAndLoss] = useState<ProfitAndLosses[]>([])

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

  return (
    <>
      <h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
        Profit & Loss
      </h1>
      <Card style={{ margin: 20 }}>
        <Formik
          enableReinitialize
          initialValues={{
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
          }}
          onSubmit={async (values) => {
            getProfitAndLoss(values.startDate, values.endDate)
          }}
        >
          {({ values, handleSubmit, handleChange, handleBlur }) => {
            return (
              <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                <Row>
                  <Col>
                    <Form.Group className="col-md-auto">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        name="startDate"
                        type="date"
                        value={values.startDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="col-md-auto">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        name="endDate"
                        type="date"
                        value={values.endDate}
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
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form>
            )
          }}
        </Formik>
        <Row style={{ marginLeft: 20, marginRight: 20 }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>{`Profit Or Loss (${config.baseCurrency})`}</th>
              </tr>
            </thead>
            <tbody>
              {profitAndLoss.map((item) => {
                return (
                  <tr>
                    <td>
                      {moment()
                        .startOf('day')
                        .isSame(moment(item.date).startOf('day'))
                        ? moment(item.date)
                            .startOf('day')
                            .format('DD MMMM YYYY') + ' (Today)'
                        : moment(item.date)
                            .startOf('day')
                            .format('DD MMMM YYYY')}
                    </td>
                    <td>{addCommas(item.value.toFixed(2))}</td>
                  </tr>
                )
              })}
              <tr style={{ fontWeight: 'bold' }}>
                <td align="right">Total:</td>
                <td>{addCommas(_.sumBy(profitAndLoss, 'value').toFixed(2))}</td>
              </tr>
            </tbody>
          </Table>
        </Row>
      </Card>
    </>
  )
}

export default ProfitAndLoss
