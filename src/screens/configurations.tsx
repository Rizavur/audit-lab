import { useState } from "react";
import { Row } from "react-bootstrap";
import CurrenciesModal from "./configurationsModals/currencies/currenciesModal";
import CurrenciesView from "./configurationsModals/currencies/currenciesView";
import CustomersModal from "./configurationsModals/customers/customersModal";
import CustomersView from "./configurationsModals/customers/customersView";
import DealersModal from "./configurationsModals/dealers/dealersModal";
import DealersView from "./configurationsModals/dealers/dealersView";
import { Currencies } from "./configurationsModals/types";

const Configurations = () => {
	const [showCurrenciesModal, setShowCurrenciesModal] = useState(false);
	const [showCustomersModal, setShowCustomersModal] = useState(false);
	const [showDealersModal, setShowDealersModal] = useState(false);

	const [currenciesList, setCurrenciesList] = useState<Currencies[]>([]);

	const handleClose = (type: string) => {
		switch (type) {
			case "currency":
				setShowCurrenciesModal(false);
				break;
			case "customer":
				setShowCustomersModal(false);
				break;
			case "dealer":
				setShowDealersModal(false);
				break;
			default:
				break;
		}
	};

	const handleShow = (type: string) => {
		switch (type) {
			case "currency":
				setShowCurrenciesModal(true);
				break;
			case "customer":
				setShowCustomersModal(true);
				break;
			case "dealer":
				setShowDealersModal(true);
				break;
			default:
				break;
		}
	};

	return (
		<>
			<h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
				Configurations
			</h1>
			<CurrenciesView
				handleShow={handleShow}
				currenciesList={currenciesList}
			/>
			<Row style={{ marginTop: 20, marginRight: 10, marginLeft: 10 }}>
				<CustomersView handleShow={handleShow} />
				<DealersView handleShow={handleShow} />
			</Row>
			<CurrenciesModal
				handleClose={handleClose}
				showModal={showCurrenciesModal}
				setCurrenciesList={setCurrenciesList}
				currenciesList={currenciesList}
			/>
			<CustomersModal
				handleClose={handleClose}
				showModal={showCustomersModal}
			/>
			<DealersModal
				handleClose={handleClose}
				showModal={showDealersModal}
			/>
		</>
	);
};

export default Configurations;
