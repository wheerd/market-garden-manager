import Toast from 'react-bootstrap/Toast';

import {useRegisterSW} from 'virtual:pwa-register/react';
import Button from 'react-bootstrap/esm/Button';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <Toast show={offlineReady || needRefresh} onClose={close}>
      <Toast.Body>
        {offlineReady ? (
          <span>App ready to work offline</span>
        ) : (
          <span>New content available, click on reload button to update.</span>
        )}
        {needRefresh && (
          <Button onClick={() => void updateServiceWorker(true)}>Reload</Button>
        )}
      </Toast.Body>
    </Toast>
  );
}

export default ReloadPrompt;
