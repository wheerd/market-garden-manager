import {Suspense} from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {useTranslation} from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import {Link, NavLink, Route, Routes} from 'react-router-dom';

import LanguageSelect from './LanguageSelect';
import ReloadPrompt from './ReloadPrompt';
import Setup from './setup';

import 'react-loading-skeleton/dist/skeleton.css';

function App() {
  const {t} = useTranslation();
  return (
    <>
      <Navbar
        collapseOnSelect
        sticky="top"
        expand="lg"
        bg="primary"
        data-bs-theme="dark"
      >
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            {t('app_title')}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav variant="pill" className="me-auto container-fluid">
              <Nav.Item>
                <Nav.Link as={NavLink} to="/">
                  {t('nav_home')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/setup">
                  {t('nav_setup')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/crops">
                  {t('nav_crops')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/seeds">
                  {t('nav_seeds')}
                </Nav.Link>
              </Nav.Item>
              <LanguageSelect className="ms-auto" align="end" />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" index element={'Home'} />
        <Route
          path="/setup/*"
          element={
            <Suspense fallback={<Skeleton />}>
              <Setup />
            </Suspense>
          }
        />
        <Route path="/crops" element={'Crops'} />
        <Route path="/seeds" element={'Seeds'} />
      </Routes>

      <ReloadPrompt />
    </>
  );
}

export default App;
