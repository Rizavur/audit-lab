import { useGlobalContext } from '../Providers/GlobalProvider'
import logo from '../appAssets/Logo.jpg'
import { Button, Card, Form, Input } from 'antd'
import { useRef } from 'react'

export const CreatePasswordScreen = () => {
  const { updatePassword } = useGlobalContext()
  const createPasswordFormRef: any = useRef()

  const validateSamePassword = (rule: any, value: any, callback: any) => {
    const password = createPasswordFormRef.current.getFieldsValue().password
    if (value && value !== password) {
      callback('Passwords do not match!')
    } else {
      callback()
    }
  }

  const onFinish = (values: { password: string; confirmPassword: string }) => {
    if (values.password === values.confirmPassword) {
      updatePassword(values.password)
    }
  }

  const validateMessages = {
    required: '${label} is required!',
  }

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
          width: '50%',
          borderColor: 'blue',
          borderWidth: 6,
        }}
        title="Create Password"
      >
        <Form
          name="createPasswordForm"
          ref={createPasswordFormRef}
          initialValues={{
            password: '',
            confirmPassword: '',
          }}
          onFinish={onFinish}
          validateMessages={validateMessages}
          validateTrigger="onBlur"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true }, { validator: validateSamePassword }]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '100%', marginTop: 10 }}
          >
            Save
          </Button>
        </Form>
      </Card>
    </div>
  )
}
