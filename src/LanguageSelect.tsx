import {useState, useEffect, useMemo} from 'react';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {type AlignType} from 'react-bootstrap/types';
import {useTranslation} from 'react-i18next';

import 'flag-icons/css/flag-icons.min.css';
import './LanguageSelect.scss';

interface Language {
  name: string;
  code: string;
  flag: string;
  dir?: string;
}

const languages: Language[] = [
  {name: 'English', code: 'en', flag: 'us'},
  {name: 'Deutsch', code: 'de', flag: 'de'},
];

const LanguageSelect = (props: {align?: AlignType; className?: string}) => {
  const {t, i18n} = useTranslation();

  const [languageCode, setLanguageCode] = useState(i18n.language || 'en');
  const languageName = useMemo(
    () => languages.find(lang => lang.code === languageCode)?.name ?? '',
    [languageCode]
  );
  const languageFlag = useMemo(
    () => languages.find(lang => lang.code === languageCode)?.flag ?? '',
    [languageCode]
  );

  const onClick = (lang: string) => {
    setLanguageCode(lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const currentLangObj = languages.find(lang => lang.code === languageCode);
    document.body.dir = currentLangObj?.dir || 'ltr';
    document.title = t('app_title');
  }, [languageCode, t]);

  return (
    <NavDropdown
      title={
        <span
          className={`fi-${languageFlag} fis countryFlag`}
          aria-label={languageName}
        ></span>
      }
      {...props}
    >
      {languages.map(({name, code, flag}) => (
        <NavDropdown.Item
          key={code}
          onClick={() => onClick(code)}
          className={code === languageCode ? 'active' : ''}
        >
          <span className={`fi-${flag} fis countryFlag`} aria-hidden></span>
          {name}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default LanguageSelect;
