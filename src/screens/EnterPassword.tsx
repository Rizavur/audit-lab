import { Formik } from 'formik'
import { Button, Form } from 'react-bootstrap'
import { RiLockPasswordFill } from 'react-icons/ri'
import { useGlobalContext } from '../Providers/GlobalProvider'
import * as Yup from 'yup'

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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <strong
            style={{ fontSize: 28 }}
          >{`Enter password to access ${screen}`}</strong>
          <RiLockPasswordFill size={28} style={{ marginLeft: 20 }} />
        </div>
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
