import { useGlobalContext } from '../Providers/GlobalProvider'
import { LockFilled } from '@ant-design/icons'
import Title from 'antd/lib/typography/Title'
import { Button, Form, Input, Space } from 'antd'
import { useRef } from 'react'

type EnterPasswordModalProps = {
  setAccess: React.Dispatch<React.SetStateAction<boolean>>
  screen: string
  isInsideAccordion?: boolean
}

export const EnterPassword = ({
  setAccess,
  screen,
  isInsideAccordion,
}: EnterPasswordModalProps) => {
  const { password } = useGlobalContext()
  const enterPasswordFormRef: any = useRef()

  const validatePassword = (rule: any, value: any, callback: any) => {
    if (value && value !== password) {
      callback('Incorrect password!')
    } else {
      callback()
    }
  }

  return (
    <Space
      direction="vertical"
      style={{
        width: '100%',
        height: isInsideAccordion ? 'auto' : 'calc(100vh - 85px)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <LockFilled style={{ fontSize: 90 }} />
      <Title level={4}>{`Enter password to access ${screen}`}</Title>
      <Form
        ref={enterPasswordFormRef}
        initialValues={{
          password: '',
        }}
        onFinish={(values) => {
          if (values.password !== '' && values.password === password) {
            setAccess(true)
          }
        }}
        validateTrigger="onBlur"
      >
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please enter the password' },
            { validator: validatePassword },
          ]}
        >
          <Input.Password placeholder="Password" autoFocus />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{
            width: '100%',
          }}
        >
          Submit
        </Button>
      </Form>
    </Space>
  )
}
