import { round } from 'lodash'

export const isDev = process.env.NODE_ENV === 'development'

export const addCommas = (nStr: string) => {
  if (round(Number(nStr), 2) === 0) {
    return '0.00'
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

export const reformatDate = (event: any) => {
  const strippedInput = event.target.value.replaceAll('-', '')
  let newInput = ''
  for (let i = 0; i < strippedInput.length; i += 1) {
    if (i === 2 || i === 4) newInput += '-'
    newInput += strippedInput.charAt(i)
  }
  event.target.value = newInput
}
