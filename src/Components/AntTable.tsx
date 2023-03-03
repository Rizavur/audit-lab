import React, { useContext, useState, useEffect, useRef } from 'react'
import { Input, Form, Select, Modal, InputNumber } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { FormInstance } from 'antd/lib/form'
import { Transaction } from '../types'
import moment from 'moment'
import { addCommas } from '../Service/CommonService'
import DatePicker from './AntDatePicker'

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
  isUpperCase?: boolean
  isNumber?: boolean
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
  isUpperCase,
  isNumber,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<any>(null)
  const form = useContext(EditableContext)!

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const toggleEdit = (isEditMode: boolean) => {
    setEditing(isEditMode)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const unFocusRef = () => {
    if (inputRef.current) {
      inputRef.current!.blur()
    }
    toggleEdit(false)
  }

  const showEditConfirm = (date?: any, dateString?: string) => {
    Modal.confirm({
      title: 'Are you sure you want to edit this field?',
      icon: <ExclamationCircleOutlined />,
      content: 'Click yes to confirm edit',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        save(date, dateString)
      },
      onCancel() {
        unFocusRef()
      },
    })
  }

  const save = async (date?: any, dateString?: string) => {
    if (date && dateString) {
      saveDate(date, dateString)
    } else {
      try {
        const values = await form.validateFields()
        toggleEdit(false)
        handleSave({ ...record, ...values })
      } catch (errInfo) {
        console.log('Save failed:', errInfo)
      }
    }
  }

  const saveDate = async (date: any, dateString: string) => {
    try {
      toggleEdit(false)
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
          onChange={(date: any, dateString: string) =>
            showEditConfirm(date, dateString)
          }
          onBlur={unFocusRef}
          placeholder={moment(record.transaction_date).format('DD-MM-YYYY')}
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
            onBlur={showEditConfirm}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                inputRef.current.blur()
              }
            }}
            ref={inputRef}
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
    } else if (isNumber) {
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
          <InputNumber
            style={{ width: '100%' }}
            ref={inputRef}
            onBlur={showEditConfirm}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                inputRef.current.blur()
              }
            }}
            min={0.0000000001}
            formatter={(value: any) => addCommas(value)}
          />
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
          <Input
            ref={inputRef}
            onBlur={showEditConfirm}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                inputRef.current.blur()
              }
            }}
            allowClear={required ? false : true}
            style={{ textTransform: isUpperCase ? 'uppercase' : 'none' }}
          />
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
        onDoubleClick={() => toggleEdit(true)}
      >
        {children}
      </div>
    )
  } else {
    childNode = (
      <div
        className="non-editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
      >
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}
