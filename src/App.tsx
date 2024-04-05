import {Suspense} from 'react';
import {Routes, Route, NavLink, Link} from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import Setup from './setup';
import ReloadPrompt from './ReloadPrompt';
import {useTranslation} from 'react-i18next';
import LanguageSelect from './LanguageSelect';

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
                  Home
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/setup">
                  Setup
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/crops">
                  Crops
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/seeds">
                  Seeds
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
