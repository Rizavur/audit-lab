import React from 'react'
import { DatePicker as AntdDatePicker } from 'antd'
import { DatePickerProps, DATE_FORMAT, MASKED } from '../Service/CommonService'

const DatePicker = (props: DatePickerProps) => (
  <AntdDatePicker
    format={DATE_FORMAT}
    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
      const input = event.target as HTMLInputElement
      input.value = MASKED.resolve(input.value)
    }}
    picker="date"
    placeholder={DATE_FORMAT.toLowerCase()}
    {...props}
  />
)

export default DatePicker
