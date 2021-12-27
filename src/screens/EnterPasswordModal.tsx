import { Formik } from 'formik'
import { Button, Form, Modal } from 'react-bootstrap'
import { RiLockPasswordFill } from 'react-icons/ri'
import { useGlobalContext } from '../Providers/GlobalProvider'
import * as Yup from 'yup'

type EnterPasswordModalProps = {
  setAccess: React.Dispatch<React.SetStateAction<boolean>>
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  isPasswordModalShown: boolean
  screen: string
}

export const EnterPasswordModal = ({
  setAccess,
  setShowModal,
  isPasswordModalShown,
  screen,
}: EnterPasswordModalProps) => {
  const { password } = useGlobalContext()

  const PasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required('Please enter the password')
      .oneOf([password], 'Incorrect password'),
  })

  return (
    <>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <h4>{`${screen} Screen Is Password Locked`}</h4>
        <Button
          onClick={() => {
            setShowModal(true)
          }}
          style={{ backgroundColor: 'white', borderColor: 'white' }}
        >
          <RiLockPasswordFill
            size={100}
            style={{ marginTop: 10 }}
            color="black"
          />
          <h6 style={{ color: 'black' }}>Unlock</h6>
        </Button>
      </div>
      <Modal
        size="lg"
        centered
        onHide={() => setShowModal(false)}
        show={isPasswordModalShown}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{`Enter Password To Access ${screen}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              password: '',
            }}
            onSubmit={(values) => {
              if (values.password !== '' && values.password === password) {
                setAccess(true)
              }
            }}
            validationSchema={PasswordSchema}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ values, handleSubmit, handleChange, errors, touched }) => {
              return (
                <Form style={{ padding: 15 }} onSubmit={handleSubmit}>
                  <Form.Group>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                      autoFocus
                    />
                  </Form.Group>
                  {errors.password && touched.password ? (
                    <div style={{ marginTop: 10, color: 'red' }}>
                      {errors.password}
                    </div>
                  ) : null}
                  <Button
                    variant="primary"
                    type="submit"
                    style={{
                      marginTop: 25,
                      width: '100%',
                    }}
                  >
                    Submit
                  </Button>
                </Form>
              )
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  )
}
