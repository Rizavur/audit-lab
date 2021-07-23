import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { Formik } from "formik";
import { CURRENCIES } from "../../../dummydata/currencies";
import { ModalInputParams } from "../types";

const CustomersModal = ({ handleClose, showModal }: ModalInputParams) => {
	const [customerName, setCustomerName] = useState("");

	return (
		<Formik
			initialValues={{
				customerName,
			}}
			onSubmit={() => {
				console.log(CURRENCIES);
			}}
		>
			{({
				values,
				errors,
				touched,
				handleChange,
				handleBlur,
				handleSubmit,
				isSubmitting,
			}) => {
				return (
					<Modal
						show={showModal}
						onHide={() => handleClose("customer")}
						centered
						size="lg"
					>
						<Modal.Header>
							<Modal.Title style={{ fontWeight: 400 }}>
								Add new customer
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form.Group controlId="customerName">
								<Form.Label>Customer's Name</Form.Label>
								<Form.Control
									type="text"
									defaultValue={customerName}
									onChange={({ target }) => {
										setCustomerName(target.value);
									}}
								/>
							</Form.Group>
						</Modal.Body>
						<Modal.Footer>
							<Button
								variant="secondary"
								onClick={() => handleClose("customer")}
							>
								Close
							</Button>
							<Button
								variant="primary"
								onClick={() => handleClose("customer")}
							>
								Save Changes
							</Button>
						</Modal.Footer>
					</Modal>
				);
			}}
		</Formik>
	);
};

export default CustomersModal;
