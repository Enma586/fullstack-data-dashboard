/**
 * Configuración de Jest para el backend del dashboard Olist.
 *
 * Utiliza el preset ts-jest para compilar TypeScript sobre la marcha.
 * Busca tests en el directorio <rootDir>/tests con el patrón **/*.test.ts.
 * La cobertura se recopila desde src/**/*.ts y se genera en formato text y lcov.
 *
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
};
