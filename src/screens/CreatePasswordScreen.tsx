import { Formik } from 'formik'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useGlobalContext } from '../Providers/GlobalProvider'
import { saveProtectedPassword } from '../Service/StorageService'
import logo from '../appAssets/Logo.jpg'

export const CreatePasswordScreen = () => {
  const { setPassword } = useGlobalContext()

  const setProtectedPassword = (password: string) => {
    saveProtectedPassword(password)
    setPassword(password)
  }

  return (
    <Col
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
      }}
    >
      <Row style={{ marginRight: 30 }}>
        <img src={logo} alt="Audit Lab" />
      </Row>
      <Row style={{ padding: 25 }}>
        <Card>
          <Formik
            initialValues={{
              password: '',
            }}
            onSubmit={(values) => {
              if (values.password !== '') {
                setProtectedPassword(values.password)
              }
            }}
          >
            {({ values, handleSubmit, handleChange, handleBlur }) => {
              return (
                <>
                  <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                    <h5 style={{ marginBottom: 20 }}>
                      Set a password for protected screens
                    </h5>
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        name="password"
                        type="text"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      type="submit"
                      style={{
                        width: '100%',
                        marginBottom: 4,
                        marginTop: 20,
                      }}
                    >
                      Save
                    </Button>
                  </Form>
                </>
              )
            }}
          </Formik>
        </Card>
      </Row>
    </Col>
  )
}
