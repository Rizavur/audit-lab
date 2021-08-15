import { Formik } from 'formik'
import { Row, Card, Button, Form, Col, Modal } from 'react-bootstrap'
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
import { useRef, useState } from 'react'

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
    // {
    //   dataField: 'delete',
    //   text: 'Delete',
    //   editable: false,
    //   style: (cell: any, row: any) => {
    //     return { width: 30 }
    //   },
    //   headerStyle: () => {
    //     return { width: 70 }
    //   },
    //   formatter: renderDelete,
    // },
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
      <Modal
        size="lg"
        centered
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
