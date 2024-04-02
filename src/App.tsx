import {Routes, Route, NavLink, Link} from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import About from './About';
import Home from './Home';
import Setup from './setup';
import ReloadPrompt from './ReloadPrompt';

function App() {
  return (
    <>
      <Navbar
        collapseOnSelect
        sticky="top"
        expand="lg"
        bg="primary"
        data-bs-theme="dark"
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            Market Garden Manager
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav variant="pill" className="me-auto">
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
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" index />
        <Route path="/setup/*" element={<Setup />} />
        <Route path="/crops" element={<About />} />
        <Route path="/seeds" element={<Home />} />
      </Routes>

      <ReloadPrompt />
    </>
  );
}

export default App;
