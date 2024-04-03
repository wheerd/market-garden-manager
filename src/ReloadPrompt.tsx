import Toast from 'react-bootstrap/Toast';

import {useRegisterSW} from 'virtual:pwa-register/react';
import Button from 'react-bootstrap/Button';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <Toast show={offlineReady || needRefresh} className="align-items-center">
      <div className="d-flex">
        <Toast.Body>
          {offlineReady ? (
            <span>App ready to work offline</span>
          ) : (
            <span>
              New content available, click on reload button to update.
            </span>
          )}
          {needRefresh && (
            <Button onClick={() => void updateServiceWorker(true)}>
              Reload
            </Button>
          )}
        </Toast.Body>
        <Button
          className="btn-close me-2 m-auto"
          onClick={close}
          aria-label="Close"
        ></Button>
      </div>
    </Toast>
  );
}

export default ReloadPrompt;
