import React from 'react'
import { DatePicker as AntdDatePicker } from 'antd'
import { DatePickerProps, DATE_FORMAT, MASKED } from '../Service/CommonService'

const DateRangePicker = (props: DatePickerProps) => (
  // @ts-ignore
  <AntdDatePicker.RangePicker
    format={DATE_FORMAT}
    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
      const input = event.target as HTMLInputElement
      input.value = MASKED.resolve(input.value)
    }}
    picker="date"
    {...props}
  />
)

export default DateRangePicker
