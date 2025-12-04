module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['@payloadcms', 'plugin:@next/next/recommended', 'next/core-web-vitals', 'next/typescript', 'plugin:prettier/recommended', 'plugin:react-hooks/recommended'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'no-var': 'error',
    'import/extensions': 'off',
  },
}
