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