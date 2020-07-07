const unitConfig = require('../jest.config')

module.exports = {
  ...unitConfig,
  testMatch: ['**/specs/stress/*.spec.ts'],
  setupFilesAfterEnv: ['../setup.ts'],
}
