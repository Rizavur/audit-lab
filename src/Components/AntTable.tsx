import React, { useContext, useState, useEffect, useRef } from 'react'
import { Input, Form, Select, DatePicker } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { Transaction } from '../types'
import moment from 'moment'

const EditableContext = React.createContext<FormInstance<any> | null>(null)

interface EditableRowProps {
  index: number
}

export const EditableRow: React.FC<EditableRowProps> = ({
  index,
  ...props
}) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  children: React.ReactNode
  dataIndex: keyof Transaction
  record: Transaction
  selectionData?: string[]
  date?: boolean
  required: boolean
  handleSave: (record: Transaction) => void
}

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  selectionData,
  date,
  required,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<Input>(null)
  const form = useContext(EditableContext)!

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current!.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async () => {
    try {
      const values = await form.validateFields()

      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  const saveDate = async (date: any, dateString: any) => {
    try {
      toggleEdit()
      handleSave({ ...record, transaction_date: dateString })
    } catch (errInfo) {
      console.log('Save date failed:', errInfo)
    }
  }

  const renderFormField = () => {
    if (date) {
      return (
        <DatePicker
          autoFocus
          defaultOpen
          allowClear={false}
          name={dataIndex}
          onChange={saveDate}
          onBlur={save}
          placeholder={record.transaction_date}
          defaultValue={moment(record.transaction_date)}
        />
      )
    } else if (selectionData) {
      return (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            required
              ? {
                  required: true,
                  message: `${title} is required.`,
                }
              : {},
          ]}
        >
          <Select
            onSelect={save}
            onBlur={save}
            showSearch
            defaultOpen
            allowClear
            autoFocus
          >
            {selectionData.length &&
              selectionData.map((item: any) => {
                return (
                  <Select.Option value={item} key={item}>
                    {item}
                  </Select.Option>
                )
              })}
          </Select>
        </Form.Item>
      )
    } else {
      return (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            required
              ? {
                  required: true,
                  message: `${title} is required.`,
                }
              : {},
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      )
    }
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      renderFormField()
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}
