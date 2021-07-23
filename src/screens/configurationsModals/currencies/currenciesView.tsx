import { Row, Col, Card, Button, Table } from "react-bootstrap";
import { AiOutlineEdit, AiFillDelete } from "react-icons/ai";
import { Currencies } from "../types";

interface InputParams {
	handleShow: Function;
	currenciesList: Currencies[];
}

const CurrenciesView = ({ handleShow, currenciesList }: InputParams) => {
	return (
		<>
			<Row style={{ marginTop: 20, marginRight: 10, marginLeft: 10 }}>
				<Col>
					<Card
						style={{
							paddingTop: 20,
							paddingLeft: 20,
							paddingRight: 20,
						}}
					>
						<Row>
							<Col>
								<h2 style={{ fontWeight: 400 }}>Currencies</h2>
							</Col>
							<Col style={{ display: "flex" }}>
								<Button
									style={{
										width: 50,
										height: 50,
										marginLeft: "auto",
										backgroundColor: "black",
										fontSize: 20,
									}}
									onClick={() => handleShow("currency")}
								>
									+
								</Button>
							</Col>
						</Row>
						{currenciesList.length > 0 ? (
							<Row
								style={{
									marginTop: 20,
									marginLeft: 5,
									marginRight: 5,
								}}
							>
								<Table striped bordered hover responsive>
									<thead>
										<tr>
											<th>#</th>
											<th>Name</th>
											<th>Label</th>
											<th>Max Rate</th>
											<th>Min Rate</th>
											<th>No. of Accounts</th>
											<th style={{ width: 50 }}>Edit</th>
											<th style={{ width: 70 }}>
												Delete
											</th>
										</tr>
									</thead>
									<tbody>
										{currenciesList.map((item, index) => {
											return (
												<tr>
													<td>{index + 1}</td>
													<td>{item.name}</td>
													<td>{item.label}</td>
													<td>{item.maxRate}</td>
													<td>{item.minRate}</td>
													{item.accounts.length >
													0 ? (
														<td>
															{
																item.accounts
																	.length
															}
														</td>
													) : (
														<td>-</td>
													)}
													<td>
														<Row
															style={{
																paddingLeft: 20,
																paddingRight: 20,
															}}
														>
															<Button
																size="sm"
																style={{
																	backgroundColor:
																		"black",
																}}
															>
																<AiOutlineEdit />
															</Button>
														</Row>
													</td>
													<td>
														<Row
															style={{
																paddingLeft: 20,
																paddingRight: 20,
															}}
														>
															<Button
																size="sm"
																style={{
																	backgroundColor:
																		"black",
																}}
															>
																<AiFillDelete />
															</Button>
														</Row>
													</td>
												</tr>
											);
										})}
									</tbody>
								</Table>
							</Row>
						) : (
							<div style={{ marginBottom: 20 }}></div>
						)}
					</Card>
				</Col>
			</Row>
		</>
	);
};

export default CurrenciesView;
