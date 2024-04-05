/* eslint-disable node/no-unpublished-import */
import {UserConfig} from 'i18next-parser';

export default {
  locales: ['en', 'de'],
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{ts,tsx}'],
} as UserConfig;
