import { AutoComplete } from 'antd'

export const AntAutoComplete = ({
  formRef,
  options,
  identifier,
  onSelectChangeState,
  placeholder,
}: {
  formRef: any
  options: string[]
  identifier: string
  onSelectChangeState?: Function
  placeholder: string
}) => {
  return (
    <AutoComplete
      style={{ width: '100%' }}
      placeholder={placeholder}
      showSearch
      allowClear
      filterOption={(input: any, option: any) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      filterSort={(optionA, optionB) =>
        optionA.children
          .toLowerCase()
          .localeCompare(optionB.children.toLowerCase())
      }
      onBlur={() => {
        const values = formRef.current.getFieldsValue()
        if (values[identifier]) {
          const filteredOptions = options.filter(
            (option: string) =>
              option.toLowerCase().indexOf(values[identifier].toLowerCase()) >=
              0
          )
          if (filteredOptions.length && values[identifier]) {
            formRef.current.setFieldsValue({
              ...values,
              [identifier]: filteredOptions[0],
            })
            if (onSelectChangeState) {
              onSelectChangeState(filteredOptions[0])
            }
          } else {
            formRef.current.setFieldsValue({
              ...values,
              [identifier]: '',
            })
            if (onSelectChangeState) {
              onSelectChangeState('')
            }
          }
        }
      }}
    >
      {options.map((optionItem, index) => {
        return (
          <AutoComplete.Option key={index} value={optionItem}>
            {optionItem}
          </AutoComplete.Option>
        )
      })}
    </AutoComplete>
  )
}
