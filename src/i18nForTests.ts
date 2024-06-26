import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'cimode',
  fallbackLng: 'cimode',
  appendNamespaceToCIMode: false,
  ns: ['default'],
  defaultNS: 'default',
  debug: true,
});

export default i18n;
