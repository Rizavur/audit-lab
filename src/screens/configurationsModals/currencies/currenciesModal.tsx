import { useState } from "react";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import { Formik } from "formik";
import { ModalInputParams } from "../types";

interface Account {
	name: string;
	amt: number;
}

const CurrenciesModal = ({
	handleClose,
	showModal,
	setCurrenciesList,
	currenciesList,
}: ModalInputParams) => {
	const [accounts, setAccounts] = useState<Account[]>([]);

	return (
		<Modal
			show={showModal}
			onHide={() => handleClose("currency")}
			centered
			size="lg"
		>
			<Formik
				initialValues={{
					currencyName: "",
					currencyLabel: "",
					accounts: [],
					newAccount: { name: "", amt: 0 },
					maxRange: 0,
					minRange: 0,
				}}
				onSubmit={(values) => {
					!!setCurrenciesList &&
						!!currenciesList &&
						setCurrenciesList([
							...currenciesList,
							{
								name: values.currencyName,
								label: values.currencyLabel,
								maxRate: values.maxRange,
								minRate: values.minRange,
								accounts: values.accounts,
							},
						]);
					console.log("Currencies List: ", currenciesList);
				}}
			>
				{({ values, handleChange, handleSubmit }) => {
					return (
						<Form>
							<Modal.Header>
								<Modal.Title style={{ fontWeight: 400 }}>
									Add new currency
								</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<Card style={{ padding: 12 }}>
									<Col>
										<Form.Group controlId="currencyName">
											<Form.Label>
												Currency Name
											</Form.Label>
											<Form.Control
												type="text"
												defaultValue={
													values.currencyName
												}
												onChange={handleChange}
											/>
											<Form.Text>
												Eg. Singapore dollars
											</Form.Text>
										</Form.Group>
									</Col>
									<Row style={{ marginTop: 15 }}>
										<Col md={4}>
											<Form.Group controlId="currencyLabel">
												<Form.Label>
													Currency Label
												</Form.Label>
												<Form.Control
													type="text"
													defaultValue={
														values.currencyLabel
													}
													onChange={handleChange}
												/>
												<Form.Text>
													Eg. SGD, INR, THB
												</Form.Text>
											</Form.Group>
										</Col>
										<Col md={4}>
											<Form.Group controlId="maxRange">
												<Form.Label>
													Max Range
												</Form.Label>
												<Form.Control
													type="number"
													defaultValue={
														values.maxRange
													}
													onChange={handleChange}
												/>
											</Form.Group>
										</Col>
										<Col md={4}>
											<Form.Group controlId="minRange">
												<Form.Label>
													Min Range
												</Form.Label>
												<Form.Control
													type="number"
													defaultValue={
														values.minRange
													}
													onChange={handleChange}
												/>
											</Form.Group>
										</Col>
									</Row>
								</Card>
								<Card
									style={{
										padding: 12,
										marginTop: 15,
									}}
								>
									<Row>
										<Col
											style={{
												fontSize: 17,
												fontWeight: "bold",
											}}
										>
											Accounts
										</Col>
										<Col style={{ display: "flex" }}>
											<Button
												size="sm"
												style={{
													width: 30,
													height: 30,
													marginLeft: "auto",
													backgroundColor: "black",
													fontSize: 15,
												}}
												onClick={() => {
													setAccounts([
														...accounts,
														{
															name: "",
															amt: 0,
														},
													]);
												}}
											>
												+
											</Button>
										</Col>
									</Row>
									<div>
										{accounts.map((item, index) => {
											return (
												<div
													style={{
														marginTop: 15,
													}}
												>
													<Form>
														<Row className="align-items-center">
															<Col md={1}>
																<div
																	style={{
																		alignItems:
																			"center",
																	}}
																>
																	{index + 1}.
																</div>
															</Col>
															<Col>
																<Form.Group controlId="accountName">
																	<Form.Label>
																		Name
																	</Form.Label>
																	<Form.Control
																		type="text"
																		defaultValue={
																			item.name
																		}
																		onChange={
																			handleChange
																		}
																	/>
																</Form.Group>
															</Col>
															<Col>
																<Form.Group controlId="accountAmount">
																	<Form.Label>
																		Amount
																	</Form.Label>
																	<Form.Control
																		type="text"
																		defaultValue={
																			item.amt
																		}
																		onChange={
																			handleChange
																		}
																	/>
																</Form.Group>
															</Col>
														</Row>
													</Form>
												</div>
											);
										})}
									</div>
								</Card>
							</Modal.Body>
							<Modal.Footer>
								<Button
									variant="secondary"
									onClick={() => handleClose("currency")}
								>
									Close
								</Button>
								<Button
									variant="primary"
									onClick={() => {
										handleSubmit();
										handleClose("currency");
									}}
								>
									Save Changes
								</Button>
							</Modal.Footer>
						</Form>
					);
				}}
			</Formik>
		</Modal>
	);
};

export default CurrenciesModal;
