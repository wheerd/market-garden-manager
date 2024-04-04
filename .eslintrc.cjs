module.exports = {
  root: true,
  env: {browser: true, es2020: true},
  extends: [
    './node_modules/gts/',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: ['vitest', '@testing-library/react'],
      },
    ],
  },
};
