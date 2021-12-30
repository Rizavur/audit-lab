import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap'
import { Switch, Route } from 'react-router'
import { HashRouter } from 'react-router-dom'
import Configurations from './screens/configurations'
import Transactions from './screens/home'
import CurrencyReport from './screens/reports/currencyReport'
import CustomerReport from './screens/reports/customerReport'
import OverallReport from './screens/reports/overallReport'
import ProfitAndLoss from './screens/reports/profitAndLossReport'
import logo from './appAssets/Logo.jpg'
import { useGlobalContext } from './Providers/GlobalProvider'
import { CreatePasswordScreen } from './screens/CreatePasswordScreen'
import { MdLock } from 'react-icons/md'
import { BackTop } from 'antd'

export const AppNavigator = () => {
  const { password } = useGlobalContext()

  if (!password) {
    return <CreatePasswordScreen />
  }

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
                <div style={styles.NavDropdownItem}>
                  <em style={styles.NavDropdownText}>Overall Report</em>
                  <MdLock />
                </div>
              </NavDropdown.Item>
              <NavDropdown.Item href="#profitLoss">
                <div style={styles.NavDropdownItem}>
                  <em style={styles.NavDropdownText}>Profit & Loss</em>
                  <MdLock />
                </div>
              </NavDropdown.Item>
              <NavDropdown.Item href="#customerReport">
                <div style={styles.NavDropdownItem}>
                  <em style={styles.NavDropdownText}>Customer Report</em>
                </div>
              </NavDropdown.Item>
              <NavDropdown.Item href="#currencyReport">
                <div style={styles.NavDropdownItem}>
                  <em style={styles.NavDropdownText}>Currency Report</em>
                </div>
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
      <BackTop style={{ marginRight: -80, marginBottom: -30 }} />
    </HashRouter>
  )
}

const styles = {
  NavDropdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  NavDropdownText: {
    marginRight: 20,
  },
}
