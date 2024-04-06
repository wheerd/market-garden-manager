import React, {Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import Skeleton from 'react-loading-skeleton';
import {BrowserRouter} from 'react-router-dom';

import App from './App';

import './i18n';

import './index.scss';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Suspense fallback={<Skeleton height={'100%'} />}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </Suspense>
    </React.StrictMode>
  );
}
