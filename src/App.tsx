import './App.css'
import { HashRouter, Switch, Route } from 'react-router-dom'
import Transactions from './screens/home'
import Configurations from './screens/configurations'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css'
import OverallReport from './screens/reports/overallReport'
import ProfitAndLoss from './screens/reports/profitAndLossReport'
import CustomerReport from './screens/reports/customerReport'
import logo from './appAssets/Logo.jpg'
import CurrencyReport from './screens/reports/currencyReport'

const App = () => {
  return (
    <HashRouter>
      <Navbar sticky="top" className="color-nav" variant="dark">
        <Container>
          <Navbar.Brand href="#transactions">
            <img
              src={logo}
              style={{ width: 100, marginTop: -7 }}
              alt="AuditLab"
            />
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#transactions">Transactions</Nav.Link>
            <Nav.Link href="#configurations">Configurations</Nav.Link>
            <NavDropdown title="Reports" id="reports-nav-dropdown">
              <NavDropdown.Item href="#overallReport">
                Overall Report
              </NavDropdown.Item>
              <NavDropdown.Item href="#customerReport">
                Customer Report
              </NavDropdown.Item>
              <NavDropdown.Item href="#currencyReport">
                Currency Report
              </NavDropdown.Item>
              <NavDropdown.Item href="#profitLoss">
                Profit & Loss
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>

      <Switch>
        <Route path="/overallReport">
          <OverallReport />
        </Route>
        <Route path="/customerReport">
          <CustomerReport />
        </Route>
        <Route path="/currencyReport">
          <CurrencyReport />
        </Route>
        <Route path="/profitLoss">
          <ProfitAndLoss />
        </Route>
        <Route path="/configurations">
          <Configurations />
        </Route>
        <Route path="/transactions">
          <Transactions />
        </Route>
        <Route path="/">
          <Transactions />
        </Route>
      </Switch>
    </HashRouter>
  )
}

export default App
