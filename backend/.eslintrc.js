/**
 * Configuración de ESLint para el backend del dashboard Olist.
 *
 * Entornos: node, es2022, jest.
 * Parser: @typescript-eslint/parser con ECMAScript 2022 y módulos ES.
 * Plugins: @typescript-eslint, import.
 * Extiende: recomendaciones de ESLint, recomendaciones de TypeScript y Prettier.
 *
 * Reglas destacadas:
 *   - no-unused-vars como warning (ignorando args que empiezan con _)
 *   - import/order para mantener imports ordenados por grupos
 *   - no-console como warning (permite warn, error, info)
 *   - eqeqeq (siempre usar ===), curly (obligatorio en todos los bloques)
 *   - no-throw-literal (solo lanzar instancias de Error)
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-throw-literal': 'error',
  },
};
