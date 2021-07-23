import { Formik } from "formik";
import moment from "moment";
import { useState } from "react";
import { Card, Col, Row, Form, InputGroup, Button } from "react-bootstrap";

const Transactions = () => {
	const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
	const hasAccount = false;

	const currencies = ["INR", "MYR", "SGD", "THB"];
	const accounts = ["ABC", "CDE", "EFG", "HIJ"];

	const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

	return (
		<>
			<h1 style={{ marginTop: 20, marginLeft: 20, fontWeight: 550 }}>
				Transactions
			</h1>
			<Card style={{ margin: 20 }}>
				<Formik
					initialValues={{
						date,
						transactionNo: 1,
						capital: 1000,
						cashOnHand: 100000,
						accountAmount: 0,
						customerRate: 10,
						customerReverseRate: 10,
						customerAmount: 20,
						dealerRate: 10,
						dealerReverseRate: 10,
						dealerAmount: 10,
						customerAmountSGD: 60,
						dealerAmountSGD: 10,
					}}
					onSubmit={() => {
						//Later push to SQLite DB
						console.log(date);
					}}
				>
					{({ values, handleBlur, handleSubmit }) => (
						<Form style={{ padding: 25 }} onSubmit={handleSubmit}>
							{/* Row1 */}
							<Row>
								<Col>
									<Form.Group>
										<Form.Label>Date</Form.Label>
										<Form.Control
											type="date"
											defaultValue={values.date}
											onChange={({ target }) =>
												setDate(target.value)
											}
											onBlur={handleBlur}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Transaction No.</Form.Label>
										<Form.Control
											type="number"
											defaultValue={values.transactionNo}
											readOnly
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Capital</Form.Label>
										<InputGroup>
											<InputGroup.Text>$</InputGroup.Text>
											<Form.Control
												type="number"
												defaultValue={values.capital}
												readOnly
											/>
										</InputGroup>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Cash on hand</Form.Label>
										<InputGroup>
											<InputGroup.Text>$</InputGroup.Text>
											<Form.Control
												type="number"
												defaultValue={values.cashOnHand}
												readOnly
											/>
										</InputGroup>
									</Form.Group>
								</Col>
							</Row>
							{/* Row2 */}
							<Row style={{ marginTop: 20 }}>
								<Col>
									<Form.Group>
										<Form.Label>Currency</Form.Label>
										<Form.Control
											as="select"
											onChange={({ target }) => {
												setSelectedCurrency(
													target.value
												);
											}}
										>
											{currencies.map((currency) => {
												return (
													<option>{currency}</option>
												);
											})}
										</Form.Control>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Account</Form.Label>
										{hasAccount ? (
											<Form.Control as="select">
												{accounts.map((account) => {
													return (
														<option>
															{account}
														</option>
													);
												})}
											</Form.Control>
										) : (
											<Form.Control
												type="text"
												readOnly
											/>
										)}
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Account balance</Form.Label>
										<InputGroup>
											<InputGroup.Text>
												{selectedCurrency}
											</InputGroup.Text>
											<Form.Control
												type="number"
												defaultValue={
													values.accountAmount
												}
												readOnly
											/>
										</InputGroup>
									</Form.Group>
								</Col>
							</Row>
							{/* Row3 */}
							<Row style={{ marginTop: 20 }}>
								<Col>
									<Form.Group>
										<Form.Label>Customer</Form.Label>
										<Form.Control as="select">
											{accounts.map((account) => {
												return (
													<option>{account}</option>
												);
											})}
										</Form.Control>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Customer amount</Form.Label>
										<InputGroup>
											<InputGroup.Text>
												{selectedCurrency}
											</InputGroup.Text>
											<Form.Control
												type="number"
												defaultValue={
													values.customerAmount
												}
											/>
										</InputGroup>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Rate</Form.Label>
										<Form.Control
											type="number"
											defaultValue={values.customerRate}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Reverse Rate</Form.Label>
										<Form.Control
											type="number"
											defaultValue={
												values.customerReverseRate
											}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Amount</Form.Label>
										<InputGroup>
											<InputGroup.Text>
												SGD
											</InputGroup.Text>
											<Form.Control
												type="number"
												defaultValue={
													values.customerAmountSGD
												}
											/>
										</InputGroup>
									</Form.Group>
								</Col>
							</Row>
							{/* Row4 */}
							<Row style={{ marginTop: 20 }}>
								<Col>
									<Form.Group>
										<Form.Label>Dealer</Form.Label>
										<Form.Control as="select">
											{accounts.map((account) => {
												return (
													<option>{account}</option>
												);
											})}
										</Form.Control>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Dealer amount</Form.Label>
										<InputGroup>
											<InputGroup.Text>
												{selectedCurrency}
											</InputGroup.Text>
											<Form.Control
												type="number"
												defaultValue={
													values.dealerAmount
												}
											/>
										</InputGroup>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Rate</Form.Label>
										<Form.Control
											type="number"
											defaultValue={values.dealerRate}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Reverse Rate</Form.Label>
										<Form.Control
											type="number"
											defaultValue={
												values.dealerReverseRate
											}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group>
										<Form.Label>Amount</Form.Label>
										<InputGroup>
											<InputGroup.Text>
												SGD
											</InputGroup.Text>
											<Form.Control
												type="number"
												defaultValue={
													values.dealerAmountSGD
												}
											/>
										</InputGroup>
									</Form.Group>
								</Col>
							</Row>
							<Button
								variant="primary"
								type="submit"
								style={{ marginTop: 20, width: "100%" }}
							>
								Submit
							</Button>
						</Form>
					)}
				</Formik>
			</Card>
		</>
	);
};

export default Transactions;
