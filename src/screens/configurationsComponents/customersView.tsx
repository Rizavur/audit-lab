import { Formik } from 'formik'
import { Row, Card, Button, Table, Form, Col, Modal } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import { IconContext } from 'react-icons'
import { TiDelete } from 'react-icons/ti'
import {
  addCustomer,
  deleteCustomer,
  editCustomerCode,
  editCustomerDescription,
} from '../../dbService'
import { CustomerDetail } from '../home'
// @ts-ignore
import cellEditFactory from 'react-bootstrap-table2-editor'
import { MdContacts } from 'react-icons/md'
import { useRef, useState } from 'react'

interface CustomerInputParams {
  customersList: CustomerDetail[]
  refresh: Function
}

interface EditedData {
  newValue: any
  row: any
  column: any
  oldValue: any
}

const CustomersView = ({ customersList, refresh }: CustomerInputParams) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [editedData, setEditedData] = useState<EditedData>()
  const editDefaultRef = useRef<HTMLButtonElement>(null)
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
        case 'cust_code':
          editCustomerCode({
            newCustomerCode: editedData.newValue,
            oldCustomerCode: editedData.oldValue,
          })
          refresh()
          break
        case 'customer_description':
          editCustomerDescription({
            newDescription: editedData.newValue,
            customerCode: editedData.row.cust_code,
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
          <MdContacts style={{ height: 60, width: 60 }} />
          <h1 style={{ fontWeight: 550, marginLeft: 20 }}>Customers</h1>
        </div>
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
      <Modal
        size="lg"
        centered
        show={showEditModal}
        onHide={handleClose}
        onEntered={onEditModalOpen}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Edit Customer</Modal.Title>
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

export default CustomersView
