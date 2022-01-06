import { useGlobalContext } from '../../Providers/GlobalProvider'
import { Button, Col, Form, Input, Row } from 'antd'
import { useRef } from 'react'
import { openSuccessNotification } from '../../Components/SuccessNotification'

export const PasswordConfiguration = () => {
  const { password, updatePassword } = useGlobalContext()
  const changePasswordFormRef: any = useRef()

  const validatePassword = (rule: any, value: any, callback: any) => {
    if (value && value !== password) {
      callback('Incorrect password!')
    } else {
      callback()
    }
  }

  const validateSameNewPassword = (rule: any, value: any, callback: any) => {
    const newPassword =
      changePasswordFormRef.current.getFieldsValue().newPassword
    if (value && value !== newPassword) {
      callback('New passwords do not match!')
    } else {
      callback()
    }
  }

  const onFinish = (values: {
    oldPassword: string
    newPassword: string
    confirmNewPassword: string
  }) => {
    updatePassword(values.newPassword)
  }

  const validateMessages = {
    required: '${label} is required!',
  }

  return (
    <Form.Provider
      onFormFinish={(name, { values, forms }) => {
        const { changePasswordForm } = forms
        changePasswordForm.resetFields()
        openSuccessNotification({
          message: 'Password has been successfully changed',
          description: 'New password has been set!',
        })
      }}
    >
      <Form
        ref={changePasswordFormRef}
        name="changePasswordForm"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }}
        validateMessages={validateMessages}
        validateTrigger="onBlur"
      >
        <Row align="middle" justify="space-between">
          <Col span={6}>
            <Form.Item
              name="oldPassword"
              label="Old Password"
              rules={[{ required: true }, { validator: validatePassword }]}
            >
              <Input.Password placeholder="Old Password" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[{ required: true }]}
            >
              <Input.Password placeholder="New Password" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="confirmNewPassword"
              label="Confirm New Password"
              rules={[
                { required: true },
                { validator: validateSameNewPassword },
              ]}
            >
              <Input.Password
                type="password"
                placeholder="Confirm New Password"
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginTop: 6, width: '100%' }}
            >
              Change Password
            </Button>
          </Col>
        </Row>
      </Form>
    </Form.Provider>
  )
}
