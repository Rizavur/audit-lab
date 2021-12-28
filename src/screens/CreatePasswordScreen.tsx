import { Formik } from 'formik'
import { Button, Card, Form } from 'react-bootstrap'
import { useGlobalContext } from '../Providers/GlobalProvider'
import logo from '../appAssets/Logo.jpg'
import * as Yup from 'yup'

export const CreatePasswordScreen = () => {
  const { updatePassword } = useGlobalContext()

  const CreatePasswordSchema = Yup.object().shape({
    password: Yup.string().required('Please enter a password'),
    confirmPassword: Yup.string()
      .required('Please re-enter your password')
      .oneOf([Yup.ref('password')], 'Passwords do not match'),
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
      }}
    >
      <img src={logo} alt="Audit Lab" />
      <Card
        style={{
          padding: 15,
          marginTop: 20,
          width: '50%',
          borderColor: 'blue',
          borderWidth: 6,
        }}
      >
        <Formik
          initialValues={{
            password: '',
            confirmPassword: '',
          }}
          onSubmit={(values) => {
            if (
              values.password !== '' &&
              values.password === values.confirmPassword
            ) {
              updatePassword(values.password)
            }
          }}
          validationSchema={CreatePasswordSchema}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({
            values,
            handleSubmit,
            handleChange,
            handleBlur,
            errors,
            touched,
          }) => {
            return (
              <>
                <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
                  <h5>Create Password</h5>
                  <Form.Floating style={{ marginTop: 20 }}>
                    <Form.Control
                      placeholder="Password"
                      name="password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Label>Password</Form.Label>
                  </Form.Floating>
                  {errors.password && touched.password ? (
                    <div style={{ marginTop: 10, color: 'red' }}>
                      {errors.password}
                    </div>
                  ) : null}
                  <Form.Floating style={{ marginTop: 20 }}>
                    <Form.Control
                      placeholder="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Label>Confirm Password</Form.Label>
                  </Form.Floating>
                  {errors.confirmPassword && touched.confirmPassword ? (
                    <div style={{ marginTop: 10, color: 'red' }}>
                      {errors.confirmPassword}
                    </div>
                  ) : null}
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
    </div>
  )
}
