import { Switch, Route } from 'react-router'
import { HashRouter, Link } from 'react-router-dom'
import Configurations from './screens/configurations'
import Transactions from './screens/home'
import CurrencyReport from './screens/reports/currencyReport'
import CustomerReport from './screens/reports/customerReport'
import OverallReport from './screens/reports/overallReport'
import ProfitAndLoss from './screens/reports/profitAndLossReport'
import logo from './appAssets/Logo.jpg'
import { useGlobalContext } from './Providers/GlobalProvider'
import { CreatePasswordScreen } from './screens/CreatePasswordScreen'
import { BackTop, Layout, Menu, Row } from 'antd'
import { Content, Header } from 'antd/lib/layout/layout'
import SubMenu from 'antd/lib/menu/SubMenu'
import Text from 'antd/lib/typography/Text'
import { LockFilled } from '@ant-design/icons'

export const AppNavigator = () => {
  const { password } = useGlobalContext()

  if (!password) {
    return <CreatePasswordScreen />
  }

  return (
    <HashRouter>
      <Layout>
        <Header
          style={{
            position: 'fixed',
            zIndex: 1,
            width: '100%',
            backgroundColor: 'black',
          }}
        >
          <Row align="middle">
            <img
              src={logo}
              style={{ width: 100, height: 30, marginRight: 10 }}
              alt="AuditLab"
            />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['1']}
              style={{ backgroundColor: 'black' }}
            >
              <Menu.Item key="1">
                <Link
                  to="transactions"
                  replace
                  style={{ textDecoration: 'none' }}
                >
                  <Text style={{ color: 'white' }}>Transactions</Text>
                </Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link
                  to="/configurations"
                  replace
                  style={{ textDecoration: 'none' }}
                >
                  <Text style={{ color: 'white' }}>Configurations</Text>
                </Link>
              </Menu.Item>
              <SubMenu key="3" title="Reports" style={{ color: 'white' }}>
                <Menu.Item key="reports:1">
                  <Link
                    to="/overallReport"
                    replace
                    style={{ textDecoration: 'none' }}
                  >
                    <Row justify="space-between" align="middle">
                      <Text>Overall Report</Text>
                      <LockFilled />
                    </Row>
                  </Link>
                </Menu.Item>
                <Menu.Item key="reports:2">
                  <Link
                    to="/profitLoss"
                    replace
                    style={{ textDecoration: 'none' }}
                  >
                    <Row justify="space-between" align="middle">
                      <Text>Profit & Loss</Text>
                      <LockFilled />
                    </Row>
                  </Link>
                </Menu.Item>
                <Menu.Item key="reports:3">
                  <Link
                    to="/customerReport"
                    replace
                    style={{ textDecoration: 'none' }}
                  >
                    <Text>Customer Report</Text>
                  </Link>
                </Menu.Item>
                <Menu.Item key="reports:4">
                  <Link
                    to="/currencyReport"
                    replace
                    style={{ textDecoration: 'none' }}
                  >
                    <Text>Currency Report</Text>
                  </Link>
                </Menu.Item>
              </SubMenu>
            </Menu>
          </Row>
        </Header>
      </Layout>
      <Content className="site-layout" style={{ marginTop: 76 }}>
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
      </Content>
    </HashRouter>
  )
}
