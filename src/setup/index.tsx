import React, {Suspense, lazy} from 'react';
import {NavLink, Route, Routes} from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Skeleton from 'react-loading-skeleton';

const Location = lazy(() => import('./location'));
const Beds = lazy(() => import('./beds'));
const Basic = lazy(() => import('./basic'));
import './index.css';

const Setup: React.FC = () => (
  <div>
    <Nav variant="tabs" className="justify-content-center">
      <Nav.Item>
        <Nav.Link as={NavLink} to="." end>
          Basic
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="location">
          Location
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="beds">
          Beds
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="crops">
          Crops
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="plan">
          Target Plan
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="csa">
          CSA
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="tasks">
          Tasks
        </Nav.Link>
      </Nav.Item>
    </Nav>

    <div className="content-wrapper">
      <Routes>
        <Route
          path="location"
          element={
            <Suspense fallback={<Skeleton />}>
              <Location />
            </Suspense>
          }
        />
        <Route
          path="beds"
          element={
            <Suspense fallback={<Skeleton />}>
              <Beds />
            </Suspense>
          }
        />
        <Route path="crops" element={'Crops'} />
        <Route path="plan" element={'Plan'} />
        <Route path="csa" element={'CSA'} />
        <Route path="tasks" element={'Tasks'} />
        <Route
          element={
            <Suspense fallback={<Skeleton />}>
              <Basic />
            </Suspense>
          }
          index
        />
      </Routes>
    </div>
  </div>
);

export default Setup;
