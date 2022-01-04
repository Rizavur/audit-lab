import { Formik } from 'formik'
import { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { LockFilled } from '@ant-design/icons'
import * as Yup from 'yup'
import { useGlobalContext } from '../../Providers/GlobalProvider'

export const PasswordConfiguration = () => {
  const { password, updatePassword } = useGlobalContext()
  const [showSuccesAlert, setShowSuccessAlert] = useState(false)

  const ChangePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string()
      .required('Please enter your old password')
      .oneOf([password], 'Incorrect password'),
    newPassword: Yup.string().required('Please enter your new password'),
    confirmNewPassword: Yup.string()
      .required('Please re-enter your new password')
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
  })

  const showPasswordChangedAlert = () => {
    return (
      <Alert
        variant="success"
        style={{
          marginLeft: 25,
          marginRight: 25,
          marginTop: 25,
          marginBottom: -10,
        }}
        show={showSuccesAlert}
      >
        <Alert.Heading>Success</Alert.Heading>
        <i>Password has been updated</i>
      </Alert>
    )
  }

  return (
    <Card style={{ padding: 30, margin: 20 }}>
      <div
        style={{
          display: 'flex',
          marginTop: 20,
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <LockFilled style={{ fontSize: 60 }} />
        <h1 style={{ fontWeight: 550, marginLeft: 20 }}>Password</h1>
      </div>
      {showPasswordChangedAlert()}
      <Formik
        initialValues={{
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }}
        onSubmit={(values, { resetForm }) => {
          if (
            values.oldPassword === password &&
            values.newPassword &&
            values.newPassword === values.confirmNewPassword
          ) {
            updatePassword(values.newPassword)
            setShowSuccessAlert(true)
            resetForm({})
            window.setTimeout(() => {
              setShowSuccessAlert(false)
            }, 1500)
          }
        }}
        validationSchema={ChangePasswordSchema}
        validateOnChange={false}
        validateOnBlur={false}
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
            <Form style={{ padding: 25 }} onSubmit={handleSubmit}>
              <Form.Floating>
                <Form.Control
                  name="oldPassword"
                  type="password"
                  value={values.oldPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Old Password"
                />
                <Form.Label>Old Password</Form.Label>
              </Form.Floating>
              {errors.oldPassword && touched.oldPassword ? (
                <div style={{ marginTop: 10, color: 'red' }}>
                  {errors.oldPassword}
                </div>
              ) : null}
              <Form.Floating style={{ marginTop: 10 }}>
                <Form.Control
                  name="newPassword"
                  type="password"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="New Password"
                />
                <Form.Label>New Password</Form.Label>
              </Form.Floating>
              {errors.newPassword && touched.newPassword ? (
                <div style={{ marginTop: 10, color: 'red' }}>
                  {errors.newPassword}
                </div>
              ) : null}
              <Form.Floating style={{ marginTop: 10 }}>
                <Form.Control
                  name="confirmNewPassword"
                  type="password"
                  value={values.confirmNewPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm New Password"
                />
                <Form.Label>Confirm New Password</Form.Label>
              </Form.Floating>
              {errors.confirmNewPassword && touched.confirmNewPassword ? (
                <div style={{ marginTop: 10, color: 'red' }}>
                  {errors.confirmNewPassword}
                </div>
              ) : null}
              <Button
                variant="primary"
                type="submit"
                style={{
                  marginTop: 20,
                  width: '100%',
                }}
              >
                Change Password
              </Button>
            </Form>
          )
        }}
      </Formik>
    </Card>
  )
}
