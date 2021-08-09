import { Formik } from 'formik'
import { Row, Card, Button, Table, Form, Col } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import { IconContext } from 'react-icons'
import { TiDelete, TiEdit } from 'react-icons/ti'
import {
  addCurrency,
  deleteCurrency,
  editCurrencyCode,
  editCurrencyDescription,
} from '../../dbService'
import { CurrencyDetail } from '../home'
import { FaMoneyCheckAlt } from 'react-icons/fa'
// @ts-ignore
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor'

interface InputParams {
  currenciesList: CurrencyDetail[]
  refresh: Function
}

const CurrenciesView = ({ currenciesList, refresh }: InputParams) => {
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
          case 'currency_code':
            editCurrencyCode({
              newCurrencyCode: newValue,
              oldCurrencyCode: oldValue,
            })
            refresh()
            break
          case 'currency_description':
            editCurrencyDescription({
              newDescription: newValue,
              currencyCode: row.currency_code,
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
      if (window.confirm('Do you want to delete this currency?')) {
        if (
          window.confirm(
            'Are you really sure? All transactions with this currency code will be deleted!'
          )
        ) {
          deleteCurrency(code)
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
        onClick={(event) => handleRowDelete(event, row.currency_code)}
        disabled={row.currency_code === 'SGD'}
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
      dataField: 'currency_code',
      text: 'Currency Code',
      editable: (cell: any) => cell !== 'SGD',
    },
    {
      dataField: 'currency_description',
      text: 'Currency Description',
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
        <h1 style={{ fontWeight: 550 }}>Currencies</h1>
        <FaMoneyCheckAlt style={{ height: 60, width: 60 }} />
      </div>
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
        <BootstrapTable
          classes="react-bootstrap-table"
          keyField={'record_no'}
          data={currenciesList}
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

export default CurrenciesView
