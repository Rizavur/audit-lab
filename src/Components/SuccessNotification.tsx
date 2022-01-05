import { notification } from 'antd'

interface SuccessNotificationInput {
  message: string
  description?: string
}

export const openSuccessNotification = ({
  message,
  description,
}: SuccessNotificationInput) => {
  notification.success({
    message: message,
    description: description,
    duration: 2,
    top: 88,
  })
}
