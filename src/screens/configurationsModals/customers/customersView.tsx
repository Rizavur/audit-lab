import React from "react";
import { Row, Col, Card, Button, Table } from "react-bootstrap";
import { AiOutlineEdit, AiFillDelete } from "react-icons/ai";
import * as customers from "../../../dummydata/customers";
import { ViewInputParams } from "../types";

const CustomersView = ({ handleShow }: ViewInputParams) => {
	return (
		<Col>
			<Card style={{ padding: 20 }}>
				<Row>
					<Col>
						<h2 style={{ fontWeight: 400 }}>Customers</h2>
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
							onClick={() => handleShow("customer")}
						>
							+
						</Button>
					</Col>
				</Row>
				<Row style={{ marginTop: 20, marginLeft: 5, marginRight: 5 }}>
					<Table striped bordered hover responsive>
						<thead>
							<tr>
								<th>#</th>
								<th>Name</th>
								<th style={{ width: 50 }}>Edit</th>
								<th style={{ width: 70 }}>Delete</th>
							</tr>
						</thead>
						<tbody>
							{customers.CUSTOMERS.map((item, index) => {
								return (
									<tr>
										<td>{index + 1}</td>
										<td>{item.name}</td>
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
			</Card>
		</Col>
	);
};

export default CustomersView;
