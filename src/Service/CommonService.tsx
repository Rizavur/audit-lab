import { round } from 'lodash'

export const isDev = process.env.NODE_ENV === 'development'

export const addCommas = (nStr: string) => {
  if (round(Number(nStr), 2) === 0) {
    return ''
  }
  nStr += ''
  var x = nStr.split('.')
  var x1 = x[0]
  var x2 = x.length > 1 ? '.' + x[1] : ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return x1 + x2
}
