import { Routes, Route, NavLink } from "react-router-dom";
import './App.css';
import About from './About';
import Home from './Home';
import Setup from './Setup';

function App() {
  return (
    <>
      <header className="header">
        <nav role="navigation">
          <ul>
            <li>
              <NavLink to="/setup">Setup</NavLink>
            </li>
            <li>
              <NavLink to="/crops">Crops</NavLink>
            </li>
            <li>
              <NavLink to="/seeds">Seeds</NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <Routes>
        <Route path="/setup/*" element={<Setup />} />
        <Route path="/crops" element={<About />} />
        <Route path="/seeds" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
