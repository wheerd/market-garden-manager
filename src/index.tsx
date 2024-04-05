import React, {Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from 'react-router-dom';

import './i18n';

import './index.scss';
import Skeleton from 'react-loading-skeleton';

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
