import {useState, useEffect, ChangeEvent} from 'react';
import {useTranslation} from 'react-i18next';

interface Language {
  name: string;
  code: string;
  dir?: string;
}

const languages: Language[] = [
  {name: 'English', code: 'en'},
  {name: 'Deutsch', code: 'de'},
];

const LanguageSelect = () => {
  const {t, i18n} = useTranslation();

  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleChangeLocale = (e: ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const currentLangObj = languages.find(lang => lang.code === language);

  useEffect(() => {
    document.body.dir = currentLangObj?.dir || 'ltr';
    document.title = t('app_title');
  }, [currentLangObj, t]);

  return (
    <select onChange={handleChangeLocale} value={language}>
      {languages.map(({name, code}) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelect;
