import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Transactions from "./screens/home";
import Reports from "./screens/reports";
import Configurations from "./screens/configurations";
import { Container, Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
	return (
		<Router>
			<div>
				<Navbar bg="dark" variant="dark">
					<Container>
						<Navbar.Brand href="/">Accounting</Navbar.Brand>
						<Nav className="me-auto">
							<Nav.Link href="/">Transactions</Nav.Link>
							<Nav.Link href="/configurations">
								Configurations
							</Nav.Link>
							<Nav.Link href="/reports">Reports</Nav.Link>
						</Nav>
					</Container>
				</Navbar>

				<Switch>
					<Route path="/reports">
						<Reports />
					</Route>
					<Route path="/configurations">
						<Configurations />
					</Route>
					<Route path="/">
						<Transactions />
					</Route>
				</Switch>
			</div>
		</Router>
	);
};

export default App;
