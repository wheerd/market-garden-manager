import { Routes, Route, NavLink } from "react-router-dom";
import './App.css';
import About from './About';
import Home from './Home';
import Setup from './Setup';
import { useRegisterSW } from "virtual:pwa-register/react";

function App() {
  useRegisterSW({
    immediate: true,
    onOfflineReady() { console.log('offline ready') },
    onRegisteredSW() { console.log('registered SW') },
    onRegisterError() { console.error('error registering SW') },
    onNeedRefresh() { console.log('need refresh') }
  })

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
