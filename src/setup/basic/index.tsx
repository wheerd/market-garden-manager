import {useTranslation} from 'react-i18next';

import LanguageSelect from './LanguageSelect';

const Basic: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div>
      {t('language_label')}
      <LanguageSelect />
    </div>
  );
};

export default Basic;
