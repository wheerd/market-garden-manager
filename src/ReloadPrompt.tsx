import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import Toast from 'react-bootstrap/Toast';
import {useTranslation} from 'react-i18next';
import {useRegisterSW} from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {t} = useTranslation();

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
            <span>{t('offline_ready_prompt')}</span>
          ) : (
            <span>{t('reload_prompt')}</span>
          )}
          {needRefresh && (
            <Button onClick={() => void updateServiceWorker(true)}>
              {t('reload_button')}
            </Button>
          )}
        </Toast.Body>
        <CloseButton onClick={close} aria-label={t('close')}></CloseButton>
      </div>
    </Toast>
  );
}

export default ReloadPrompt;
