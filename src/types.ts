export interface CurrencyDetail {
    currency_id: number
    currency_code: string
    currency_description: string
}
  
export interface CustomerDetail {
    cust_id: number
    cust_code: string
    customer_description: string
}
  
export interface TransactionFormikValues {
    date: string
    buyOrSell: string
    custCode: string
    rate: number | string
    reverseRate: number | string
    tradeCurrCode: string
    tradeCurrAmount: number | string
    settlementAmount: number
    remarks: string
}
  
export interface FcClosingStock {
    code: string
    closingStock: number
}

export interface Currencies {
    name: string;
    label: string;
    maxRate: number;
    minRate: number;
    accounts: string[];
}

export interface ModalInputParams {
	handleClose: Function;
	showModal: boolean;
	setCurrenciesList?: React.Dispatch<React.SetStateAction<Currencies[]>>;
	currenciesList?: Currencies[];
}

export interface ViewInputParams {
	handleShow: Function;
	currenciesList?: Currencies[];
}

export interface CurrencyFormikValues {
	currencyCode: string
	currencyDescription: string
}

export interface CustomerFormikValues {
	customerCode: string
	customerDescription: string
}

export interface Transaction {
    record_no: number
    transaction_date: string
    transaction_entered_date?: string
    cust_code: string
    buy_or_sell: string
    trade_curr_code: string
    trade_curr_amount: number
    rate: number
    reverse_rate: number
    settlement_curr_amount: number
    remarks?: string
    edit_count?: number
    transaction_edited_date?: string
}

export interface AllTransactionTableProps {
    refresh: number
    refreshFcClosing: Function
    refreshCustClosing: Function
}