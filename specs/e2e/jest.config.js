const unitConfig = require('../jest.config')

module.exports = {
  ...unitConfig,
  testMatch: ['**/specs/e2e/*.spec.ts'],
  setupFilesAfterEnv: ['../setup.ts'],
}
