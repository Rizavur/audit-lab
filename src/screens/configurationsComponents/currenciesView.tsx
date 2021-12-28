import { Formik } from 'formik'
import { Row, Card, Button, Form, Col, Modal } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import {
  addCurrency,
  editCurrencyCode,
  editCurrencyDescription,
} from '../../dbService'
import { FaMoneyCheckAlt } from 'react-icons/fa'
// @ts-ignore
import cellEditFactory from 'react-bootstrap-table2-editor'
import { useRef, useState } from 'react'
import config from '../../config.json'
import { CurrencyDetail } from '../../types'

interface InputParams {
  currenciesList: CurrencyDetail[]
  refresh: Function
}

interface EditedData {
  newValue: any
  row: any
  column: any
  oldValue: any
}

const CurrenciesView = ({ currenciesList, refresh }: InputParams) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [editedData, setEditedData] = useState<EditedData>()
  const editDefaultRef = useRef<HTMLButtonElement | null>(null)
  const onEditModalOpen = () => {
    // @ts-ignore
    editDefaultRef.current.focus()
  }

  const handleClose = () => {
    refresh()
    setShowEditModal(false)
  }

  const handleSave = () => {
    if (!!editedData)
      switch (editedData.column.dataField) {
        case 'currency_code':
          editCurrencyCode({
            newCurrencyCode: editedData.newValue,
            oldCurrencyCode: editedData.oldValue,
          })
          refresh()
          break
        case 'currency_description':
          editCurrencyDescription({
            newDescription: editedData.newValue,
            currencyCode: editedData.row.currency_code,
          })
          refresh()
          break
      }
    setShowEditModal(false)
  }

  const beforeSaveCell = (
    oldValue: any,
    newValue: any,
    row: any,
    column: any,
    done: any
  ) => {
    if (oldValue.toString() === newValue.toString()) {
      done(false)
      return null
    }
    setShowEditModal(true)
    setEditedData({ newValue, row, column, oldValue })
  }

  const columns = [
    {
      dataField: 'currency_code',
      text: 'Currency Code',
      editable: (cell: any) => cell !== config.baseCurrency,
    },
    {
      dataField: 'currency_description',
      text: 'Currency Description',
    },
  ]

  return (
    <>
      <Card style={{ padding: 30, margin: 20 }}>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          <FaMoneyCheckAlt style={{ height: 60, width: 60 }} />
          <h1 style={{ fontWeight: 550, marginLeft: 20 }}>Currencies</h1>
        </div>
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
                    <Form.Floating>
                      <Form.Control
                        name="currencyCode"
                        type="text"
                        value={values.currencyCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Currency Code"
                      />
                      <Form.Label>Currency Code</Form.Label>
                    </Form.Floating>
                  </Col>
                  <Col md={6}>
                    <Form.Floating>
                      <Form.Control
                        name="currencyDescription"
                        type="text"
                        value={values.currencyDescription}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Currency Description"
                      />
                      <Form.Label>Currency Description</Form.Label>
                    </Form.Floating>
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
                        width: '100%',
                        height: '100%',
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
            keyField={'currency_id'}
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
      <Modal
        size="lg"
        show={showEditModal}
        onHide={handleClose}
        onEntered={onEditModalOpen}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Edit Currency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Do you want to accept this change?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button variant="primary" onClick={handleSave} ref={editDefaultRef}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CurrenciesView
