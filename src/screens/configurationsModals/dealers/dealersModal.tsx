import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { Formik } from "formik";
import { CURRENCIES } from "../../../dummydata/currencies";
import { ModalInputParams } from "../types";

const DealersModal = ({ handleClose, showModal }: ModalInputParams) => {
	const [dealerName, setDealerName] = useState("");

	return (
		<Formik
			initialValues={{
				dealerName,
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
						onHide={() => handleClose("dealer")}
						centered
						size="lg"
					>
						<Modal.Header>
							<Modal.Title style={{ fontWeight: 400 }}>
								Add new dealer
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form.Group controlId="dealerName">
								<Form.Label>Dealer's Name</Form.Label>
								<Form.Control
									type="text"
									defaultValue={dealerName}
									onChange={({ target }) => {
										setDealerName(target.value);
									}}
								/>
							</Form.Group>
						</Modal.Body>
						<Modal.Footer>
							<Button
								variant="secondary"
								onClick={() => handleClose("dealer")}
							>
								Close
							</Button>
							<Button
								variant="primary"
								onClick={() => handleClose("dealer")}
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

export default DealersModal;
