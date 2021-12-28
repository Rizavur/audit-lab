import { Formik } from 'formik'
import { Button, Form } from 'react-bootstrap'
import { useGlobalContext } from '../Providers/GlobalProvider'
import * as Yup from 'yup'
import { MdLock } from 'react-icons/md'

type EnterPasswordModalProps = {
  setAccess: React.Dispatch<React.SetStateAction<boolean>>
  screen: string
}

export const EnterPassword = ({
  setAccess,
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
        <MdLock size={120} />
        <strong
          style={{ fontSize: 28, marginTop: 30 }}
        >{`Enter password to access ${screen}`}</strong>
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
              <Form style={{ padding: 15, width: 500 }} onSubmit={handleSubmit}>
                <Form.Floating>
                  <Form.Control
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                    autoFocus
                  />
                  <Form.Label>Password</Form.Label>
                </Form.Floating>
                {errors.password && touched.password ? (
                  <div style={{ marginTop: 10, color: 'red' }}>
                    {errors.password}
                  </div>
                ) : null}
                <Button
                  variant="primary"
                  type="submit"
                  style={{
                    marginTop: 15,
                    width: '100%',
                  }}
                >
                  Submit
                </Button>
              </Form>
            )
          }}
        </Formik>
      </div>
    </>
  )
}
