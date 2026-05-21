const {FlatCompat} = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('@react-native'),
  {
    files: ['e2e/**/*.js'],
    languageOptions: {
      globals: {
        device: 'readonly',
        element: 'readonly',
        by: 'readonly',
        expect: 'readonly',
        waitFor: 'readonly',
      },
    },
  },
];
