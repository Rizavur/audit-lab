import IMask from 'imask'
import { round } from 'lodash'
import moment from 'moment'
import { DatePickerProps as AntDatePickerProps } from 'antd'

export const isDev = process.env.NODE_ENV === 'development'

export const addCommas = (nStr: string, toggleOffZeroCheck?: boolean) => {
  if (round(Number(nStr), 2) === 0) {
    if (!toggleOffZeroCheck) {
      return '0.00'
    } else {
      return ''
    }
  }
  nStr += ''
  var x = nStr.split('.')
  var x1 = x[0]
  var x2 = x.length > 1 ? '.' + x[1] : ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return (x1 + x2).replace(/[.,]00$/, '')
}

export const DATE_FORMAT = 'DD-MM-YYYY'

export const MASKED = IMask.createMask({
  blocks: {
    DD: { from: 1, mask: IMask.MaskedRange, to: 31 },
    MM: { from: 1, mask: IMask.MaskedRange, to: 12 },
    YYYY: { from: 1900, mask: IMask.MaskedRange, to: Number.MAX_VALUE },
  },
  format: (date: Date) => moment(date).format(DATE_FORMAT),
  mask: Date,
  parse: (date: string) => moment(date, DATE_FORMAT),
  pattern: DATE_FORMAT,
})

export type DatePickerProps = Omit<
  AntDatePickerProps,
  'format' | 'picker' | 'onKeyDown'
>
