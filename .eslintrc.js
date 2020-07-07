module.exports = {
  settings: { react: { version: "16.9.0" } },
  extends: ['liquidity'],
  env: {
    "node": true,
    "jest": true
  },
  plugins: ["jest"],
  rules: {
    'no-case-declarations': 0,
    'standard/no-callback-literal': 0,
  },
};
