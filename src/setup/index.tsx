import React, {Suspense, lazy} from 'react';
import Nav from 'react-bootstrap/Nav';
import {useTranslation} from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import {NavLink, Route, Routes} from 'react-router-dom';

const Location = lazy(() => import('./location'));
const Beds = lazy(() => import('./beds'));
const Basic = lazy(() => import('./basic'));
const Crops = lazy(() => import('./crops'));

import './index.css';

const Setup: React.FC = () => {
  const {t} = useTranslation();
  return (
    <div>
      <Nav variant="tabs" className="settings-tabs">
        <Nav.Item>
          <Nav.Link as={NavLink} to="." end>
            {t('nav_setup_basic')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="location">
            {t('nav_setup_location')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="beds">
            {t('nav_setup_beds')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="crops">
            {t('nav_setup_crops')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="plan">
            {t('nav_setup_plan')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="csa">
            {t('nav_setup_csa')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="tasks">
            {t('nav_setup_tasks')}
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
          <Route
            path="crops"
            element={
              <Suspense fallback={<Skeleton />}>
                <Crops />
              </Suspense>
            }
          />
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
};

export default Setup;
