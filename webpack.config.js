const path = require('path')

module.exports = {
  entry: './src/index.ts',
  target: 'web',
  mode: 'production',
  // devtool,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: ['src', 'node_modules'],
  },
  output: {
    filename: 'nc.main.bundle.js',
    chunkFilename: 'nc.vendors.main.bundle.js',
    path: path.join(__dirname, 'web-bundle'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}
