const path = require('path');

module.exports = {
  entry: './src/index.ts',
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
  },
  output: {
    filename: 'ga-emulator.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'gaEmulator',
      type: 'umd'
    }
  },
  optimization: {
    minimize: true
  }
};